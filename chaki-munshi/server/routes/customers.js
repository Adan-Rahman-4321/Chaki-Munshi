import express from 'express';
import { all, get, run } from '../db/connection.js';

const router = express.Router();

// GET /api/customers - List all customers with search & calculated totals
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let queryStr = `
      SELECT 
        c.*,
        -- Total net wheat deposited
        COALESCE((SELECT SUM(w.netWeight) FROM wheat_entries w WHERE w.customerId = c.id), 0) as totalWheatDeposited,
        -- Total flour issued
        COALESCE((SELECT SUM(a.quantity) FROM atta_issues a WHERE a.customerId = c.id), 0) as totalFlourIssued,
        -- Remaining wheat balance (deposited - issued)
        COALESCE(
          (SELECT SUM(w.netWeight) FROM wheat_entries w WHERE w.customerId = c.id), 0
        ) - COALESCE(
          (SELECT SUM(a.quantity) FROM atta_issues a WHERE a.customerId = c.id AND a.wheatEntryId IS NOT NULL), 0
        ) as wheatBalance,
        -- Total unpaid/udhaar balance
        COALESCE((SELECT SUM(a.remainingBalance) FROM atta_issues a WHERE a.customerId = c.id), 0) as pendingBalance
      FROM customers c
    `;

    let data;
    if (search) {
      queryStr += ` WHERE c.name LIKE ? OR c.phone LIKE ?`;
      data = await all(queryStr, [`%${search}%`, `%${search}%`]);
    } else {
      data = await all(queryStr);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id - Single customer details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get aggregated stats
    const stats = await get(`
      SELECT 
        COALESCE((SELECT SUM(netWeight) FROM wheat_entries WHERE customerId = ?), 0) as totalWheat,
        COALESCE((SELECT SUM(quantity) FROM atta_issues WHERE customerId = ?), 0) as totalFlour,
        COALESCE((SELECT SUM(totalAmount) FROM atta_issues WHERE customerId = ?), 0) as totalAmount,
        COALESCE((SELECT SUM(paidAmount) FROM atta_issues WHERE customerId = ?), 0) as totalPaid,
        COALESCE((SELECT SUM(remainingBalance) FROM atta_issues WHERE customerId = ?), 0) as pendingBalance
      FROM customers WHERE id = ?
    `, [id, id, id, id, id, id]);

    const issuedFromWheat = await get(
      "SELECT COALESCE(SUM(quantity), 0) as q FROM atta_issues WHERE customerId = ? AND wheatEntryId IS NOT NULL",
      [id]
    );

    const totalWheat = Number(stats.totalWheat);
    const totalFlour = Number(stats.totalFlour);

    res.json({
      success: true,
      data: {
        ...customer,
        stats: {
          totalWheat: parseFloat(totalWheat.toFixed(2)),
          totalFlour: parseFloat(totalFlour.toFixed(2)),
          totalAmount: Math.round(Number(stats.totalAmount)),
          totalPaid: Math.round(Number(stats.totalPaid)),
          pendingBalance: Math.round(Number(stats.pendingBalance)),
          wheatBalance: parseFloat((totalWheat - Number(issuedFromWheat.q)).toFixed(2))
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const info = await run(`
      INSERT INTO customers (name, phone, address) 
      VALUES (?, ?, ?)
    `, [name, phone || '', address || '']);

    const newCustomer = await get('SELECT * FROM customers WHERE id = ?', [info.lastInsertRowid]);
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id - Update customer details
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    const customer = await get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await run(`
      UPDATE customers 
      SET name = ?, phone = ?, address = ?
      WHERE id = ?
    `, [name || customer.name, phone || customer.phone, address || customer.address, id]);

    const updatedCustomer = await get('SELECT * FROM customers WHERE id = ?', [id]);
    res.json({ success: true, data: updatedCustomer });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    await run('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id/history - Get unified customer history
router.get('/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await all(`
      SELECT * FROM (
        SELECT 
          'wheat' as type,
          id,
          invoiceNo,
          netWeight as quantity,
          0 as amount,
          0 as paid,
          'Completed' as status,
          createdAt
        FROM wheat_entries
        WHERE customerId = ?

        UNION ALL

        SELECT 
          'flour' as type,
          id,
          invoiceNo,
          quantity,
          totalAmount as amount,
          paidAmount as paid,
          CASE 
            WHEN remainingBalance > 0 THEN 'Udhaar'
            ELSE 'Paid'
          END as status,
          createdAt
        FROM atta_issues
        WHERE customerId = ?
      )
      ORDER BY createdAt DESC
    `, [id, id]);

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

export default router;
