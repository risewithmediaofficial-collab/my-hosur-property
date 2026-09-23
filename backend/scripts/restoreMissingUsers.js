const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function restore() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || 'myhosurproperty' });
  const usersColl = mongoose.connection.collection('users');

  const defaultPassword = await bcrypt.hash('Hosur@1234', 10);

  const alluringId = new mongoose.Types.ObjectId('6a0176af3bce3462f5da944b');
  const rajaId = new mongoose.Types.ObjectId('6a016c7a65129b099ef4668b');

  const existingAlluring = await usersColl.findOne({ _id: alluringId });
  if (!existingAlluring) {
    await usersColl.insertOne({
      _id: alluringId,
      name: 'Alluring',
      email: 'alluringrealtysupport@gmail.com',
      phone: '918248918906',
      role: 'agent',
      status: 'active',
      password: defaultPassword,
      canPostProperty: true,
      isDeleted: false,
      contactAccess: { monthlyLimit: 50, usedCount: 0, isPremium: true },
      leadCredits: 50,
      customerLeadCredits: 50,
      createdAt: new Date('2026-05-11T06:20:00.000Z'),
      updatedAt: new Date(),
    });
    console.log('Successfully restored Alluring (agent)!');
  } else {
    console.log('Alluring already exists:', existingAlluring.name);
  }

  const existingRaja = await usersColl.findOne({ _id: rajaId });
  if (!existingRaja) {
    await usersColl.insertOne({
      _id: rajaId,
      name: 'Raja',
      email: 'raja.seller@myhosurproperty.com',
      phone: '9865321470',
      role: 'seller',
      status: 'active',
      password: defaultPassword,
      canPostProperty: true,
      isDeleted: false,
      contactAccess: { monthlyLimit: 20, usedCount: 0, isPremium: false },
      createdAt: new Date('2026-05-11T05:30:00.000Z'),
      updatedAt: new Date(),
    });
    console.log('Successfully restored Raja (seller)!');
  } else {
    console.log('Raja already exists:', existingRaja.name);
  }

  const totalUsers = await usersColl.countDocuments();
  console.log(`Total users in DB now: ${totalUsers}`);
  process.exit(0);
}

restore().catch(e => {
  console.error(e);
  process.exit(1);
});
