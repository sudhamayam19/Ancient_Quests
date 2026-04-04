export type Team = 'player' | 'enemy';

export type UnitType =
  | 'pharaoh_guard'
  | 'sand_wraith'
  | 'stone_colossus'
  | 'oracle'
  | 'berserker'
  | 'blade_dancer'
  | 'shaman';

export type TowerType = 'king' | 'princess';

export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  team: Team;
  hp: number;
  maxHp: number;
  position: Position;
  alive: boolean;
}

export interface Unit {
  id: string;
  type: UnitType;
  team: Team;
  hp: number;
  maxHp: number;
  position: Position;
  speed: number;
  damage: number;
  attackRange: number;
  attackSpeed: number; // attacks per second
  lastAttackTime: number;
  targetId: string | null;
  alive: boolean;
}

export interface CardDef {
  id: UnitType;
  name: string;
  cost: number;
  emoji: string;
  color: string;
  unitStats: Omit<
    Unit,
    'id' | 'team' | 'position' | 'lastAttackTime' | 'targetId' | 'alive'
  >;
}

export type GamePhase = 'menu' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  towers: Tower[];
  units: Unit[];
  playerElixir: number;
  enemyElixir: number;
  timeLeft: number; // seconds
  playerHand: UnitType[];
  nextCard: UnitType;
  winner: Team | 'draw' | null;
}
