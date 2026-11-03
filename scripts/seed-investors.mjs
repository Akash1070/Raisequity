/**
 * High-Performance Firestore Investor Seeder
 * 
 * Ingests and seeds the 4,230+ VC and Angel investors into Firestore.
 * 
 * Security & Anti-Scraping Compliance:
 * - Public document `web3_investors/{id}` contains ONLY masked contact hints (e.g. p***@domain.com)
 * - Raw emails, telegrams, and private contact info are written to `web3_investors/{id}/private/contact`
 * - Reading `private/contact` is locked by firestore.rules to Admins and founders who have paid 1 credit.
 * - Uses Firestore writeBatch (400 ops / batch) for sub-second execution.
 */

import fs from 'fs';
import crypto from 'crypto';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDA2sTTcOvZFvlA0h3Tf1echp84saV82iQ',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'raisequity-5d862.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'raisequity-5d862',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'raisequity-5d862.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '53852364116',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:53852364116:web:f0ac19be0beb73efaf7cc1',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function cleanDomainToFirm(email) {
  if (!email || !email.includes('@')) return 'Independent Syndicate';
  const domain = email.split('@')[1]?.toLowerCase();
  const common = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'me.com'];
  if (common.includes(domain)) return 'Angel Allocator';
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1) + ' Capital';
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'e***@vc.com';
  const [user, domain] = email.split('@');
  return `${user.charAt(0)}***@${domain}`;
}

function maskTelegram(tg) {
  if (!tg) return '';
  const clean = tg.replace(/^@/, '');
  return `@${clean.charAt(0)}***`;
}

