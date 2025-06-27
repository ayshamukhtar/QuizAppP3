const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'scores.db'));

// Create users table first
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Error creating users table:", err.message);
  } else {
    console.log("Users table ensured.");
  }
});

// Then create scores table, with user_id as foreign key
db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error("Error creating scores table:", err.message);
  } else {
    console.log("Scores table ensured.");
  }
});

module.exports = db;
