import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '../utils/supabase';
import type { LeaderboardEntry } from '../types/game';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'allTime'>('weekly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from(timeframe === 'weekly' ? 'leaderboard' : 'players')
        .select('*')
        .order('games_won', { ascending: false })
        .limit(10);

      if (timeframe === 'weekly') {
        query = query.eq('week_start', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEntries(
        data.map((entry) => ({
          playerId: entry.player_id || entry.id,
          playerName: entry.name || 'Unknown Player',
          gamesWon: entry.games_won,
          totalGames: entry.total_games,
          totalPoints: entry.total_points,
        }))
      );
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Leaderboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded-lg ${
              timeframe === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('allTime')}
            className={`px-3 py-1 rounded-lg ${
              timeframe === 'allTime'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div
              key={entry.playerId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-orange-600'
                      : 'bg-gray-200'
                  } text-white font-bold`}
                >
                  {index + 1}
                </span>
                <span className="font-medium">{entry.playerName}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{entry.gamesWon} wins</div>
                <div className="text-sm text-gray-500">
                  {entry.totalPoints} points
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};