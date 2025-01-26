import { create } from 'zustand';
import { GameState, Card, Suit, Player, Rank, Bid, PlayedCard, ChatMessage } from '../types/game';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

interface GameStore extends Omit<GameState, 'chat'> {
  chat: ChatMessage[];
  initializeGame: (players: Player[], mode: 'points' | 'rounds') => void;
  dealCards: () => void;
  setTrumpSuit: (suit: Suit) => void;
  playCard: (playerId: string, card: Card) => void;
  selectFirstPlayer: () => void;
  placeBid: (playerId: string, tricks: number) => void;
  passBid: (playerId: string) => void;
  evaluateTrick: (trick: PlayedCard[]) => string;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'points',
  players: [],
  currentPlayer: '',
  round: 0,
  scores: {
    team1: 0,
    team2: 0,
  },
  status: 'waiting',
  tricks: [],
  currentTrick: [],
  bids: [],
  tricksTaken: {
    team1: 0,
    team2: 0,
  },
  // Initialize with proper ChatMessage array type
  chat: [],
  soundEnabled: true,
  tableId: '',

  initializeGame: (players, mode) => {
    set({ 
      players, 
      mode, 
      status: 'waiting', 
      round: 1,
      scores: { team1: 0, team2: 0 },
      tricks: [],
      currentTrick: [],
      bids: [],
      tricksTaken: { team1: 0, team2: 0 }
    });
    get().dealCards();
  },

  dealCards: () => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        deck.push({ suit, rank });
      });
    });

    const shuffledDeck = shuffleArray(deck);
    const cardsPerPlayer = Math.floor(deck.length / 4);

    const updatedPlayers = get().players.map((player, index) => ({
      ...player,
      cards: shuffledDeck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer)
    }));

    set({ 
      players: updatedPlayers,
      status: 'bidding'
    });
    get().selectFirstPlayer();
  },

  selectFirstPlayer: () => {
    const players = get().players;
    const randomIndex = Math.floor(Math.random() * players.length);
    set({ currentPlayer: players[randomIndex].id });
  },

  placeBid: (playerId: string, tricks: number) => {
    const currentState = get();
    if (currentState.status !== 'bidding' || currentState.currentPlayer !== playerId) return;

    const newBid: Bid = { playerId, tricks, pass: false };
    const bids = [...currentState.bids, newBid];
    
    // Check if all players have bid or passed
    if (bids.length === 4 || bids.filter(b => !b.pass).length === 1) {
      const winningBid = bids.reduce((highest, current) => 
        !current.pass && (!highest || current.tricks > highest.tricks) ? current : highest
      , bids[0]);

      set({
        bids,
        winningBid,
        status: 'choosing-trump',
        currentPlayer: winningBid.playerId
      });
    } else {
      const currentPlayerIndex = currentState.players.findIndex(p => p.id === playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
      set({
        bids,
        currentPlayer: currentState.players[nextPlayerIndex].id
      });
    }
  },

  passBid: (playerId: string) => {
    const currentState = get();
    if (currentState.status !== 'bidding' || currentState.currentPlayer !== playerId) return;

    const newBid: Bid = { playerId, tricks: 0, pass: true };
    const bids = [...currentState.bids, newBid];
    
    const activeBids = bids.filter(b => !b.pass);
    if (activeBids.length === 1) {
      const winningBid = activeBids[0];
      set({
        bids,
        winningBid,
        status: 'choosing-trump',
        currentPlayer: winningBid.playerId
      });
    } else {
      const currentPlayerIndex = currentState.players.findIndex(p => p.id === playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
      set({
        bids,
        currentPlayer: currentState.players[nextPlayerIndex].id
      });
    }
  },

  setTrumpSuit: (suit) => {
    set({
      trumpSuit: suit,
      status: 'playing',
      currentTrick: []
    });
  },

  evaluateTrick: (trick: PlayedCard[]): string => {
    const currentState = get();
    if (!currentState.trumpSuit || trick.length !== 4) return '';

    const leadSuit = trick[0].card.suit;
    let winningCard = trick[0];
    let winningValue = RANK_VALUES[trick[0].card.rank];

    trick.forEach(played => {
      const isTrump = played.card.suit === currentState.trumpSuit;
      const isLeadSuit = played.card.suit === leadSuit;
      const cardValue = RANK_VALUES[played.card.rank];

      if (isTrump && winningCard.card.suit !== currentState.trumpSuit) {
        winningCard = played;
        winningValue = cardValue;
      } else if (isTrump && cardValue > winningValue) {
        winningCard = played;
        winningValue = cardValue;
      } else if (isLeadSuit && !isTrump && cardValue > winningValue && winningCard.card.suit === leadSuit) {
        winningCard = played;
        winningValue = cardValue;
      }
    });

    return winningCard.playerId;
  },

  playCard: (playerId: string, card: Card) => {
    const currentState = get();
    const playerIndex = currentState.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1 || currentState.currentPlayer !== playerId) return;

    // Remove card from player's hand
    const updatedPlayers = [...currentState.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      cards: updatedPlayers[playerIndex].cards.filter(
        c => c.suit !== card.suit || c.rank !== card.rank
      )
    };

    // Add card to current trick
    const updatedTrick = [...currentState.currentTrick, { playerId, card }];

    // If trick is complete, evaluate winner and update scores
    if (updatedTrick.length === 4) {
      const winnerId = get().evaluateTrick(updatedTrick);
      const winner = currentState.players.find(p => p.id === winnerId);
      
      if (!winner) return;
      
      const updatedTricksTaken = { ...currentState.tricksTaken };
      updatedTricksTaken[`team${winner.team}`]++;

      // Check if round is complete
      if (updatedPlayers[0].cards.length === 0) {
        // Update scores based on bid and tricks taken
        const winningBid = currentState.winningBid;
        if (!winningBid) return;

        const winningPlayer = currentState.players.find(p => p.id === winningBid.playerId);
        if (!winningPlayer) return;

        const winningTeam = winningPlayer.team;
        const bidTricks = winningBid.tricks;
        const tricksTaken = updatedTricksTaken[`team${winningTeam}`];
        const scoreDiff = tricksTaken >= bidTricks ? tricksTaken : -bidTricks;
        
        const updatedScores = { ...currentState.scores };
        updatedScores[`team${winningTeam}`] += scoreDiff;

        set({
          scores: updatedScores,
          status: currentState.mode === 'points' && 
            (Math.abs(updatedScores.team1) >= 25 || Math.abs(updatedScores.team2) >= 25) ? 
            'finished' : 'bidding',
          round: currentState.round + 1,
          currentTrick: [],
          tricks: [],
          bids: [],
          tricksTaken: { team1: 0, team2: 0 },
          winningBid: undefined,
          trumpSuit: undefined
        });

        if (currentState.status !== 'finished') {
          get().dealCards();
        }
      } else {
        set({
          currentTrick: [],
          tricks: [...currentState.tricks, updatedTrick],
          tricksTaken: updatedTricksTaken,
          currentPlayer: winnerId
        });
      }
    } else {
      // Move to next player
      const nextPlayerIndex = (playerIndex + 1) % 4;
      set({
        currentPlayer: currentState.players[nextPlayerIndex].id,
        currentTrick: updatedTrick
      });
    }

    set({ players: updatedPlayers });
  }
}));