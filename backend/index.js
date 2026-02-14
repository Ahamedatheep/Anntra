const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    // Ensure Indexes are created
    const User = require('./models/User');
    const FoodBatch = require('./models/FoodBatch');
    User.syncIndexes();
    FoodBatch.syncIndexes();
    console.log('Indexes synced');
  })
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Pass io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/foodBatches'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/beneficiary', require('./routes/beneficiary'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/ai', require('./routes/ai'));

const { checkInactivity } = require('./services/assignmentService');

// Background Tasks
setInterval(() => {
  checkInactivity(io);
}, 60000); // Check every minute

app.get('/', (req, res) => {
  res.send('ANNTRA API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
