import express from 'express';
import { all, get } from '../db/connection.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res, next) => {
  try {
    // 1. Today's Date bounds (in YYYY-MM-DD local format)
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Today's Wheat Total (Net weight in kg)
    const todayWheatRow = await get(`
      SELECT COALESCE(SUM(netWeight), 0) as total 
      FROM wheat_entries 
      WHERE date(createdAt) = date(?)
    `, [todayStr]);
    const todayWheat = Number(todayWheatRow.total);

    // 3. Today's Flour Total (Quantity in kg)
    const todayFlourRow = await get(`
      SELECT COALESCE(SUM(quantity), 0) as total 
      FROM atta_issues 
      WHERE date(createdAt) = date(?)
    `, [todayStr]);
    const todayFlour = Number(todayFlourRow.total);

    // 4. Today's Total Sales (totalAmount in Rs)
    const todaySalesRow = await get(`
      SELECT COALESCE(SUM(totalAmount), 0) as total 
      FROM atta_issues 
      WHERE date(createdAt) = date(?)
    `, [todayStr]);
    const todaySales = Number(todaySalesRow.total);

    // 5. Total Pending Payments (Remaining balance of all time)
    const pendingRow = await get(`
      SELECT COALESCE(SUM(remainingBalance), 0) as total 
      FROM atta_issues
    `);
    const pendingPayments = Number(pendingRow.total);

    // 6. Recent Entries (Union of WheatEntries and AttaIssues, limited to 10)
    const recentEntries = await all(`
      SELECT * FROM (
        SELECT 
          'wheat' as type,
          w.id,
          w.invoiceNo,
          w.customerId,
          c.name as customerName,
          w.netWeight as quantity,
          0 as amount,
          'Completed' as status,
          w.createdAt
        FROM wheat_entries w
        JOIN customers c ON w.customerId = c.id

        UNION ALL

        SELECT 
          'flour' as type,
          a.id,
          a.invoiceNo,
          a.customerId,
          c.name as customerName,
          a.quantity,
          a.totalAmount as amount,
          CASE 
            WHEN a.remainingBalance > 0 THEN 'Udhaar'
            ELSE 'Paid'
          END as status,
          a.createdAt
        FROM atta_issues a
        JOIN customers c ON a.customerId = c.id
      )
      ORDER BY createdAt DESC
      LIMIT 10
    `);

    // 7. Grinding Trends (Last 7 Days)
    const trends = [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];

      const dayRow = await get(`
        SELECT COALESCE(SUM(netWeight), 0) as total 
        FROM wheat_entries 
        WHERE date(createdAt) = date(?)
      `, [dateStr]);

      trends.push({
        day: dayLabel,
        date: dateStr,
        total: Number(dayRow.total)
      });
    }

    res.json({
      success: true,
      data: {
        todayWheat: parseFloat(todayWheat.toFixed(2)),
        todayFlour: parseFloat(todayFlour.toFixed(2)),
        todaySales: Math.round(todaySales),
        pendingPayments: Math.round(pendingPayments),
        recentEntries,
        trends
      }
    });

  } catch (err) {
    next(err);
  }
});

export default router;
