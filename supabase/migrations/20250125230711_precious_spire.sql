/*
  # Initial Schema Setup for Whist Game

  1. New Tables
    - `players`
      - Player information and statistics
    - `tables`
      - Game tables and their settings
    - `games`
      - Game history and results
    - `leaderboard`
      - Weekly and all-time leaderboard data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are viewable by all users"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mode text NOT NULL,
  is_private boolean DEFAULT false,
  password text,
  created_by uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'waiting',
  current_players jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tables are viewable by all users"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tables"
  ON tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES tables(id),
  mode text NOT NULL,
  players jsonb NOT NULL,
  scores jsonb NOT NULL,
  winner_team integer NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  rounds integer
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by all users"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id),
  week_start date NOT NULL,
  games_won integer DEFAULT 0,
  total_games integer DEFAULT 0,
  total_points integer DEFAULT 0,
  UNIQUE(player_id, week_start)
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by all users"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (true);

-- Function to update weekly leaderboard
CREATE OR REPLACE FUNCTION update_weekly_leaderboard()
RETURNS trigger AS $$
BEGIN
  INSERT INTO leaderboard (player_id, week_start, games_won, total_games, total_points)
  SELECT
    id as player_id,
    date_trunc('week', CURRENT_DATE) as week_start,
    games_won,
    games_played as total_games,
    total_points
  FROM players
  WHERE id = NEW.id
  ON CONFLICT (player_id, week_start)
  DO UPDATE SET
    games_won = EXCLUDED.games_won,
    total_games = EXCLUDED.total_games,
    total_points = EXCLUDED.total_points;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard when player stats change
CREATE TRIGGER update_leaderboard_trigger
AFTER UPDATE OF games_won, games_played, total_points ON players
FOR EACH ROW
EXECUTE FUNCTION update_weekly_leaderboard();