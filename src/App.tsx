import { useEffect, useState } from 'react';

import WebApp from '@twa-dev/sdk';
import { GameBoard } from './components/GameBoard';
import { Leaderboard } from './components/Leaderboard';
import { TableCreation } from './components/TableCreation';
import { Chat } from './components/Chat';
import { useGameStore } from './store/gameStore';
import { supabase } from './utils/supabase';

function App() {
  const [view, setView] = useState<'tables' | 'game' | 'leaderboard'>('tables');
  const initializeGame = useGameStore(state => state.initializeGame);

  useEffect(() => {
    // Initialize Telegram Web App SDK
    WebApp.ready();
    WebApp.expand();

    // Initialize Telegram user
    const initUser = async () => {
      try {
        // Check if we're in Telegram environment and have user data
        if (!WebApp.initDataUnsafe || !WebApp.initDataUnsafe.user) {
          console.warn('Not running in Telegram or missing user data');
          return;
        }

        const { user } = WebApp.initDataUnsafe;
        
        // Save or update user data in the database (e.g., using Supabase)
        const { data, error } = await supabase
          .from('players')
          .upsert({
            telegram_id: user.id.toString(), // Convert to string to ensure compatibility
            name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
            avatar_url: user.photo_url || null
          })
          .select()
          .single();

        if (error) {
          console.error('Error initializing user:', error);
          return;
        }

        if (!data) {
          console.error('No user data returned');
          return;
        }

        // Check if user is in an active game
        const { data: activeTable, error: tableError } = await supabase
          .from('tables')
          .select()
          .contains('current_players', [data.id])
          .eq('status', 'playing')
          .single();

        if (tableError && tableError.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error('Error checking active table:', tableError);
          return;
        }

        if (activeTable) {
          setView('game');
          initializeGame(activeTable.current_players, activeTable.mode);
        }
      } catch (err) {
        console.error('Error in user initialization:', err);
      }
    };

    initUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'tables' && <TableCreation />}
      {view === 'game' && (
        <>
          <GameBoard />
          <Chat />
        </>
      )}
      {view === 'leaderboard' && <Leaderboard />}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around p-4">
          <button
            onClick={() => setView('tables')}
            className={`px-4 py-2 rounded-lg ${
              view === 'tables' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Tables
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-4 py-2 rounded-lg ${
              view === 'leaderboard' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
