import React, { useState } from 'react';
import { reactToMessage } from '../utility/api';

const reactionTypes = ['👍', '❤️', '😂', '😮', '😢', '👎'];

export default function Reactions({ message, currentUser }) {
  const [reactions, setReactions] = useState(message.reactions || []);

  const handleReaction = async (type) => {
    await reactToMessage(message._id || message.id, currentUser.id, type);
    const updated = [...reactions.filter(r => r.user !== currentUser.id), { user: currentUser.id, type }];
    setReactions(updated);
  };

  const reactionCount = (type) => reactions.filter(r => r.type === type).length;

  return (
    <div className="flex mt-2 space-x-2 text-sm">
      {reactionTypes.map((type) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          className={`px-1 rounded ${
            reactions.find(r => r.user === currentUser.id && r.type === type) ? 'bg-blue-100' : 'hover:bg-gray-200'
          }`}
        >
          {type} {reactionCount(type) > 0 && <span>{reactionCount(type)}</span>}
        </button>
      ))}
    </div>
  );
}

