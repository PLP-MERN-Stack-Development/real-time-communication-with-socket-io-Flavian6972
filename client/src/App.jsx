import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Initialize socket (singleton)
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: true,
});

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [popupMessage, setPopupMessage] = useState(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Connection error:", err));

    // Room joined confirmation
    socket.on("room_joined", ({ roomId }) => {
      setRoomId(roomId);
    });

    // Receive messages (initial batch or single)
    socket.on("receive_message", (msg) => {
      if (Array.isArray(msg)) {
        const normalized = msg.map((m) => ({
          id: m._id,
          sender: m.sender?.username || "Unknown",
          content: m.content,
          createdAt: m.createdAt,
        }));
        setMessages(normalized);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id,
            sender: msg.sender?.username || "Unknown",
            content: msg.content,
            createdAt: msg.createdAt,
          },
        ]);
      }
    });

    // Updated list of all users
    socket.on("user_list", (users) => {
      setAllUsers(users || []);
    });

    // Typing indicator
    socket.on("typing_users", (users) => {
      setTypingUsers(users || []);
    });

    // Popup when someone joins
    socket.on("user_joined", ({ username }) => {
      if (username !== socket.username) {
        setPopupMessage(`${username} joined the chat`);
        setTimeout(() => setPopupMessage(null), 3000);
      }
    });

    // Popup when someone leaves
    socket.on("user_left", ({ username }) => {
      setPopupMessage(`${username} went offline`);
      setTimeout(() => setPopupMessage(null), 3000);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room_joined");
      socket.off("receive_message");
      socket.off("user_list");
      socket.off("typing_users");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  const handleLogin = () => {
    if (!username.trim()) return;
    socket.username = username; // store locally

    socket.emit("user_join", {
      username,
      email: `${username}@example.com`,
      passwordHash: "fakehash",
    });

    setIsLoggedIn(true);
  };

  const handleSend = () => {
    if (!message.trim() || !roomId) return;

    socket.emit("send_message", { roomId, content: message });
    setMessage("");
    socket.emit("typing", { roomId, isTyping: false });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (roomId) socket.emit("typing", { roomId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (roomId) socket.emit("typing", { roomId, isTyping: false });
    }, 1000);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">
          Enter your username
        </h1>
        <input
          type="text"
          className="border p-2 rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Pop-up notifications */}
      {popupMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow-lg z-50">
          {popupMessage}
        </div>
      )}

      <div className="flex h-screen bg-gray-100">
        {/* Sidebar: All users list */}
        <div className="w-1/4 p-4 border-r border-gray-300 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Users</h2>
          <ul>
            {allUsers.map((user) => (
              <li
                key={user._id}
                className="mb-2 flex items-center justify-between bg-white shadow rounded p-2"
              >
                <span>{user.username}</span>
                <span
                  className={`h-3 w-3 rounded-full ${
                    user.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg shadow max-w-xs ${
                  msg.sender === username
                    ? "bg-blue-100 self-end ml-auto"
                    : "bg-white self-start"
                }`}
              >
                <div className="text-sm font-bold mb-1">{msg.sender}</div>
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {typingUsers.length > 0 && (
            <div className="mb-2 text-gray-500">
              {typingUsers.join(", ")}{" "}
              {typingUsers.length > 1 ? "are" : "is"} typing...
            </div>
          )}

          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border p-2 rounded mr-2"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
