import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

// GET /api/expenses - List all expenses with optional filters
router.get('/', (req, res, next) => {
  try {
    const { date, category } = req.query;
    let queryStr = 'SELECT * FROM expenses';
    const params = [];
    const conditions = [];

    if (date) {
      conditions.push('date(createdAt) = date(?)');
      params.push(date);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY createdAt DESC';

    const expenses = db.prepare(queryStr).all(...params);
    res.json({ success: true, data: expenses });
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses - Add new expense
router.post('/', (req, res, next) => {
  try {
    const { category, description, amount, createdAt } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Category and Amount are required' });
    }

    const validCategories = ['Electricity', 'Labor', 'Maintenance', 'Fuel', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid expense category' });
    }

    const finalCreatedAt = createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);

    const info = db.prepare(`
      INSERT INTO expenses (category, description, amount, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(category, description || '', parseFloat(amount), finalCreatedAt);

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    next(err);
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, description, amount } = req.body;

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    if (category) {
      const validCategories = ['Electricity', 'Labor', 'Maintenance', 'Fuel', 'Other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid expense category' });
      }
    }

    db.prepare(`
      UPDATE expenses 
      SET category = ?, description = ?, amount = ?
      WHERE id = ?
    `).run(
      category || expense.category, 
      description !== undefined ? description : expense.description, 
      amount !== undefined ? parseFloat(amount) : expense.amount, 
      id
    );

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.json({ success: true, data: updatedExpense });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id - Delete an expense record
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
