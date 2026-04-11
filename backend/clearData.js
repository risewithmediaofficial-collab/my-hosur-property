const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const Lead = require('./src/models/Lead');
const Payment = require('./src/models/Payment');
const CustomerRequest = require('./src/models/CustomerRequest');
const LeadUnlock = require('./src/models/LeadUnlock');
const Notification = require('./src/models/Notification');

async function clearData() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Clear all except Admin user and plans
  await Property.deleteMany({});
  await Lead.deleteMany({});
  await Payment.deleteMany({});
  await CustomerRequest.deleteMany({});
  await LeadUnlock.deleteMany({});
  await Notification.deleteMany({});
  
  await User.deleteMany({ role: { $ne: 'admin' } });
  
  console.log('Database cleared of properties, leads, requests, payments, notifications and non-admin users.');
  process.exit(0);
}
clearData().catch(err => { console.error(err); process.exit(1); });
