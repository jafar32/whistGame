import React from 'react';
import { useGameStore } from '../store/gameStore';

export const BiddingPanel: React.FC = () => {
  const { currentPlayer, bids } = useGameStore();
  const placeBid = useGameStore(state => state.placeBid);
  const passBid = useGameStore(state => state.passBid);

  const highestBid = bids
    .filter(bid => !bid.pass)
    .reduce((max, bid) => Math.max(max, bid.tricks), 0);

  return (
    <div className="bg-white/90 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Place Your Bid</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        {[...Array(13 - highestBid)].map((_, i) => (
          <button
            key={i + highestBid + 1}
            onClick={() => placeBid(currentPlayer, i + highestBid + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {i + highestBid + 1}
          </button>
        ))}
        <button
          onClick={() => passBid(currentPlayer)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Pass
        </button>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Current Bids:</h3>
        <ul>
          {bids.map((bid, index) => (
            <li key={index} className="text-sm">
              Player {bid.playerId}: {bid.pass ? 'Pass' : `${bid.tricks} tricks`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};