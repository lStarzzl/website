const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const validKeys = new Map();

// Key validation endpoint
app.post('/validate', (req, res) => {
    const { key } = req.body;
    const isValid = validKeys.has(key) && Date.now() < validKeys.get(key);
    res.json({ valid: isValid });
});

// Key generation endpoint
app.post('/generate', (req, res) => {
    const key = generateKey();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    validKeys.set(key, expiry);
    res.json({ key, expiry });
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

module.exports = app;