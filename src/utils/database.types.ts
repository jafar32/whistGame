// database.types.ts
export type Player = {
    id: string;
    name: string;
    telegram_id: string;
    avatar_url?: string;
  };
  
  export type Table = {
    id: string;
    status: 'waiting' | 'playing' | 'finished';
    current_players: string[];
    mode: 'points' | 'rounds';
  };
  // database.types.ts
export type Database = {
    players: Player;
    tables: Table;
    // أضف المزيد من الجداول حسب الحاجة
  };
  
  