async function run() {
  console.log('====================================================');
  console.log('   RAISEQUITY HIGH-PERFORMANCE INVESTOR SEEDER      ');
  console.log('====================================================');

  const investorsMap = new Map();

  // 1. Ingest File 1: Ramp's VC & Angel Database
  const file1 = "Fund Database-Ramp's VC & Angel Email Database - Fund Database-Ramp's VC & Angel Email Database.csv.csv";
  if (fs.existsSync(file1)) {
    console.log(`[1/3] Parsing "${file1}"...`);
    const rows1 = parseCSV(fs.readFileSync(file1, 'utf8'));
    for (let i = 1; i < rows1.length; i++) {
      const r = rows1[i];
      const firm = r[0]?.trim();
      const partnerName = r[5]?.trim() || (firm ? `${firm} Partner` : 'Verified Partner');
      const email = r[6]?.trim().toLowerCase();
      const key = email || `${firm}_${partnerName}`.toLowerCase();
      if (!key || (!firm && !partnerName)) continue;

      const sectors = (r[4] || 'Tech, Software, Web3')
        .split(/[,;|]/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);

      const portfolio = (r[7] || '')
        .split(/[,;|]/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
        .slice(0, 8);

      investorsMap.set(key, {
        name: partnerName,
        firm: firm || 'Venture Partner',
        category: r[1]?.trim() || 'VC Fund',
        stage: r[2]?.trim() || 'Seed',
        website: r[3]?.trim() || '',
        sectors: sectors.length ? sectors : ['Web3', 'AI', 'SaaS'],
        location: r[8]?.trim() || 'Global',
        twitter: r[9]?.trim() || '',
        linkedin: r[10]?.trim() || '',
        portfolio,
        description: r[14]?.trim() || `${firm} invests in high-conviction early stage teams.`,
        check_size: r[2]?.toLowerCase().includes('seed') ? '$100k - $500k' : '$250k - $1M',
        rawEmail: email || '',
        rawTelegram: '',
        rawLinkedIn: r[10]?.trim() || '',
        verified: true,
        know_count: 0
      });
    }
    console.log(`      -> Extracted records so far: ${investorsMap.size}`);
  }

  // 2. Ingest File 2: Master Opt-in Investors
  const file2 = 'raisequity_investors_master.csv';
  if (fs.existsSync(file2)) {
    console.log(`[2/3] Parsing "${file2}"...`);
    const rows2 = parseCSV(fs.readFileSync(file2, 'utf8'));
    for (let i = 1; i < rows2.length; i++) {
      const r = rows2[i];
      const fullName = r[1]?.trim();
      const email = (r[2]?.trim() || r[8]?.trim())?.toLowerCase();
      const telegram = r[3]?.trim();
      const key = email || `${fullName}`.toLowerCase();
      if (!key || (!fullName && !email)) continue;

      const sectors = (r[4] || 'Venture Capital, Web3, FinTech')
        .split(/[,;|]/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);

      const existing = investorsMap.get(key);
      if (existing) {
        if (telegram && !existing.rawTelegram) existing.rawTelegram = telegram;
        if (!existing.name || existing.name.includes('Partner')) existing.name = fullName;
      } else {
        const firm = cleanDomainToFirm(email);
        investorsMap.set(key, {
          name: fullName || 'Verified Investor',
          firm,
          category: (r[5] || '').toLowerCase().includes('angel') ? 'Angel Investor' : 'VC Fund',
          stage: 'Pre-Seed / Seed',
          website: email && email.includes('@') ? `https://${email.split('@')[1]}` : '',
          sectors: sectors.length ? sectors : ['Web3', 'DeFi', 'AI & Agents'],
          location: 'Global',
          twitter: '',
          linkedin: '',
          portfolio: [],
          description: r[5]?.trim() || 'Active check-writer evaluating early stage Web3 & SaaS deals.',
          check_size: '$50k - $250k',
          rawEmail: email || '',
          rawTelegram: telegram || '',
          rawLinkedIn: '',
          verified: true,
          know_count: 0
        });
      }
    }
    console.log(`      -> Total deduplicated unique investors: ${investorsMap.size}`);
  }

  const allInvestors = Array.from(investorsMap.entries());
  console.log(`[3/3] Seeding ${allInvestors.length} records into Firestore in batched transactions...`);

  // Batching: 200 investors per batch = 400 document writes (well under Firestore 500 limit)
  const CHUNK_SIZE = 200;
  let batchIndex = 0;
  const totalBatches = Math.ceil(allInvestors.length / CHUNK_SIZE);
  let totalCommitted = 0;

  for (let i = 0; i < allInvestors.length; i += CHUNK_SIZE) {
    batchIndex++;
    const chunk = allInvestors.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const [key, inv] of chunk) {
      // Deterministic ID so script can be safely re-run without duplicate creation
      const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 20);
      const docId = `inv_${hash}`;
      const docRef = doc(db, 'web3_investors', docId);

      // Public Document (Safe: Masked contacts only)
      batch.set(docRef, {
        name: inv.name,
        firm: inv.firm,
        category: inv.category,
        role: inv.category === 'Angel Investor' ? 'Angel Investor' : 'General Partner',
        sectors: inv.sectors,
        stage: inv.stage,
        check_size: inv.check_size,
        location: inv.location,
        portfolio: inv.portfolio,
        website: inv.website,
        twitter: inv.twitter,
        linkedin: inv.linkedin,
        description: inv.description,
        email: maskEmail(inv.rawEmail),
        telegram: maskTelegram(inv.rawTelegram),
        has_contact: Boolean(inv.rawEmail || inv.rawTelegram),
        contacts_migrated: true,
        verified: true,
        know_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });

      // Private Subcollection Document (Protected: Raw contacts only accessible by Admin & paid unlocks)
      if (inv.rawEmail || inv.rawTelegram || inv.rawLinkedIn) {
        const privRef = doc(db, 'web3_investors', docId, 'private', 'contact');
        batch.set(privRef, {
          investorId: docId,
          email: inv.rawEmail || '',
          telegram: inv.rawTelegram || '',
          linkedin: inv.rawLinkedIn || '',
          migratedAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    await batch.commit();
    totalCommitted += chunk.length;
    console.log(`   ✓ Committed Batch ${batchIndex}/${totalBatches} (${chunk.length} investors, ${totalCommitted}/${allInvestors.length} total)`);
  }

  console.log('====================================================');
  console.log(`🎉 SUCCESS! Seeded ${totalCommitted} investors into Firestore.`);
  console.log('   - Public documents written with MASKED contact hints');
  console.log('   - Private contacts secured in web3_investors/{id}/private/contact');
  console.log('   - Unlocked exclusively via 1 Credit per founder unlock');
  console.log('====================================================');
}

run().catch(err => {
  console.error('Seeder execution error:', err);
  process.exit(1);
});

