require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Key storage with automatic cleanup
const keyStore = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of keyStore.entries()) {
    if (now > expiry) keyStore.delete(key);
  }
}, 60 * 1000); // Cleanup every minute

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    keysStored: keyStore.size,
    memoryUsage: process.memoryUsage()
  });
});

// Key generation endpoint
app.post('/api/generate', (req, res) => {
  try {
    const key = generateKey();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    keyStore.set(key, expiry);
    
    res.status(201).json({
      success: true,
      key,
      expiry,
      ttl: '5 minutes'
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Key generation failed'
    });
  }
});

// Key validation endpoint
app.post('/api/validate', (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid key required'
      });
    }

    const isValid = keyStore.has(key) && Date.now() < keyStore.get(key);
    
    res.status(200).json({
      success: true,
      valid: isValid,
      exists: keyStore.has(key)
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
});

// Key generator function
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const segments = [];
  
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Try generating a key at http://localhost:${PORT}/api/generate`);
  });
}
