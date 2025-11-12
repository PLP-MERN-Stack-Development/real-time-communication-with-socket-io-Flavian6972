import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Message from './Message';

const socket = io('http://localhost:5000'); // adjust if needed

export default function ChatRoom({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [privateRecipient, setPrivateRecipient] = useState(null); // for private chat

  useEffect(() => {
    // Join the chat
    socket.emit('user_join', currentUser.username);

    // Listen for online users
    socket.on('user_list', setOnlineUsers);
    socket.on('user_joined', (user) => setOnlineUsers(prev => [...prev, user]));
    socket.on('user_left', (user) =>
      setOnlineUsers(prev => prev.filter(u => u.id !== user.id))
    );

    // Listen for messages
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('private_message', (msg) => setMessages(prev => [...prev, msg]));

    // Typing indicators
    socket.on('typing_users', setTypingUsers);

    return () => {
      socket.off('user_list');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('receive_message');
      socket.off('private_message');
      socket.off('typing_users');
    };
  }, [currentUser.username]);

  const handleSend = () => {
    if (!input.trim()) return;

    const payload = { message: input };
    if (privateRecipient) {
      payload.to = privateRecipient.id;
      socket.emit('private_message', payload);
    } else {
      socket.emit('send_message', payload);
    }

    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing', e.target.value.length > 0);
  };

  return (
    <div className="flex h-full">
      {/* Online Users */}
      <div className="w-1/4 bg-gray-200 p-2 overflow-y-auto">
        <h2 className="font-bold mb-2">Online Users</h2>
        {onlineUsers.map(user => (
          <div
            key={user.id}
            className={`p-1 cursor-pointer ${privateRecipient?.id === user.id ? 'bg-blue-100' : ''}`}
            onClick={() => setPrivateRecipient(user)}
          >
            {user.username}
          </div>
        ))}
        {privateRecipient && (
          <div className="mt-2 text-sm text-gray-600">
            Chatting privately with: {privateRecipient.username} <button onClick={() => setPrivateRecipient(null)} className="ml-2 text-red-500">X</button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-2 bg-gray-100">
        <div className="flex-1 overflow-y-auto mb-2">
          {messages.map(msg => (
            <Message key={msg.id || msg._id} message={msg} currentUser={currentUser} />
          ))}
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 mb-1">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Input */}
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
