import express from 'express';
import { all, get } from '../db/connection.js';

const router = express.Router();

// Helper to query report summaries for a given date range
async function getSummaryForRange(startDate, endDate) {
  // Total Wheat (Net weight and raw weight)
  const wheat = await get(`
    SELECT 
      COALESCE(SUM(totalWeight), 0) as totalWeight,
      COALESCE(SUM(cleaningWeight), 0) as cleaningWeight,
      COALESCE(SUM(netWeight), 0) as netWeight,
      COALESCE(SUM(cleaningCharges), 0) as cleaningCharges,
      COALESCE(SUM(grindingCharges), 0) as grindingCharges
    FROM wheat_entries
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `, [startDate, endDate]);

  // Total Flour Issued/Sold
  const flour = await get(`
    SELECT 
      COALESCE(SUM(quantity), 0) as quantity,
      COALESCE(SUM(totalAmount), 0) as sales,
      COALESCE(SUM(paidAmount), 0) as cashReceived,
      COALESCE(SUM(remainingBalance), 0) as creditAmount
    FROM atta_issues
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `, [startDate, endDate]);

  // Total Expenses
  const expenses = await get(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
  `, [startDate, endDate]);

  // Category-wise expenses breakdown
  const expensesBreakdown = await all(`
    SELECT category, SUM(amount) as amount
    FROM expenses
    WHERE date(createdAt) BETWEEN date(?) AND date(?)
    GROUP BY category
  `, [startDate, endDate]);

  const wheatTotal = Number(wheat.totalWeight);
  const wheatCleaning = Number(wheat.cleaningWeight);
  const wheatNet = Number(wheat.netWeight);
  const cleaningRevenue = Number(wheat.cleaningCharges);
  const grindingRevenue = Number(wheat.grindingCharges);
  const flourQty = Number(flour.quantity);
  const flourSales = Number(flour.sales);
  const flourCash = Number(flour.cashReceived);
  const flourCredit = Number(flour.creditAmount);
  const expensesTotal = Number(expenses.total);

  return {
    totalWheatReceived: parseFloat(wheatTotal.toFixed(2)),
    cleaningLoss: parseFloat(wheatCleaning.toFixed(2)),
    netWheatProcessed: parseFloat(wheatNet.toFixed(2)),
    totalFlourIssued: parseFloat(flourQty.toFixed(2)),
    cleaningRevenue: Math.round(cleaningRevenue),
    grindingRevenue: Math.round(grindingRevenue),
    flourRevenue: Math.round(flourSales),
    cashReceived: Math.round(flourCash),
    creditIssued: Math.round(flourCredit),
    totalExpenses: Math.round(expensesTotal),
    netProfit: Math.round(cleaningRevenue + grindingRevenue + flourSales - expensesTotal),
    expensesBreakdown
  };
}

// GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    const summary = await getSummaryForRange(date, date);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/monthly?year=YYYY&month=MM
router.get('/monthly', async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and Month parameters are required' });
    }

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    // Find last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const summary = await getSummaryForRange(start, end);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/yearly?year=YYYY
router.get('/yearly', async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ success: false, message: 'Year parameter is required' });
    }

    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const summary = await getSummaryForRange(start, end);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;
