const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database'); // shared SQLite db from database.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Signup route
app.post('/users/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, password, function (err) {
    if (err) {
      console.error('Signup error:', err.message);
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Signup failed' });
    }
    res.status(200).json({ userId: this.lastID, success: true });
  });
});

// Login route
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  db.get('SELECT id FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Login error:', err.message);
      return res.status(500).json({ message: 'Login failed' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ userId: row.id, username, success: true });
  });
});

// ✅ Get user ID by username (used by frontend)
app.get('/users/id/:username', (req, res) => {
  const username = req.params.username;
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('User ID fetch error:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ id: row.id });
  });
});

// Save score
app.post('/api/scores', (req, res) => {
  const { user_id, score } = req.body;
  if (!user_id || score == null) {
    return res.status(400).json({ message: 'Missing score or user ID' });
  }

  const stmt = db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)');
  stmt.run(user_id, score, err => {
    if (err) {
      console.error('Score save error:', err.message);
      return res.status(500).json({ message: 'Failed to save score' });
    }
    res.status(200).json({ success: true });
  });
});

// Get scores for a specific user
app.get('/api/scores/:userId', (req, res) => {
  const userId = req.params.userId;
  db.all(
    'SELECT score, timestamp FROM scores WHERE user_id = ? ORDER BY timestamp DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Score fetch error:', err.message);
        return res.status(500).json({ message: 'Failed to retrieve scores' });
      }
      res.status(200).json(rows);
    }
  );
});

// ✅ Get top N leaderboard (default: top 10)
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const sql = `
    SELECT users.username, MAX(scores.score) AS score
    FROM scores
    JOIN users ON scores.user_id = users.id
    GROUP BY scores.user_id
    ORDER BY score DESC
    LIMIT ?
  `;
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      console.error('Leaderboard fetch error:', err.message);
      return res.status(500).json({ message: 'Failed to get leaderboard' });
    }
    res.json({ leaderboard: rows });
  });
});

// ✅ Get rank for a specific user
app.get('/api/rank/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);

  const rankSql = `
    SELECT user_id, MAX(score) AS score
    FROM scores
    GROUP BY user_id
    ORDER BY score DESC
  `;

  db.all(rankSql, [], (err, rows) => {
    if (err) {
      console.error('Rank fetch error:', err.message);
      return res.status(500).json({ message: 'Failed to get rank' });
    }

    const rank = rows.findIndex(r => r.user_id === userId);
    const userScore = rows[rank] ? rows[rank].score : null;

    if (rank === -1) {
      return res.status(404).json({ message: 'User has no scores' });
    }

    res.json({ rank: rank + 1, score: userScore });
  });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




