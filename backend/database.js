const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'campus_connection.db');
let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      domain TEXT,
      college TEXT,
      degree TEXT,
      year TEXT,
      avatar TEXT,
      skills TEXT DEFAULT '[]',
      bio TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      template TEXT DEFAULT 'blank',
      ownerId TEXT NOT NULL,
      ownerName TEXT,
      inviteCode TEXT UNIQUE,
      techStack TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      filesData TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  try {
    db.run("ALTER TABLE workspaces ADD COLUMN filesData TEXT;");
  } catch(e) { /* Column might already exist, safe to ignore */ }

  db.run(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspaceId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'member',
      PRIMARY KEY (workspaceId, userId)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignedTo TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'pending',
      createdBy TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      text TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT,
      avatar TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      filename TEXT NOT NULL,
      content TEXT,
      userId TEXT NOT NULL,
      userName TEXT,
      label TEXT DEFAULT 'Auto-save',
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT,
      read INTEGER DEFAULT 0,
      data TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ Database initialized');
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getDb() {
  return db;
}

// Auto-save every 30 seconds
setInterval(saveDatabase, 30000);

module.exports = { initDatabase, getDb, saveDatabase };
