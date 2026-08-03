require('./dnsfix');
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
require('dotenv').config();

const seedUsers = [
  { username: 'admin', email: 'admin@hotel.com', password: 'admin123', role: 'admin' },
  { username: 'cashier', email: 'cashier@hotel.com', password: 'cashier123', role: 'staff' },
];

const seedEmployees = [
  { name: 'admin', email: 'admin@hotel.com', phone: '', position: 'Manager', department: 'Management', salary: 2500, isActive: true },
  { name: 'cashier', email: 'cashier@hotel.com', phone: '', position: 'Cashier', department: 'Front Office', salary: 1200, isActive: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB');

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created: ${u.email} (${u.role})`);
    } else {
      console.log(`Already exists: ${u.email}`);
    }

    const empExists = await Employee.findOne({ email: u.email });
    if (!empExists) {
      const emp = seedEmployees.find(e => e.email === u.email);
      if (emp) {
        await Employee.create(emp);
        console.log(`Created employee: ${emp.email}`);
      }
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
