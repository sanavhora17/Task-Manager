/**
 * Run this ONCE to create the admin account:
 *   node createAdmin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const ADMIN = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@taskflow.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@1234',
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN.email.toLowerCase() });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing user promoted to admin:', ADMIN.email);
      } else {
        console.log('ℹ️  Admin already exists:', ADMIN.email);
      }
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN.password, 10);
    await User.create({
      name: ADMIN.name,
      email: ADMIN.email.toLowerCase(),
      password: hashed,
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('   Email   :', ADMIN.email);
    console.log('   Password:', ADMIN.password);
    console.log('\n⚠️  Keep these credentials safe. Do not share.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
