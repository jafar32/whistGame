export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  team: 1 | 2;
  telegramId: number;
  avatar?: string;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
}

export interface Bid {
  playerId: string;
  tricks: number;
  pass: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  message: string;
  timestamp: number;
}

export interface Table {
  id: string;
  name: string;
  mode: 'points' | 'rounds';
  players: Player[];
  isPrivate: boolean;
  password?: string;
  createdAt: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  gamesWon: number;
  totalGames: number;
  totalPoints: number;
}

export interface GameState {
  mode: 'points' | 'rounds';
  players: Player[];
  currentPlayer: string;
  trumpSuit?: Suit;
  round: number;
  scores: {
    team1: number;
    team2: number;
  };
  status: 'waiting' | 'bidding' | 'choosing-trump' | 'playing' | 'finished';
  tricks: PlayedCard[][];
  currentTrick: PlayedCard[];
  bids: Bid[];
  winningBid?: Bid;
  tricksTaken: {
    team1: number;
    team2: number;
  };
  chat: ChatMessage[];
  soundEnabled: boolean;
  tableId: string;
}