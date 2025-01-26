import React, { useState } from 'react';
import { Users, Lock, Unlock } from 'lucide-react';
import { supabase } from '../utils/supabase';
import WebApp from '@twa-dev/sdk';

export const TableCreation: React.FC = () => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'points' | 'rounds'>('points');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if we're in Telegram environment and have user data
      if (!WebApp.initDataUnsafe || !WebApp.initDataUnsafe.user) {
        throw new Error('Not running in Telegram or missing user data');
      }

      const { data: userData } = await supabase
        .from('players')
        .select('id')
        .eq('telegram_id', WebApp.initDataUnsafe.user.id.toString())
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      const { data: table, error: tableError } = await supabase
        .from('tables')
        .insert({
          name,
          mode,
          is_private: isPrivate,
          password: isPrivate ? password : null,
          created_by: userData.id,
          current_players: [userData.id]
        })
        .select()
        .single();

      if (tableError) throw tableError;

      // Use MainButton for navigation instead of direct URL change
      WebApp.MainButton.setText('Join Table');
      WebApp.MainButton.onClick(() => {
        // Handle table navigation through your app's routing system
        window.location.href = `/table/${table.id}`;
      });
      WebApp.MainButton.show();

    } catch (err) {
      console.error('Error creating table:', err);
      setError(err instanceof Error ? err.message : 'Failed to create table');
      
      // Use BackButton to show error since showPopup is not supported
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        setError(null);
        WebApp.BackButton.hide();
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users />
        Create New Table
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Table Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter table name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Game Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('points')}
              className={`flex-1 px-3 py-2 rounded-lg ${
                mode === 'points'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Points (±25)
            </button>
            <button
              onClick={() => setMode('rounds')}
              className={`flex-1 px-3 py-2 rounded-lg ${
                mode === 'rounds'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              5 Rounds
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Private Table</span>
            {isPrivate ? <Lock size={16} /> : <Unlock size={16} />}
          </label>
        </div>

        {isPrivate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter table password..."
            />
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isLoading || !name}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Table'}
        </button>
      </div>
    </div>
  );
};