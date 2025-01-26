import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { ChatMessage } from '../types/game';

export const Chat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { chat, players, currentPlayer } = useGameStore();
  const sendMessage = useGameStore(state => state.sendMessage);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isOpen]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(currentPlayer, message.trim());
      setMessage('');
    }
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-bold">Team Chat</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-3">
        {chat.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.playerId === currentPlayer ? 'text-right' : ''
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                msg.playerId === currentPlayer
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {getPlayerName(msg.playerId)}
              </div>
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};