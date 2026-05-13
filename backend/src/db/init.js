const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'chatbot.db');

let dbInstance = null;

async function initDatabase() {
  if (dbInstance) return dbInstance;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 启用外键约束
  db.run('PRAGMA foreign_keys = ON;');

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '新会话',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);');

  // 封装查询方法
  dbInstance = {
    _db: db,

    // 执行SQL（INSERT/UPDATE/DELETE）
    run(sql, params = []) {
      db.run(sql, params);
      save();
    },

    // 查询单条记录
    get(sql, params = []) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    },

    // 查询所有记录
    all(sql, params = []) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },

    // 获取最后插入的ID
    getLastInsertRowId() {
      const result = db.exec('SELECT last_insert_rowid()');
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return 0;
    },

    // 保存数据库到文件
    save() {
      save();
    }
  };

  function save() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  return dbInstance;
}

module.exports = { initDatabase };
