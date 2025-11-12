# Real-Time Chat Application with Socket.io

A **real-time group chat application** built using **React**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.  
The app supports live messaging, user presence (online/offline indicators), typing notifications, and message persistence — just like WhatsApp Web (simplified version).

---

## 🚀 Project Overview

This project implements a **full-stack real-time chat platform** where users can:

- Join a public chat room.
- See all other users who’ve ever joined (with live online/offline status indicators).
- Send and receive messages instantly (stored in MongoDB).
- View previous messages even after reloading the page.
- Receive pop-up notifications when users join or leave.
- Send private messages between users (1:1 DM).

The backend uses **Socket.IO** for real-time communication and **MongoDB** for persistence, while the frontend is powered by **React** and **Tailwind CSS** for a modern and responsive UI.

---

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Features Implemented

###  Real-Time Messaging
- Instant send and receive messages using Socket.IO.
- Messages persist in MongoDB.
- Reloading the page doesn’t lose chat history.

###  User Authentication (Lite)
- Simple username-based login (no password required).
- Automatically assigns a default “general” room.

###  User Presence & Status
- Shows all users who have ever joined.
- Green dot 🟢 for online users.
- Gray dot ⚫ for offline users.
- Popup notifications when users join or leave.

###  Typing Indicators
- Displays “user is typing…” message when someone types.

###  Private Messaging (1:1)
- Click a username to start a private chat.
- Private messages are stored and isolated per room.

###  Notifications
- Join/leave pop-ups.
- (Optional extensions) browser or sound notifications.

###  Responsive UI
- Built with TailwindCSS for a clean, WhatsApp-like layout.
- Works seamlessly on desktop and mobile.

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (Vite) + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Real-time Communication** | Socket.IO |
| **Database** | MongoDB with Mongoose |
| **Environment Variables** | dotenv |
| **Styling** | TailwindCSS |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash```
git clone https://github.com/your-username/realtime-chat-app.git
cd realtime-chat-app

### 2. Backend Setup
```bash```
cd server
npm install


### 3. Create .env file in the server folder:
```env```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatApp
CLIENT_URL=http://localhost:5173

### 4. Start the Server:
```bash```
npm start

### 5. Frontend Setup
```bash```
cd client
npm install
npm run dev

The frontend will run at ```http://localhost:5173```

### 🖼️ Screenshot Example

![Chat Interface Screenshot](./screenshots/socket-io-chat.jpg)

## 🔮 Future Improvements

- **Search Messages**  
  Implement a search bar to quickly find past messages.

- **Message Read Receipts**  
  Show when a message has been seen by the recipient.

- **File/Image Sharing**  
  Allow users to send images, videos, and documents.

- **Push & Sound Notifications**  
  Notify users of new messages even when the tab is inactive.

- **User Authentication with JWT**  
  Secure login system using JSON Web Tokens.

- **Group and Private Chat Separation**  
  Organize chats into groups and one-on-one private conversations.


