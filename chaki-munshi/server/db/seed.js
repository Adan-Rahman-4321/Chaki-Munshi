// ============================================================================
// Chaki Munshi - Seed Script (OPTIONAL)
// Populates the Turso cloud database with realistic sample data for demos.
// The deployed app starts with an EMPTY database; run this only if you want
// sample data:   npm run seed
// ============================================================================

import db, { initDb } from './connection.js';

// Helpers ---------------------------------------------------------------------
function randomDate(daysBack = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString().replace('T', ' ').substring(0, 19);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}
function formatDateForInvoice(dateStr) {
  const d = new Date(dateStr.replace(' ', 'T'));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function seed() {
  await initDb();

  console.log('🗑️  Clearing existing data...');
  await db.executeMultiple(`
    DELETE FROM atta_issues;
    DELETE FROM wheat_entries;
    DELETE FROM expenses;
    DELETE FROM customers;
    DELETE FROM sqlite_sequence;
  `);

  // Customers -----------------------------------------------------------------
  console.log('👤 Seeding customers...');
  const customers = [
    { name: 'Muhammad Aslam',    phone: '0300-1234567', address: 'Mohalla Qadirabad, Gujranwala' },
    { name: 'Haji Abdul Rasheed', phone: '0321-9876543', address: 'Chowk Bazaar, Faisalabad' },
    { name: 'Fatima Bibi',       phone: '0333-4567890', address: 'Mohalla Sadat, Jhang' },
    { name: 'Rana Zafar Iqbal',  phone: '0345-1122334', address: 'GT Road, Kamoke' },
    { name: 'Ghulam Mustafa',    phone: '0312-5566778', address: 'Grain Market, Hafizabad' },
    { name: 'Khadija Begum',     phone: '0300-7788990', address: 'Shah Nikka Bazaar, Lahore' },
    { name: 'Chaudhry Imran',    phone: '0346-3344556', address: 'Village Kot Pindi Das, Gujranwala' },
    { name: 'Sardar Akbar Khan', phone: '0315-6677889', address: 'Mandi Bahauddin Road, Phalia' },
    { name: 'Nasreen Akhtar',    phone: '0302-1122445', address: 'Saddar Bazaar, Sargodha' },
    { name: 'Malik Tariq Mehmood', phone: '0331-8899001', address: 'Pul Qainchi, Sheikhupura' },
  ];
  for (const c of customers) {
    const createdAt = randomDate(45);
    await db.execute({
      sql: 'INSERT INTO customers (name, phone, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      args: [c.name, c.phone, c.address, createdAt, createdAt],
    });
  }
  console.log(`   ✅ Inserted ${customers.length} customers`);

  // Wheat entries -------------------------------------------------------------
  console.log('🌾 Seeding wheat entries...');
  const wheatEntryData = [
    { customerId: 1, totalWeight: 120,  cleaningWeight: 3.5,  notes: 'Good quality Sharbati wheat', daysAgoVal: 28 },
    { customerId: 2, totalWeight: 250,  cleaningWeight: 8.0,  notes: 'Wheat from Okara mandi',      daysAgoVal: 25 },
    { customerId: 3, totalWeight: 80,   cleaningWeight: 2.0,  notes: 'Small batch for home use',     daysAgoVal: 22 },
    { customerId: 4, totalWeight: 500,  cleaningWeight: 15.0, notes: 'Bulk order - Faisalabad wheat', daysAgoVal: 20 },
    { customerId: 5, totalWeight: 180,  cleaningWeight: 5.5,  notes: 'Medium quality local wheat',   daysAgoVal: 18 },
    { customerId: 1, totalWeight: 200,  cleaningWeight: 6.0,  notes: 'Second batch this month',      daysAgoVal: 15 },
    { customerId: 6, totalWeight: 150,  cleaningWeight: 4.0,  notes: 'Fine grinding requested',      daysAgoVal: 12 },
    { customerId: 7, totalWeight: 320,  cleaningWeight: 10.0, notes: 'Chakwal region wheat',         daysAgoVal: 10 },
    { customerId: 8, totalWeight: 100,  cleaningWeight: 2.5,  notes: 'Organic wheat from village',   daysAgoVal: 8 },
    { customerId: 2, totalWeight: 400,  cleaningWeight: 12.0, notes: 'Premium wheat - repeat order', daysAgoVal: 7 },
    { customerId: 9, totalWeight: 90,   cleaningWeight: 2.0,  notes: 'First time customer',          daysAgoVal: 5 },
    { customerId: 3, totalWeight: 160,  cleaningWeight: 4.5,  notes: 'Desi wheat from Toba Tek Singh', daysAgoVal: 4 },
    { customerId: 10, totalWeight: 220, cleaningWeight: 7.0,  notes: 'Wheat for chapati flour',      daysAgoVal: 3 },
    { customerId: 4, totalWeight: 300,  cleaningWeight: 9.0,  notes: 'Bulk commercial order',        daysAgoVal: 2 },
    { customerId: 5, totalWeight: 140,  cleaningWeight: 3.5,  notes: 'Fresh harvest wheat',          daysAgoVal: 1 },
    { customerId: 1, totalWeight: 175,  cleaningWeight: 5.0,  notes: 'Regular monthly grinding',     daysAgoVal: 0 },
    { customerId: 6, totalWeight: 110,  cleaningWeight: 3.0,  notes: 'Fine atta for nan',            daysAgoVal: 0 },
    { customerId: 8, totalWeight: 260,  cleaningWeight: 8.0,  notes: 'Mixed variety wheat',          daysAgoVal: 0 },
  ];
  for (let index = 0; index < wheatEntryData.length; index++) {
    const entry = wheatEntryData[index];
    const createdAt = daysAgo(entry.daysAgoVal);
    const datePart = formatDateForInvoice(createdAt);
    const invoiceNo = `WHT-${datePart}-${String(index + 1).padStart(4, '0')}`;
    const netWeight = entry.totalWeight - entry.cleaningWeight;
    await db.execute({
      sql: `INSERT INTO wheat_entries (invoiceNo, customerId, totalWeight, cleaningWeight, netWeight, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [invoiceNo, entry.customerId, entry.totalWeight, entry.cleaningWeight,
             parseFloat(netWeight.toFixed(2)), entry.notes, createdAt],
    });
  }
  console.log(`   ✅ Inserted ${wheatEntryData.length} wheat entries`);

  // Atta issues ---------------------------------------------------------------
  console.log('🍞 Seeding atta issues...');
  const attaIssueData = [
    { customerId: 1, wheatEntryId: 1,    quantity: 115,  ratePerKg: 8,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 27 },
    { customerId: 2, wheatEntryId: 2,    quantity: 240,  ratePerKg: 8,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 24 },
    { customerId: 3, wheatEntryId: 3,    quantity: 77,   ratePerKg: 9,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 21 },
    { customerId: 4, wheatEntryId: 4,    quantity: 480,  ratePerKg: 7,  paymentMethod: 'Credit', paidFull: false, daysAgoVal: 19 },
    { customerId: 5, wheatEntryId: 5,    quantity: 170,  ratePerKg: 8,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 17 },
    { customerId: 1, wheatEntryId: 6,    quantity: 190,  ratePerKg: 8,  paymentMethod: 'Online', paidFull: true,  daysAgoVal: 14 },
    { customerId: 6, wheatEntryId: 7,    quantity: 144,  ratePerKg: 9,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 11 },
    { customerId: 7, wheatEntryId: 8,    quantity: 305,  ratePerKg: 7,  paymentMethod: 'Credit', paidFull: false, daysAgoVal: 9 },
    { customerId: 8, wheatEntryId: 9,    quantity: 95,   ratePerKg: 8,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 7 },
    { customerId: 2, wheatEntryId: 10,   quantity: 385,  ratePerKg: 7,  paymentMethod: 'Online', paidFull: true,  daysAgoVal: 6 },
    { customerId: 9, wheatEntryId: 11,   quantity: 86,   ratePerKg: 9,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 4 },
    { customerId: 3, wheatEntryId: 12,   quantity: 153,  ratePerKg: 8,  paymentMethod: 'Credit', paidFull: false, daysAgoVal: 3 },
    { customerId: 10, wheatEntryId: 13,  quantity: 210,  ratePerKg: 8,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 2 },
    { customerId: 4, wheatEntryId: 14,   quantity: 288,  ratePerKg: 7,  paymentMethod: 'Cash',   paidFull: true,  daysAgoVal: 1 },
    { customerId: 5, wheatEntryId: 15,   quantity: 135,  ratePerKg: 8,  paymentMethod: 'Online', paidFull: true,  daysAgoVal: 0 },
  ];
  for (let index = 0; index < attaIssueData.length; index++) {
    const issue = attaIssueData[index];
    const createdAt = daysAgo(issue.daysAgoVal);
    const datePart = formatDateForInvoice(createdAt);
    const invoiceNo = `FLR-${datePart}-${String(index + 1).padStart(4, '0')}`;
    const totalAmount = issue.quantity * issue.ratePerKg;
    let paidAmount = totalAmount;
    let remainingBalance = 0;
    if (!issue.paidFull) {
      paidAmount = Math.round(totalAmount * 0.6);
      remainingBalance = totalAmount - paidAmount;
    }
    await db.execute({
      sql: `INSERT INTO atta_issues (invoiceNo, customerId, wheatEntryId, quantity, ratePerKg, totalAmount, paymentMethod, paidAmount, remainingBalance, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [invoiceNo, issue.customerId, issue.wheatEntryId, issue.quantity, issue.ratePerKg,
             totalAmount, issue.paymentMethod, paidAmount, remainingBalance, createdAt],
    });
  }
  console.log(`   ✅ Inserted ${attaIssueData.length} atta issues`);

  // Expenses ------------------------------------------------------------------
  console.log('💰 Seeding expenses...');
  const expenseData = [
    { category: 'Electricity',   description: 'WAPDA bill - May',                  amount: 45000,  daysAgoVal: 28 },
    { category: 'Labor',         description: 'Workers monthly salary - Akram & Shafiq', amount: 60000, daysAgoVal: 25 },
    { category: 'Fuel',          description: 'Diesel for generator',               amount: 12000,  daysAgoVal: 20 },
    { category: 'Maintenance',   description: 'Chakki stone dressing (gharai)',     amount: 8000,   daysAgoVal: 15 },
    { category: 'Other',         description: 'New jute bags (bori) - 50 pcs',      amount: 5000,   daysAgoVal: 12 },
    { category: 'Electricity',   description: 'WAPDA bill - June (advance)',        amount: 48000,  daysAgoVal: 5 },
    { category: 'Labor',         description: 'Daily labor for loading/unloading',   amount: 3500,   daysAgoVal: 3 },
    { category: 'Maintenance',   description: 'Belt replacement for motor',         amount: 2500,   daysAgoVal: 1 },
  ];
  for (const e of expenseData) {
    const createdAt = daysAgo(e.daysAgoVal);
    await db.execute({
      sql: 'INSERT INTO expenses (category, description, amount, createdAt) VALUES (?, ?, ?, ?)',
      args: [e.category, e.description, e.amount, createdAt],
    });
  }
  console.log(`   ✅ Inserted ${expenseData.length} expenses`);

  console.log('\n🎉 Database seeded successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err.message || err);
    process.exit(1);
  });
