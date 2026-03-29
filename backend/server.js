require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { WebSocketServer } = require('ws');
const Y = require('yjs');
const { initDatabase, getDb, saveDatabase } = require('./database');
const { initGemini, askGemini } = require('./gemini');

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // Set this to your Vercel URL in Render env vars
].filter(Boolean);

const corsOptions = { origin: ALLOWED_ORIGINS, credentials: true };

// Socket.io for chat, tasks, presence
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true },
});

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ============================
// Yjs Document Store
// ============================
const yjsDocs = new Map(); // workspaceId:filename -> Y.Doc

function getYDoc(room) {
  if (!yjsDocs.has(room)) {
    const doc = new Y.Doc();
    yjsDocs.set(room, doc);
  }
  return yjsDocs.get(room);
}

const { setupWSConnection } = require('y-websocket/bin/utils');
const wss = new WebSocketServer({ noServer: true });

// Handle upgrade for Yjs WebSocket connections
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith('/yjs/')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Yjs WebSocket connection handling
wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

// ============================
// REST API Routes
// ============================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ADMIN DATA VIEWER ---
app.get('/api/admin/data', (req, res) => {
  const db = getDb();
  const tables = ['users', 'workspaces', 'workspace_members', 'tasks', 'messages', 'versions'];
  const data = {};
  
  tables.forEach(table => {
    try {
      const result = db.exec(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 50`);
      if (result.length > 0) {
        const cols = result[0].columns;
        data[table] = result[0].values.map(row => {
          const obj = {};
          cols.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
      } else {
        data[table] = [];
      }
    } catch(e) {
      data[table] = `Error: ${e.message}`;
    }
  });

  const tableHtml = (name, rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return `<h3>${name}</h3><p style="color:#888">No records</p>`;
    const cols = Object.keys(rows[0]);
    return `
      <h3 style="margin:20px 0 8px;color:#a78bfa">${name} <span style="font-size:12px;color:#888">(${rows.length} rows)</span></h3>
      <div style="overflow-x:auto">
      <table style="border-collapse:collapse;width:100%;font-size:12px">
        <thead><tr>${cols.map(c => `<th style="background:#1e1b4b;color:#c4b5fd;padding:8px 12px;text-align:left;border:1px solid #312e81">${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row, i) => `<tr style="background:${i%2===0?'#0f0f1a':'#13111f'}">${cols.map(c => `<td style="padding:6px 12px;border:1px solid #1e1b4b;color:#e2e8f0;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${String(row[c]||'').replace(/"/g,'&quot;')}">${String(row[c]||'').substring(0,80)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
  };

  const html = `<!DOCTYPE html><html><head><title>Campus Connection DB Viewer</title>
  <style>body{font-family:monospace;background:#050505;color:#e2e8f0;padding:20px;margin:0}
  h1{color:#a78bfa}h2{color:#38bdf8;border-bottom:1px solid #1e1b4b;padding-bottom:8px}
  .refresh{background:#7c3aed;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px}
  </style></head><body>
  <h1>🗄️ Campus Connection — Database Viewer</h1>
  <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
    <button class="refresh" onclick="location.reload()">↻ Refresh</button>
    <span style="color:#888;font-size:12px">Last updated: ${new Date().toLocaleString()}</span>
  </div>
  <h2>Tables</h2>
  ${tables.map(t => tableHtml(t, data[t])).join('')}
  </body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- AUTH ---
app.post('/api/auth/signup', (req, res) => {
  const db = getDb();
  const { fullName, email, password, domain, college, degree, year } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = db.exec(`SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    const avatarColors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#14b8a6', '#3b82f6'];
    const avatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    db.run(`INSERT INTO users (id, fullName, email, password, domain, college, degree, year, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, fullName, email, hashedPassword, domain || '', college || '', degree || '', year || '', avatar]);

    saveDatabase();

    res.json({
      success: true,
      user: { id, fullName, email, domain, college, degree, year, avatar, skills: [], bio: '' }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;

  try {
    const result = db.exec(`SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => { user[col] = row[i]; });

    const bcrypt = require('bcryptjs');
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    delete user.password;
    user.skills = JSON.parse(user.skills || '[]');
    res.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- WORKSPACES ---
app.post('/api/workspaces', (req, res) => {
  const db = getDb();
  const { name, description, template, ownerId, ownerName, ownerAvatar, techStack } = req.body;

  try {
    const id = uuidv4();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run(`INSERT INTO workspaces (id, name, description, template, ownerId, ownerName, inviteCode, techStack)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description || '', template || 'blank', ownerId, ownerName || '', inviteCode, JSON.stringify(techStack || [])]);

    db.run(`INSERT INTO workspace_members (workspaceId, userId, userName, avatar, role)
            VALUES (?, ?, ?, ?, 'owner')`,
      [id, ownerId, ownerName || '', ownerAvatar || '#6366f1']);

    saveDatabase();

    res.json({
      success: true,
      workspace: { id, name, description, template, ownerId, ownerName, inviteCode, techStack: techStack || [], status: 'active', members: [{ id: ownerId, name: ownerName, avatar: ownerAvatar, role: 'owner' }], createdAt: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Create workspace error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/workspaces/join', (req, res) => {
  const db = getDb();
  const { inviteCode, userId, userName, userAvatar } = req.body;

  try {
    const result = db.exec(`SELECT * FROM workspaces WHERE inviteCode = '${inviteCode.replace(/'/g, "''")}'`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const cols = result[0].columns;
    const row = result[0].values[0];
    const ws = {};
    cols.forEach((col, i) => { ws[col] = row[i]; });

    // Check if already a member
    const memberCheck = db.exec(`SELECT * FROM workspace_members WHERE workspaceId = '${ws.id}' AND userId = '${userId}'`);
    if (memberCheck.length > 0 && memberCheck[0].values.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    db.run(`INSERT INTO workspace_members (workspaceId, userId, userName, avatar, role) VALUES (?, ?, ?, ?, 'member')`,
      [ws.id, userId, userName || '', userAvatar || '#6366f1']);

    saveDatabase();

    // Notify workspace
    io.to(`workspace:${ws.id}`).emit('member:joined', { userId, userName, avatar: userAvatar });

    // Fetch all members for the returned workspace
    const allMembers = db.exec(`SELECT userId as id, userName as name, avatar, role FROM workspace_members WHERE workspaceId = '${ws.id}'`);
    ws.members = allMembers.length > 0 ? allMembers[0].values.map(mRow => {
      const m = {};
      allMembers[0].columns.forEach((col, i) => { m[col] = mRow[i]; });
      return m;
    }) : [];

    res.json({ success: true, workspace: ws });
  } catch (err) {
    console.error('Join workspace error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/workspaces/user/:userId', (req, res) => {
  const db = getDb();
  try {
    const result = db.exec(`
      SELECT w.* FROM workspaces w
      JOIN workspace_members m ON w.id = m.workspaceId
      WHERE m.userId = '${req.params.userId.replace(/'/g, "''")}'
    `);
    if (result.length === 0) return res.json([]);
    
    const cols = result[0].columns;
    const workspaces = result[0].values.map(row => {
      const ws = {};
      cols.forEach((col, i) => { 
        if (col === 'techStack') {
          try { ws[col] = JSON.parse(row[i]); } catch(e) { ws[col] = []; }
        } else {
          ws[col] = row[i]; 
        }
      });

      // Fetch real members for this workspace
      const memberResult = db.exec(`SELECT userId as id, userName as name, avatar, role FROM workspace_members WHERE workspaceId = '${ws.id}'`);
      if (memberResult.length > 0) {
        const mCols = memberResult[0].columns;
        ws.members = memberResult[0].values.map(mRow => {
          const m = {};
          mCols.forEach((col, i) => { m[col] = mRow[i]; });
          return m;
        });
      } else {
        ws.members = [];
      }
      return ws;
    });
    res.json(workspaces);
  } catch (err) {
    console.error('Fetch workspaces error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- TASKS ---
app.get('/api/workspaces/:id/tasks', (req, res) => {
  const db = getDb();
  try {
    const result = db.exec(`SELECT * FROM tasks WHERE workspaceId = '${req.params.id}' ORDER BY createdAt DESC`);
    if (result.length === 0) return res.json([]);
    const cols = result[0].columns;
    const tasks = result[0].values.map(row => {
      const task = {};
      cols.forEach((col, i) => { task[col] = row[i]; });
      return task;
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- MESSAGES ---
app.get('/api/workspaces/:id/messages', (req, res) => {
  const db = getDb();
  try {
    const result = db.exec(`SELECT * FROM messages WHERE workspaceId = '${req.params.id}' ORDER BY timestamp ASC`);
    if (result.length === 0) return res.json([]);
    const cols = result[0].columns;
    const messages = result[0].values.map(row => {
      const msg = {};
      cols.forEach((col, i) => { msg[col] = row[i]; });
      return msg;
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- VERSIONS ---
app.get('/api/workspaces/:id/versions', (req, res) => {
  const db = getDb();
  try {
    const result = db.exec(`SELECT * FROM versions WHERE workspaceId = '${req.params.id}' ORDER BY timestamp DESC`);
    if (result.length === 0) return res.json([]);
    const cols = result[0].columns;
    const versions = result[0].values.map(row => {
      const ver = {};
      cols.forEach((col, i) => { ver[col] = row[i]; });
      return ver;
    });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- AI ---
app.post('/api/ai/ask', async (req, res) => {
  const { prompt, code, filename } = req.body;
  try {
    const response = await askGemini(prompt, code, filename);
    res.json({ response });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

// ============================
// Socket.io — Real-time Events
// ============================
const onlineUsers = new Map(); // socketId -> { userId, userName, avatar, workspaceId, currentFile }

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // --- Join Workspace ---
  socket.on('workspace:join', ({ workspaceId, user }) => {
    socket.join(`workspace:${workspaceId}`);
    onlineUsers.set(socket.id, {
      userId: user.id,
      userName: user.fullName,
      avatar: user.avatar,
      workspaceId,
      currentFile: 'index.html',
      status: 'online',
    });

    // Broadcast updated online users list
    broadcastOnlineUsers(workspaceId);
    console.log(`👤 ${user.fullName} joined workspace ${workspaceId}`);
  });

  // --- Leave Workspace ---
  socket.on('workspace:leave', ({ workspaceId }) => {
    socket.leave(`workspace:${workspaceId}`);
    onlineUsers.delete(socket.id);
    broadcastOnlineUsers(workspaceId);
  });

  // --- Chat ---
  socket.on('chat:message', ({ workspaceId, message }) => {
    const db = getDb();
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      db.run(`INSERT INTO messages (id, workspaceId, text, userId, userName, avatar, timestamp)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, workspaceId, message.text, message.userId, message.userName, message.avatar, timestamp]);
      saveDatabase();
    } catch (err) {
      console.error('Save message error:', err);
    }

    const fullMessage = { id, ...message, timestamp };
    io.to(`workspace:${workspaceId}`).emit('chat:message', fullMessage);
  });

  // --- Tasks ---
  socket.on('task:create', ({ workspaceId, task }) => {
    const db = getDb();
    const id = uuidv4();

    try {
      db.run(`INSERT INTO tasks (id, workspaceId, title, description, assignedTo, deadline, status, createdBy)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, workspaceId, task.title, task.description || '', task.assignedTo || '', task.deadline || '', task.status || 'pending', task.createdBy || '']);
      saveDatabase();
    } catch (err) {
      console.error('Save task error:', err);
    }

    io.to(`workspace:${workspaceId}`).emit('task:created', { id, ...task, createdAt: new Date().toISOString() });
  });

  socket.on('task:update', ({ workspaceId, taskId, updates }) => {
    const db = getDb();
    try {
      const sets = Object.entries(updates).map(([k, v]) => `${k} = '${String(v).replace(/'/g, "''")}'`).join(', ');
      db.run(`UPDATE tasks SET ${sets} WHERE id = '${taskId}'`);
      saveDatabase();
    } catch (err) {
      console.error('Update task error:', err);
    }

    io.to(`workspace:${workspaceId}`).emit('task:updated', { taskId, updates });
  });

  socket.on('task:delete', ({ workspaceId, taskId }) => {
    const db = getDb();
    try {
      db.run(`DELETE FROM tasks WHERE id = '${taskId}'`);
      saveDatabase();
    } catch (err) {
      console.error('Delete task error:', err);
    }

    io.to(`workspace:${workspaceId}`).emit('task:deleted', { taskId });
  });

  // --- Presence ---
  socket.on('presence:file', ({ workspaceId, filename }) => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      user.currentFile = filename;
      broadcastOnlineUsers(workspaceId);
    }
  });

  // --- Version Tracking ---
  socket.on('version:save', ({ workspaceId, version }) => {
    const db = getDb();
    const id = uuidv4();

    try {
      db.run(`INSERT INTO versions (id, workspaceId, filename, content, userId, userName, label, timestamp)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, workspaceId, version.filename, version.content, version.userId, version.userName, version.label || 'Auto-save', new Date().toISOString()]);
      saveDatabase();
    } catch (err) {
      console.error('Save version error:', err);
    }

    io.to(`workspace:${workspaceId}`).emit('version:saved', { id, ...version, timestamp: new Date().toISOString() });
  });

  // --- Disconnect ---
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(user.workspaceId);
      console.log(`👋 ${user.userName} disconnected`);
    }
  });
});

function broadcastOnlineUsers(workspaceId) {
  const users = [];
  onlineUsers.forEach((user) => {
    if (user.workspaceId === workspaceId) {
      users.push(user);
    }
  });
  io.to(`workspace:${workspaceId}`).emit('presence:users', users);
}

// ============================
// Start Server
// ============================
async function start() {
  await initDatabase();
  initGemini();

  server.listen(PORT, () => {
    console.log(`\n🚀 Campus Connection Backend Server`);
    console.log(`   REST API:    http://localhost:${PORT}`);
    console.log(`   Socket.io:   http://localhost:${PORT}`);
    console.log(`   Yjs WS:      ws://localhost:${PORT}/yjs/`);
    console.log('');
  });
}

start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💾 Saving database...');
  saveDatabase();
  process.exit(0);
});
