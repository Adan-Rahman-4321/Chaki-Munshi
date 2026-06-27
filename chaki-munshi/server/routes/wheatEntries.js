import express from 'express';
import { all, get, run } from '../db/connection.js';

const router = express.Router();

// GET /api/wheat-entries - List wheat entries with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { date, customerId, invoiceNo } = req.query;

    let queryStr = `
      SELECT w.*, c.name as customerName, c.phone as customerPhone 
      FROM wheat_entries w
      JOIN customers c ON w.customerId = c.id
    `;
    const params = [];
    const conditions = [];

    if (date) {
      conditions.push('date(w.createdAt) = date(?)');
      params.push(date);
    }
    if (customerId) {
      conditions.push('w.customerId = ?');
      params.push(customerId);
    }
    if (invoiceNo) {
      conditions.push('w.invoiceNo LIKE ?');
      params.push(`%${invoiceNo}%`);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY w.createdAt DESC';

    const entries = await all(queryStr, params);
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/wheat-entries/:id - Single wheat entry
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await get(`
      SELECT w.*, c.name as customerName, c.phone as customerPhone, c.address as customerAddress
      FROM wheat_entries w
      JOIN customers c ON w.customerId = c.id
      WHERE w.id = ?
    `, [id]);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Wheat entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
});

// POST /api/wheat-entries - Create new wheat entry
router.post('/', async (req, res, next) => {
  try {
    const { customerId, totalWeight, cleaningWeight, notes, createdAt } = req.body;

    if (!customerId || !totalWeight) {
      return res.status(400).json({ success: false, message: 'Customer ID and Total Weight are required' });
    }

    // Determine created date/time
    const finalCreatedAt = createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Auto Generate Invoice Number: WHT-YYYYMMDD-XXXX
    const d = new Date(finalCreatedAt.replace(' ', 'T'));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${day}`;

    // Count entries on this day to get next sequence number
    const countRow = await get(`
      SELECT COUNT(*) as count 
      FROM wheat_entries 
      WHERE date(createdAt) = date(?)
    `, [datePart.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')]);

    const seq = String((countRow ? Number(countRow.count) : 0) + 1).padStart(4, '0');
    const invoiceNo = `WHT-${datePart}-${seq}`;

    const cleanW = parseFloat(cleaningWeight) || 0;
    const totalW = parseFloat(totalWeight);
    const netW = totalW - cleanW;

    const info = await run(`
      INSERT INTO wheat_entries (invoiceNo, customerId, totalWeight, cleaningWeight, netWeight, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceNo,
      customerId,
      totalW,
      cleanW,
      parseFloat(netW.toFixed(2)),
      notes || '',
      finalCreatedAt
    ]);

    const newEntry = await get('SELECT * FROM wheat_entries WHERE id = ?', [info.lastInsertRowid]);
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    next(err);
  }
});

// PUT /api/wheat-entries/:id - Update wheat entry
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { totalWeight, cleaningWeight, notes } = req.body;

    const entry = await get('SELECT * FROM wheat_entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Wheat entry not found' });
    }

    const cleanW = cleaningWeight !== undefined ? parseFloat(cleaningWeight) : entry.cleaningWeight;
    const totalW = totalWeight !== undefined ? parseFloat(totalWeight) : entry.totalWeight;
    const netW = totalW - cleanW;

    await run(`
      UPDATE wheat_entries 
      SET totalWeight = ?, cleaningWeight = ?, netWeight = ?, notes = ?
      WHERE id = ?
    `, [totalW, cleanW, parseFloat(netW.toFixed(2)), notes !== undefined ? notes : entry.notes, id]);

    const updatedEntry = await get('SELECT * FROM wheat_entries WHERE id = ?', [id]);
    res.json({ success: true, data: updatedEntry });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wheat-entries/:id - Delete wheat entry
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await get('SELECT * FROM wheat_entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Wheat entry not found' });
    }

    await run('DELETE FROM wheat_entries WHERE id = ?', [id]);
    res.json({ success: true, message: 'Wheat entry deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
