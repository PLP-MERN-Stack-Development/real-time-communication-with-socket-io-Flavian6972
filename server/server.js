const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and typing users
const users = {}; // socket.id => { id, username, online }
const typingUsers = {};

// 🧠 SOCKET.IO LOGIC
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User joins the chat
  socket.on('user_join', async ({ username, email, passwordHash }) => {
    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          username,
          email,
          passwordHash,
          online: true,
        });
      } else {
        user.online = true;
        await user.save();
      }

      // Save in memory
      users[socket.id] = { id: user._id, username: user.username, online: true };

      // Find or create a default room
      let room = await Room.findOne({ name: 'general' });
      if (!room) {
        room = await Room.create({
          name: 'general',
          isPrivate: false,
          members: [user._id],
        });
      } else if (!room.members.map(String).includes(String(user._id))) {
        room.members.push(user._id);
        await room.save();
      }

      socket.join(String(room._id));

      // Ensure all users have the `online` field
      await User.updateMany({ online: { $exists: false } }, { $set: { online: false } });

      // Fetch and emit updated user list
      const allUsers = await User.find({}, 'username _id online').lean();
      io.emit('user_list', allUsers);

      // Send join notification
      io.emit('user_joined', { username: user.username });

      // Send past messages for the default room
      const existingMessages = await Message.find({ room: room._id })
        .populate('sender', 'username')
        .sort({ createdAt: 1 });

      socket.emit('receive_message', existingMessages);
      socket.emit('room_joined', { roomId: String(room._id) });

      console.log(`✅ ${user.username} joined room ${room.name}`);
    } catch (err) {
      console.error('❌ user_join error:', err);
    }
  });

  // Send a message
  socket.on('send_message', async ({ roomId, content }) => {
    try {
      const userId = users[socket.id]?.id;
      if (!userId) return;

      const message = await Message.create({
        room: roomId,
        sender: userId,
        content,
      });

      const populatedMsg = await message.populate('sender', 'username');
      io.to(roomId).emit('receive_message', populatedMsg);
    } catch (err) {
      console.error('❌ send_message error:', err);
    }
  });

  // Join a specific room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  // Typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    const username = users[socket.id]?.username;
    if (!username) return;
    if (isTyping) typingUsers[socket.id] = username;
    else delete typingUsers[socket.id];
    io.to(roomId).emit('typing_users', Object.values(typingUsers));
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (!user) return;

    try {
      // Mark offline in DB
      await User.findByIdAndUpdate(user.id, { online: false });

      // Notify others
      io.emit('user_left', { username: user.username });

      // Update user list
      const allUsers = await User.find({}, 'username _id online').lean();
      io.emit('user_list', allUsers);
    } catch (err) {
      console.error('❌ disconnect error:', err);
    }

    // Remove from memory
    delete users[socket.id];
    delete typingUsers[socket.id];
    console.log(`❌ ${user.username} disconnected`);
  });
});

// 🔍 API Routes
app.get('/api/users', async (req, res) => {
  const allUsers = await User.find({}, 'username _id online');
  res.json(allUsers);
});

app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Socket.io Chat Server is running');
});

// 🚀 Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Mark everyone offline at startup
    await User.updateMany({}, { online: false });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
