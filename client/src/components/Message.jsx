import React, { useEffect, useState } from 'react';
import Reactions from './Reactions';
import { markMessageRead } from '../utility/api';

export default function Message({ message, currentUser }) {
  const [readByMe, setReadByMe] = useState(false);

  useEffect(() => {
    if (message.readBy && !message.readBy.includes(currentUser.id)) {
      markMessageRead(message._id || message.id, currentUser.id);
    } else {
      setReadByMe(true);
    }
  }, [message, currentUser.id]);

  return (
    <div
      className={`flex flex-col p-2 mb-2 rounded-lg shadow-sm ${
        message.senderId === currentUser.id ? 'bg-blue-100 self-end' : 'bg-white self-start'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold">{message.sender || message.sender?.username}</span>
        {readByMe && <span className="text-xs text-green-500 font-semibold">✓ Read</span>}
      </div>

      <div className="mt-1">
        <p>{message.message || message.content}</p>
        {message.fileUrl && (
          <img src={message.fileUrl} alt="attachment" className="mt-2 max-w-xs rounded" />
        )}
      </div>

      <Reactions message={message} currentUser={currentUser} />
    </div>
  );
}
