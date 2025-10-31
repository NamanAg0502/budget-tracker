import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;

export function getDB() {
  if (!db) {
    const dbPath = path.join(process.cwd(), ".data", "budget.db");
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Initialize schema
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const db = getDB();

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT DEFAULT 'Uncategorized',
      description TEXT,
      source TEXT DEFAULT 'manual',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
  `);

  // Goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      spent REAL DEFAULT 0,
      month TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, month)
    );
  `);

  // Categories reference table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default categories
  const categories = [
    { id: "cat_1", name: "Food & Dining", icon: "🍽️", color: "#FFA500" },
    { id: "cat_2", name: "Transport", icon: "🚗", color: "#3B82F6" },
    { id: "cat_3", name: "Shopping", icon: "🛍️", color: "#EC4899" },
    { id: "cat_4", name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
    { id: "cat_5", name: "Utilities", icon: "💡", color: "#14B8A6" },
    { id: "cat_6", name: "Healthcare", icon: "⚕️", color: "#EF4444" },
    { id: "cat_7", name: "Uncategorized", icon: "📌", color: "#6B7280" },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, icon, color) 
    VALUES (?, ?, ?, ?)
  `);

  for (const cat of categories) {
    stmt.run(cat.id, cat.name, cat.icon, cat.color);
  }
}

export function closeDB() {
  if (db) {
    db.close();
  }
}
