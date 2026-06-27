// ============================================================================
// Chaki Munshi - Database Connection & Schema Setup
// Uses Turso (libSQL) cloud database via @libsql/client (async).
//
// Required environment variables:
//   TURSO_DATABASE_URL  e.g. libsql://your-db-name.turso.io
//   TURSO_AUTH_TOKEN    your Turso auth token
// ============================================================================

import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    'TURSO_DATABASE_URL is not set. Create a Turso database and add the URL ' +
    '(and TURSO_AUTH_TOKEN) to your environment or a .env file.'
  );
}

// Cloud database client (libSQL / SQLite-compatible)
const db = createClient({ url, authToken });

// ============================================================================
// Query helpers (libSQL is async, so all DB access returns Promises)
//   get(sql, args) -> single row (or undefined)
//   all(sql, args) -> array of rows
//   run(sql, args) -> { lastInsertRowid, changes }
// ============================================================================

export async function all(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return rs.rows;
}

export async function get(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return rs.rows[0];
}

export async function run(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return {
    lastInsertRowid: rs.lastInsertRowid != null ? Number(rs.lastInsertRowid) : null,
    changes: rs.rowsAffected,
  };
}

// ============================================================================
// Schema - created automatically on startup if it does not exist
// ============================================================================
const SCHEMA = `
  -- Customers Table
  CREATE TABLE IF NOT EXISTS customers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT,
    address     TEXT,
    createdAt   TEXT    DEFAULT (datetime('now', 'localtime')),
    updatedAt   TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- Wheat Entries Table
  CREATE TABLE IF NOT EXISTS wheat_entries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceNo       TEXT    UNIQUE NOT NULL,
    customerId      INTEGER NOT NULL,
    totalWeight     REAL    NOT NULL,
    cleaningWeight  REAL    NOT NULL DEFAULT 0,
    netWeight       REAL    NOT NULL,
    notes           TEXT,
    createdAt       TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
  );

  -- Atta (Flour) Issues Table
  CREATE TABLE IF NOT EXISTS atta_issues (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceNo         TEXT    UNIQUE NOT NULL,
    customerId        INTEGER NOT NULL,
    wheatEntryId      INTEGER,
    quantity          REAL    NOT NULL,
    ratePerKg         REAL    NOT NULL,
    totalAmount       REAL    NOT NULL,
    paymentMethod     TEXT    DEFAULT 'Cash' CHECK(paymentMethod IN ('Cash', 'Online', 'Credit')),
    paidAmount        REAL    DEFAULT 0,
    remainingBalance  REAL    DEFAULT 0,
    createdAt         TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customerId)   REFERENCES customers(id)     ON DELETE CASCADE,
    FOREIGN KEY (wheatEntryId) REFERENCES wheat_entries(id)  ON DELETE SET NULL
  );

  -- Expenses Table
  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL CHECK(category IN ('Electricity', 'Labor', 'Maintenance', 'Fuel', 'Other')),
    description TEXT,
    amount      REAL    NOT NULL,
    createdAt   TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_customerId  ON wheat_entries(customerId);
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_createdAt   ON wheat_entries(createdAt);
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_invoiceNo   ON wheat_entries(invoiceNo);
  CREATE INDEX IF NOT EXISTS idx_atta_issues_customerId    ON atta_issues(customerId);
  CREATE INDEX IF NOT EXISTS idx_atta_issues_createdAt     ON atta_issues(createdAt);
  CREATE INDEX IF NOT EXISTS idx_atta_issues_invoiceNo     ON atta_issues(invoiceNo);
  CREATE INDEX IF NOT EXISTS idx_expenses_createdAt        ON expenses(createdAt);
  CREATE INDEX IF NOT EXISTS idx_expenses_category         ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_customers_name            ON customers(name);

  -- Trigger: auto-update updatedAt on customer changes
  CREATE TRIGGER IF NOT EXISTS trg_customers_updatedAt
    AFTER UPDATE ON customers
    FOR EACH ROW
  BEGIN
    UPDATE customers SET updatedAt = datetime('now', 'localtime') WHERE id = OLD.id;
  END;
`;

let initialized = false;

// Run schema setup once at startup. Safe to call multiple times.
export async function initDb() {
  if (initialized) return;
  await db.executeMultiple(SCHEMA);
  initialized = true;
  console.log('✅ Database schema ready (Turso/libSQL)');
}

export default db;
