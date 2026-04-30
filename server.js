const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.SOCKET_CORS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// Store io instance in app for access in routes
app.io = io;

// ========================================
// Middleware
// ========================================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Database Connection
// ========================================
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// ========================================
// Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ADORA ☕ is running' });
});

// ========================================
// Socket.io Events
// ========================================
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });

  // Admin dashboard listeners
  socket.on('adminConnected', (data) => {
    console.log('📊 Admin connected:', data);
    socket.join('admin-dashboard');
  });

  socket.on('barista-ready', (data) => {
    console.log('👨‍💼 Barista ready to receive orders:', data);
    io.emit('baristaTurnedOnline');
  });
});

// ========================================
// Error Handling
// ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════╗
║                                   ║
║   ☕ ADORA COFFEE SYSTEM ☕        ║
║   Backend Server Running          ║
║   Port: ${PORT}                      ║
║   Environment: ${process.env.NODE_ENV}        ║
║                                   ║
╚═══════════════════════════════════╝
  `);
});

module.exports = { app, server, io };