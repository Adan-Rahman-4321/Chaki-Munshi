import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

// Helper to query report summaries for a given date range
function getSummaryForRange(startDate, endDate) {
  // Total Wheat (Net weight and raw weight)
  const wheat = db.prepare(`
    SELECT 
      COALESCE(SUM(totalWeight), 0) as totalWeight,
      COALESCE(SUM(cleaningWeight), 0) as cleaningWeight,
      COALESCE(SUM(netWeight), 0) as netWeight
    FROM wheat_entries
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `).get(startDate, endDate);

  // Total Flour Issued/Sold
  const flour = db.prepare(`
    SELECT 
      COALESCE(SUM(quantity), 0) as quantity,
      COALESCE(SUM(totalAmount), 0) as sales,
      COALESCE(SUM(paidAmount), 0) as cashReceived,
      COALESCE(SUM(remainingBalance), 0) as creditAmount
    FROM atta_issues
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `).get(startDate, endDate);

  // Total Expenses
  const expenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `).get(startDate, endDate);

  // Category-wise expenses breakdown
  const expensesBreakdown = db.prepare(`
    SELECT category, SUM(amount) as amount
    FROM expenses
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
    GROUP BY category
  `).all(startDate, endDate);

  return {
    wheatReceived: parseFloat(wheat.totalWeight.toFixed(2)),
    cleaningLoss: parseFloat(wheat.cleaningWeight.toFixed(2)),
    netWheatProcessed: parseFloat(wheat.netWeight.toFixed(2)),
    flourIssued: parseFloat(flour.quantity.toFixed(2)),
    totalEarnings: Math.round(flour.sales),
    cashReceived: Math.round(flour.cashReceived),
    creditIssued: Math.round(flour.creditAmount),
    totalExpenses: Math.round(expenses.total),
    netProfit: Math.round(flour.sales - expenses.total),
    expensesBreakdown
  };
}

// GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    const summary = getSummaryForRange(date, date);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/monthly?year=YYYY&month=MM
router.get('/monthly', (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and Month parameters are required' });
    }

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    // Find last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const summary = getSummaryForRange(start, end);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/yearly?year=YYYY
router.get('/yearly', (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ success: false, message: 'Year parameter is required' });
    }

    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const summary = getSummaryForRange(start, end);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;
