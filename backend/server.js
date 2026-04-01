const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); // ← NEW

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🟢 IT Risk Assessment API is running',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 IT Risk Assessment System API`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`⚠️  Risks: http://localhost:${PORT}/api/risks`);
  console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`); // ← NEW
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} already in use!`);
    console.log(`💡 Run: netstat -ano | findstr :${PORT}`);
    console.log(`💡 Then: taskkill /PID <number> /F`);
    process.exit(1);
  }
});