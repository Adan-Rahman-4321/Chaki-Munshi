// ============================================================================
// Chaki Munshi - Database Connection & Schema Setup
// Uses better-sqlite3 for synchronous, high-performance SQLite access
// ============================================================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path - stored in server/db/chaki_munshi.db
const DB_PATH = path.join(__dirname, 'chaki_munshi.db');

// Ensure the db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create and configure the database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Enable foreign key enforcement (off by default in SQLite)
db.pragma('foreign_keys = ON');

// ============================================================================
// Schema Initialization - Creates tables if they don't exist
// ============================================================================

db.exec(`
  -- =========================================================================
  -- Customers Table
  -- Stores wheat mill customer information
  -- =========================================================================
  CREATE TABLE IF NOT EXISTS customers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT,
    address     TEXT,
    createdAt   TEXT    DEFAULT (datetime('now', 'localtime')),
    updatedAt   TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- =========================================================================
  -- Wheat Entries Table
  -- Records wheat brought in by customers for grinding
  -- totalWeight:    raw wheat weight as received
  -- cleaningWeight: waste removed during cleaning (stones, husk, etc.)
  -- netWeight:      actual wheat sent for grinding (totalWeight - cleaningWeight)
  -- =========================================================================
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

  -- =========================================================================
  -- Atta (Flour) Issues Table
  -- Records flour issued/sold to customers
  -- Can optionally link to a wheat entry for traceability
  -- =========================================================================
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

  -- =========================================================================
  -- Expenses Table
  -- Tracks operational expenses of the wheat mill
  -- =========================================================================
  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL CHECK(category IN ('Electricity', 'Labor', 'Maintenance', 'Fuel', 'Other')),
    description TEXT,
    amount      REAL    NOT NULL,
    createdAt   TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  -- =========================================================================
  -- Indexes for frequently queried columns
  -- =========================================================================
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_customerId  ON wheat_entries(customerId);
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_createdAt   ON wheat_entries(createdAt);
  CREATE INDEX IF NOT EXISTS idx_wheat_entries_invoiceNo   ON wheat_entries(invoiceNo);

  CREATE INDEX IF NOT EXISTS idx_atta_issues_customerId    ON atta_issues(customerId);
  CREATE INDEX IF NOT EXISTS idx_atta_issues_createdAt     ON atta_issues(createdAt);
  CREATE INDEX IF NOT EXISTS idx_atta_issues_invoiceNo     ON atta_issues(invoiceNo);

  CREATE INDEX IF NOT EXISTS idx_expenses_createdAt        ON expenses(createdAt);
  CREATE INDEX IF NOT EXISTS idx_expenses_category         ON expenses(category);

  CREATE INDEX IF NOT EXISTS idx_customers_name            ON customers(name);

  -- =========================================================================
  -- Trigger: Auto-update the updatedAt field on customer modifications
  -- =========================================================================
  CREATE TRIGGER IF NOT EXISTS trg_customers_updatedAt
    AFTER UPDATE ON customers
    FOR EACH ROW
  BEGIN
    UPDATE customers SET updatedAt = datetime('now', 'localtime') WHERE id = OLD.id;
  END;
`);

console.log('✅ Database initialized at:', DB_PATH);

export default db;
