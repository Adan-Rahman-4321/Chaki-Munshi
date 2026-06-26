import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

// GET /api/atta-issues - List atta issues with optional filters
router.get('/', (req, res, next) => {
  try {
    const { date, customerId, invoiceNo } = req.query;
    
    let queryStr = `
      SELECT a.*, c.name as customerName, c.phone as customerPhone 
      FROM atta_issues a
      JOIN customers c ON a.customerId = c.id
    `;
    const params = [];
    const conditions = [];

    if (date) {
      conditions.push('date(a.createdAt) = date(?)');
      params.push(date);
    }
    if (customerId) {
      conditions.push('a.customerId = ?');
      params.push(customerId);
    }
    if (invoiceNo) {
      conditions.push('a.invoiceNo LIKE ?');
      params.push(`%${invoiceNo}%`);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY a.createdAt DESC';

    const issues = db.prepare(queryStr).all(...params);
    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
});

// GET /api/atta-issues/:id - Single atta issue details
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const issue = db.prepare(`
      SELECT a.*, c.name as customerName, c.phone as customerPhone, c.address as customerAddress,
             w.invoiceNo as linkedWheatInvoice
      FROM atta_issues a
      JOIN customers c ON a.customerId = c.id
      LEFT JOIN wheat_entries w ON a.wheatEntryId = w.id
      WHERE a.id = ?
    `).get(id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Atta issue record not found' });
    }
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
});

// POST /api/atta-issues - Create new atta issue
router.post('/', (req, res, next) => {
  try {
    const { customerId, wheatEntryId, quantity, ratePerKg, paymentMethod, paidAmount, createdAt } = req.body;
    
    if (!customerId || !quantity || ratePerKg === undefined) {
      return res.status(400).json({ success: false, message: 'Customer ID, Quantity, and Rate per kg are required' });
    }

    // Determine created date/time
    const finalCreatedAt = createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Auto Generate Invoice Number: FLR-YYYYMMDD-XXXX
    const d = new Date(finalCreatedAt.replace(' ', 'T'));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${day}`;
    
    // Count entries on this day to get next sequence number
    const countRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM atta_issues 
      WHERE date(createdAt) = date(?)
    `).get(datePart.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    
    const seq = String((countRow ? countRow.count : 0) + 1).padStart(4, '0');
    const invoiceNo = `FLR-${datePart}-${seq}`;

    const qty = parseFloat(quantity);
    const rate = parseFloat(ratePerKg);
    const total = qty * rate;
    const method = paymentMethod || 'Cash';
    
    // Auto-calculate paid vs remaining based on payment method
    let paid = parseFloat(paidAmount) || 0;
    if (method !== 'Credit' && paidAmount === undefined) {
      paid = total; // Default to fully paid for Cash/Online
    } else if (method === 'Credit' && paidAmount === undefined) {
      paid = 0; // Default to unpaid for Credit
    }
    const balance = total - paid;

    // Check if drawing from deposited wheat balance
    if (wheatEntryId) {
      const wheatEntry = db.prepare('SELECT * FROM wheat_entries WHERE id = ?').get(wheatEntryId);
      if (!wheatEntry) {
        return res.status(404).json({ success: false, message: 'Linked wheat entry not found' });
      }
    }

    const info = db.prepare(`
      INSERT INTO atta_issues (invoiceNo, customerId, wheatEntryId, quantity, ratePerKg, totalAmount, paymentMethod, paidAmount, remainingBalance, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      invoiceNo,
      customerId,
      wheatEntryId || null,
      qty,
      rate,
      parseFloat(total.toFixed(2)),
      method,
      parseFloat(paid.toFixed(2)),
      parseFloat(balance.toFixed(2)),
      finalCreatedAt
    );

    const newIssue = db.prepare('SELECT * FROM atta_issues WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newIssue });
  } catch (err) {
    next(err);
  }
});

// PUT /api/atta-issues/:id - Update atta issue details
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, ratePerKg, paymentMethod, paidAmount } = req.body;

    const issue = db.prepare('SELECT * FROM atta_issues WHERE id = ?').get(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Atta issue record not found' });
    }

    const qty = quantity !== undefined ? parseFloat(quantity) : issue.quantity;
    const rate = ratePerKg !== undefined ? parseFloat(ratePerKg) : issue.ratePerKg;
    const total = qty * rate;
    const method = paymentMethod || issue.paymentMethod;
    const paid = paidAmount !== undefined ? parseFloat(paidAmount) : issue.paidAmount;
    const balance = total - paid;

    db.prepare(`
      UPDATE atta_issues 
      SET quantity = ?, ratePerKg = ?, totalAmount = ?, paymentMethod = ?, paidAmount = ?, remainingBalance = ?
      WHERE id = ?
    `).run(qty, rate, parseFloat(total.toFixed(2)), method, parseFloat(paid.toFixed(2)), parseFloat(balance.toFixed(2)), id);

    const updatedIssue = db.prepare('SELECT * FROM atta_issues WHERE id = ?').get(id);
    res.json({ success: true, data: updatedIssue });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/atta-issues/:id - Delete atta issue
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const issue = db.prepare('SELECT * FROM atta_issues WHERE id = ?').get(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Atta issue record not found' });
    }

    db.prepare('DELETE FROM atta_issues WHERE id = ?').run(id);
    res.json({ success: true, message: 'Atta issue record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
