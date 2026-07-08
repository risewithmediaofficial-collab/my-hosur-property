const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/myhosurproperty';

async function main() {
  console.log('[inspect] Connecting to', MONGO);
  await mongoose.connect(MONGO);
  const User = require('../src/models/User');

  console.log('[inspect] Current indexes on users collection:');
  const indexes = await User.collection.indexes();
  console.log(JSON.stringify(indexes, null, 2));

  const nullEmailCount = await User.countDocuments({ email: null });
  const emptyEmailCount = await User.countDocuments({ email: '' });
  const missingEmailCount = await User.countDocuments({ email: { $exists: false } });
  console.log('[inspect] Counts -> null:', nullEmailCount, 'empty:', emptyEmailCount, 'missing:', missingEmailCount);

  if (nullEmailCount > 0) {
    const sample = await User.find({ email: null }).limit(5).select('_id name phone email').lean();
    console.log('[inspect] Sample docs with email:null', JSON.stringify(sample, null, 2));
  }

  if (emptyEmailCount > 0) {
    const sample = await User.find({ email: '' }).limit(5).select('_id name phone email').lean();
    console.log('[inspect] Sample docs with email:""', JSON.stringify(sample, null, 2));
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[inspect] Error:', err);
  process.exit(1);
});
