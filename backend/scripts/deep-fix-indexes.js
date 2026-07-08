const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/myhosurproperty';

async function main() {
  console.log('[deep-fix] Connecting to MongoDB...');
  await mongoose.connect(MONGO);

  // Use raw MongoDB driver collection (bypasses Mongoose index caching)
  const col = mongoose.connection.db.collection('users');

  // === STEP 1: Show current indexes ===
  console.log('\n[deep-fix] === CURRENT INDEXES ===');
  const beforeIndexes = await col.indexes();
  beforeIndexes.forEach(idx => console.log(' ', JSON.stringify(idx)));

  const nullEmailBefore  = await col.countDocuments({ email: null });
  const emptyEmailBefore = await col.countDocuments({ email: '' });
  const nullPhoneBefore  = await col.countDocuments({ phone: null });
  const emptyPhoneBefore = await col.countDocuments({ phone: '' });
  console.log('\n[deep-fix] Docs with email:null  =>', nullEmailBefore);
  console.log('[deep-fix] Docs with email:""    =>', emptyEmailBefore);
  console.log('[deep-fix] Docs with phone:null  =>', nullPhoneBefore);
  console.log('[deep-fix] Docs with phone:""    =>', emptyPhoneBefore);

  // === STEP 2: Unset null/empty email and phone (raw driver) ===
  const r1 = await col.updateMany({ email: { $in: [null, ''] } }, { $unset: { email: '' } });
  const r2 = await col.updateMany({ phone: { $in: [null, ''] } }, { $unset: { phone: '' } });
  console.log('\n[deep-fix] Unset email modifiedCount =>', r1.modifiedCount);
  console.log('[deep-fix] Unset phone modifiedCount =>', r2.modifiedCount);

  // === STEP 3: Drop ALL email/phone-related indexes ===
  console.log('\n[deep-fix] Dropping all email/phone indexes...');
  const allIndexes = await col.indexes();
  for (const idx of allIndexes) {
    const keys = Object.keys(idx.key || {});
    if (keys.includes('email') || keys.includes('phone')) {
      try {
        await col.dropIndex(idx.name);
        console.log('  Dropped:', idx.name);
      } catch (e) {
        console.warn('  Could not drop', idx.name, ':', e.message);
      }
    }
  }

  // === STEP 4: Recreate correct partial unique indexes ===
  console.log('\n[deep-fix] Creating partial unique indexes...');
  await col.createIndex(
    { email: 1 },
    { unique: true, name: 'email_1', partialFilterExpression: { email: { $type: 'string' } } }
  );
  console.log('  Created email_1 (partial, unique)');

  await col.createIndex(
    { phone: 1 },
    { unique: true, name: 'phone_1', partialFilterExpression: { phone: { $type: 'string' } } }
  );
  console.log('  Created phone_1 (partial, unique)');

  // === STEP 5: Verify ===
  console.log('\n[deep-fix] === INDEXES AFTER FIX ===');
  const afterIndexes = await col.indexes();
  afterIndexes.forEach(idx => console.log(' ', JSON.stringify(idx)));

  const nullEmailAfter  = await col.countDocuments({ email: null });
  const emptyEmailAfter = await col.countDocuments({ email: '' });
  console.log('\n[deep-fix] Remaining email:null =>', nullEmailAfter);
  console.log('[deep-fix] Remaining email:""   =>', emptyEmailAfter);

  console.log('\n[deep-fix] ALL DONE. Indexes are fixed.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('[deep-fix] FATAL ERROR:', err);
  process.exit(1);
});
