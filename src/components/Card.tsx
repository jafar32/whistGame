import React from 'react';
import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-800';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-24 bg-white rounded-lg shadow-md border-2 
        ${disabled ? 'opacity-50' : 'hover:shadow-lg transform hover:-translate-y-1'}
        transition-all duration-200
      `}
    >
      <div className={`absolute top-2 left-2 ${getSuitColor(card.suit)}`}>
        {card.rank}
      </div>
      <div className={`absolute bottom-2 right-2 ${getSuitColor(card.suit)}`}>
        {card.suit === 'hearts' ? '♥' :
         card.suit === 'diamonds' ? '♦' :
         card.suit === 'clubs' ? '♣' : '♠'}
      </div>
    </button>
  );
};