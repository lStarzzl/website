const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

const validKeys = new Map();

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ status: 'OK' });
});

// Key validation endpoint
app.post('/api/validate', (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }
    
    const isValid = validKeys.has(key) && Date.now() < validKeys.get(key);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Key generation endpoint
app.post('/api/generate', (req, res) => {
  try {
    const key = generateKey();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    validKeys.set(key, expiry);
    res.json({ key, expiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 4; i++) {
    key += Array.from({length: 4}, () => chars[Math.floor(Math.random() * 26)]).join('');
    if (i < 3) key += '-';
  }
  return key;
}

// Export the Express app
module.exports = app;