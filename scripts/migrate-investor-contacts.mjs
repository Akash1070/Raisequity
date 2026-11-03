/**
 * Migration Script: Migrate Web3 Investor Sensitive Contacts to Private Subcollection
 * 
 * Usage:
 *   node scripts/migrate-investor-contacts.mjs [--dry-run]
 * 
 * Purpose:
 *   Solves P0 Security Risk: In the past, raw email and telegram addresses were stored
 *   directly in the public `web3_investors` document. This script moves real contact details
 *   into `web3_investors/{id}/private/contact` (which is protected by Firestore Rules to only
 *   be readable by Admins and users who have unlocked that specific investor ID).
 *   The parent document is updated to store only masked hints.
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc 
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

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'e***@vc.com';
  const [name, domain] = email.split('@');
  return `${name.charAt(0)}***@${domain}`;
}

function maskTelegram(tg) {
  if (!tg) return '';
  const clean = tg.replace(/^@/, '');
  return `@${clean.charAt(0)}***`;
}

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`[Migration] Starting Web3 Investor contact migration... ${isDryRun ? '(DRY RUN)' : ''}`);

  const snap = await getDocs(collection(db, 'web3_investors'));
  console.log(`[Migration] Found ${snap.size} investor documents.`);

  let migratedCount = 0;
  let alreadyMigratedCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;

    // Check if contacts already migrated
    if (data.contacts_migrated) {
      alreadyMigratedCount++;
      continue;
    }

    const rawEmail = data.email || '';
    const rawTelegram = data.telegram || '';

    // If both are empty or already masked, mark as migrated
    const isAlreadyMasked = rawEmail.includes('***') || rawTelegram.includes('***');
    if (!rawEmail && !rawTelegram) {
      if (!isDryRun) {
        await updateDoc(doc(db, 'web3_investors', id), { contacts_migrated: true });
      }
      continue;
    }

    if (isDryRun) {
      console.log(`[Dry Run] Would migrate investor: ${data.name || id} (${rawEmail})`);
      migratedCount++;
      continue;
    }

    // 1. Write to private subcollection: web3_investors/{id}/private/contact
    const privateRef = doc(db, 'web3_investors', id, 'private', 'contact');
    await setDoc(privateRef, {
      investorId: id,
      email: rawEmail,
      telegram: rawTelegram,
      migratedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Update parent document with masked contact hints
    await updateDoc(doc(db, 'web3_investors', id), {
      email: maskEmail(rawEmail),
      telegram: maskTelegram(rawTelegram),
      has_contact: Boolean(rawEmail || rawTelegram),
      contacts_migrated: true,
      updated_at: new Date().toISOString()
    });

    migratedCount++;
    if (migratedCount % 20 === 0) {
      console.log(`[Migration] Migrated ${migratedCount} investors...`);
    }
  }

  console.log(`\n==============================================`);
  console.log(`[Migration Complete]`);
  console.log(`Total processed: ${snap.size}`);
  console.log(`Newly migrated: ${migratedCount}`);
  console.log(`Already migrated: ${alreadyMigratedCount}`);
  console.log(`==============================================\n`);
}

runMigration().catch(err => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});

