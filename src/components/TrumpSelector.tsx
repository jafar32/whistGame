import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { Suit } from '../types/game';

export const TrumpSelector: React.FC = () => {
  const setTrumpSuit = useGameStore(state => state.setTrumpSuit);

  const suits: { suit: Suit; symbol: string }[] = [
    { suit: 'hearts', symbol: '♥' },
    { suit: 'diamonds', symbol: '♦' },
    { suit: 'clubs', symbol: '♣' },
    { suit: 'spades', symbol: '♠' }
  ];

  return (
    <div className="flex justify-center gap-4">
      {suits.map(({ suit, symbol }) => (
        <button
          key={suit}
          onClick={() => setTrumpSuit(suit)}
          className={`
            w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl
            ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-800'}
            hover:transform hover:scale-110 transition-transform
          `}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
};