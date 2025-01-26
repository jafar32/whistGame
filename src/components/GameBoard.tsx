import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { TrumpSelector } from './TrumpSelector';
import { BiddingPanel } from './BiddingPanel';

export const GameBoard: React.FC = () => {
  const { 
    players, 
    currentPlayer, 
    status, 
    scores, 
    currentTrick, 
    trumpSuit,
    tricksTaken,
    winningBid 
  } = useGameStore();
  
  const currentPlayerData = players.find(p => p.id === currentPlayer);

  return (
    <div className="min-h-screen bg-green-800 p-4">
      {/* Score Display */}
      <div className="bg-white/90 rounded-lg p-4 mb-4">
        <div className="flex justify-between mb-2">
          <div>Team 1: {scores.team1}</div>
          <div>Team 2: {scores.team2}</div>
        </div>
        {status === 'playing' && (
          <div className="flex justify-between text-sm">
            <div>Tricks: {tricksTaken.team1}</div>
            <div>Tricks: {tricksTaken.team2}</div>
          </div>
        )}
      </div>

      {/* Trump Suit Display */}
      {trumpSuit && (
        <div className="bg-white/90 rounded-lg p-2 mb-4 text-center">
          <div>Trump Suit: {trumpSuit === 'hearts' ? '♥' :
                           trumpSuit === 'diamonds' ? '♦' :
                           trumpSuit === 'clubs' ? '♣' : '♠'}</div>
          {winningBid && (
            <div className="text-sm mt-1">
              Bid: {winningBid.tricks} tricks by Player {winningBid.playerId}
            </div>
          )}
        </div>
      )}

      {/* Game Status */}
      <div className="text-white text-center mb-4">
        {status === 'waiting' && 'Waiting for players...'}
        {status === 'bidding' && currentPlayerData && (
          <>
            <div className="mb-2">{currentPlayerData.name}'s turn to bid</div>
            <BiddingPanel />
          </>
        )}
        {status === 'choosing-trump' && currentPlayerData && (
          <>
            <div className="mb-2">{currentPlayerData.name}'s turn to choose trump</div>
            <TrumpSelector />
          </>
        )}
        {status === 'playing' && `${currentPlayerData?.name}'s turn`}
        {status === 'finished' && 'Game Over!'}
      </div>

      {/* Current Trick */}
      {currentTrick.length > 0 && (
        <div className="flex justify-center gap-4 mb-8">
          {currentTrick.map((played, index) => (
            <Card key={index} card={played.card} disabled />
          ))}
        </div>
      )}

      {/* Player's Hand */}
      {currentPlayerData && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2 flex-wrap justify-center" style={{ maxWidth: '100vw' }}>
            {currentPlayerData.cards.map((card, index) => (
              <Card
                key={`${card.suit}-${card.rank}`}
                card={card}
                onClick={() => useGameStore.getState().playCard(currentPlayerData.id, card)}
                disabled={currentPlayer !== currentPlayerData.id || status !== 'playing'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};