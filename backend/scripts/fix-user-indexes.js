const mongoose = require('mongoose');
const path = require('path');

// Load env if present
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/myhosurproperty';

async function main() {
  console.log('[migration] Connecting to', MONGO);
  await mongoose.connect(MONGO);

  // Require the User model after mongoose connect
  const User = require('../src/models/User');

  console.log('[migration] Unsetting null or non-string email/phone fields');
  const unsetEmail = await User.updateMany({ email: { $in: [null, ''] } }, { $unset: { email: '' } });
  const unsetPhone = await User.updateMany({ phone: { $in: [null, ''] } }, { $unset: { phone: '' } });
  console.log('[migration] unset results:', { unsetEmail: unsetEmail.nModified || unsetEmail.modifiedCount, unsetPhone: unsetPhone.nModified || unsetPhone.modifiedCount });

  try {
    console.log('[migration] Dropping old indexes if present (safe to ignore errors)');
    // Drop prior indexes if they exist
    try { await User.collection.dropIndex('email_1'); } catch (e) { /* ignore */ }
    try { await User.collection.dropIndex('phone_1'); } catch (e) { /* ignore */ }
  } catch (e) {
    console.warn('[migration] dropIndex warnings:', e.message || e);
  }

  console.log('[migration] Ensuring partial unique indexes (email, phone)');
  await User.collection.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
  await User.collection.createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

  console.log('[migration] Done — closing connection.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[migration] Error:', err);
  process.exit(1);
});
