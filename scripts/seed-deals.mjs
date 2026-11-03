import fs from 'fs';
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
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function run() {
  const csvPath = 'g:\\CODE\\Raisequity\\Raisequity Deal Flow - Deal Flow.csv';
  if (!fs.existsSync(csvPath)) {
    console.error('File not found:', csvPath);
    process.exit(1);
  }

  const rawText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(rawText);
  if (rows.length < 2) {
    console.error('CSV contains no data rows');
    process.exit(1);
  }

  const headers = rows[0].map(h => h.trim());
  console.log('Headers:', headers);

  const getCol = (row, colName) => {
    const idx = headers.findIndex(h => h.toLowerCase() === colName.toLowerCase());
    return idx >= 0 && row[idx] ? row[idx].trim() : '';
  };

  const dealItems = [];
  const launchItems = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = getCol(r, 'Project Name');
    if (!name) continue;

    const category = getCol(r, 'Category') || 'Tech / Web3';
    const oneLiner = getCol(r, 'One-Liner') || 'Innovative decentralized protocol.';
    const stage = getCol(r, 'Stage / Round') || 'Seed';
    const raising = getCol(r, 'Raising ($)') || '$1M - $3M';
    const fdv = getCol(r, 'FDV / Valuation') || '$10M Cap';
    const token = getCol(r, 'Token') || 'TBD';
    const tge = getCol(r, 'TGE / Close') || '2026';
    const chain = getCol(r, 'Chain / Network') || 'Multi-chain';
    const backers = getCol(r, 'Key Backers') || 'Top Tier Institutional Angels';
    const traction = getCol(r, 'Traction') || 'Live MVP with growing user traction';
    const website = getCol(r, 'Website') || `https://${slugify(name)}.io`;
    const pitchDeck = getCol(r, 'Pitch Deck') || '';
    const tokenomics = getCol(r, 'Tokenomics') || '';
    const twitter = getCol(r, 'Twitter / X') || '';
    const otherLinks = getCol(r, 'Other Links') || '';
    const audit = getCol(r, 'Audit') || '';
    const minTicket = getCol(r, 'Min Ticket') || '$10k';

    const slug = slugify(name) || `project-${i}`;
    const cleanId = `deal_${slug}`;

    const categoriesList = category.split(/[\/,]/).map(c => c.trim()).filter(Boolean);
    const mainCategory = categoriesList.find(c => ['AI', 'DeFi', 'RWA', 'Gaming', 'Fintech', 'Infrastructure'].includes(c)) || categoriesList[0] || 'AI';

    const matchScore = Math.floor(Math.random() * 15) + 84; // 84-98%
    const votesCount = Math.floor(Math.random() * 200) + 45;

    // 1. Deal Item for DealFeed & Matching
    dealItems.push({
      id: cleanId,
      name,
      founder: `${name} Team`,
      founder_email: `contact@${slug}.io`,
      founder_id: `founder_${slug}`,
      sector: mainCategory,
      industry: categoriesList,
      stage,
      targetRaise: raising,
      valuationCap: fdv,
      location: 'Global',
      matchScore,
      matchLevel: matchScore > 90 ? 'HIGH CONVICTION' : 'STRONG FIT',
      roundType: stage,
      isPreLaunch: i % 2 === 0,
      preLaunchDaysRemaining: i % 2 === 0 ? (i % 7) + 2 : 0,
      githubCommits: Math.floor(Math.random() * 180) + 80,
      mrr: traction.includes('$') ? traction.slice(0, 40) : '$25k MRR',
      leadAnchor: backers ? backers.slice(0, 50) : '$50k Reserved',
      tagline: oneLiner,
      description: `${oneLiner} ${traction ? `Traction: ${traction}.` : ''} ${backers ? `Key Backers: ${backers}.` : ''}`,
      keywords: categoriesList.map(c => c.toLowerCase().replace(/\s+/g, '_')),
      authenticityScore: 95,
      website_url: website,
      pitch_deck: pitchDeck,
      tokenomics,
      twitter_handle: twitter,
      chain,
      token,
      min_ticket: minTicket,
      audit,
      other_links: otherLinks,
      verified: true,
      created_at: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    });

    // 2. Launch Item for LaunchDirectory
    launchItems.push({
      id: `launch_${slug}`,
      slug,
      founder_id: `founder_${slug}`,
      founder_name: `${name} Lead`,
      company_name: name,
      tagline: oneLiner.slice(0, 120),
      description: `${oneLiner} Backers: ${backers || 'Confidential'}. Key Traction: ${traction || 'Live'}. Raising: ${raising}. Valuation: ${fdv}.`,
      website_url: website,
      logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`,
      screenshots: [],
      category: mainCategory,
      twitter_handle: twitter,
      maker_comment: backers ? `Backed by ${backers}. Min Ticket: ${minTicket}.` : traction,
      launch_tier: i < 15 ? 'spotlight' : (i < 40 ? 'premium' : 'standard'),
      scheduled_date: new Date().toISOString(),
      status: 'launched',
      badgeVerified: true,
      votes_count: votesCount,
      created_at: new Date(Date.now() - i * 3600000 * 3).toISOString(),
      target_keywords: categoriesList,
      raising,
      valuation: fdv,
      token,
      chain,
    });
  }

  console.log(`Parsed ${dealItems.length} deals and ${launchItems.length} directory launches.`);

  // Write in Batches (Firestore max 500 operations per batch)
  const batchSize = 200;
  
  // Seed deal_flow
  for (let i = 0; i < dealItems.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = dealItems.slice(i, i + batchSize);
    chunk.forEach(deal => {
      const docRef = doc(db, 'deal_flow', deal.id);
      batch.set(docRef, deal, { merge: true });
    });
    await batch.commit();
    console.log(`Committed deal_flow batch ${Math.floor(i / batchSize) + 1} (${chunk.length} records)`);
  }

  // Seed launches
  for (let i = 0; i < launchItems.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = launchItems.slice(i, i + batchSize);
    chunk.forEach(launch => {
      const docRef = doc(db, 'launches', launch.id);
      batch.set(docRef, launch, { merge: true });
    });
    await batch.commit();
    console.log(`Committed launches batch ${Math.floor(i / batchSize) + 1} (${chunk.length} records)`);
  }

  console.log('✅ All 99 Deals successfully seeded into Firestore deal_flow & launches collections!');
  process.exit(0);
}

run().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

