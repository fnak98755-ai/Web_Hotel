const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = [
  { username: 'admin', email: 'admin@hotel.com', password: 'admin123', role: 'admin' },
  { username: 'cashier', email: 'cashier@hotel.com', password: 'cashier123', role: 'staff' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created: ${u.email} (${u.role})`);
    } else {
      console.log(`Already exists: ${u.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nSeed complete. Default users:');
  console.log('  Admin:  admin@hotel.com / admin123');
  console.log('  Cashier: cashier@hotel.com / cashier123');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
