export type Team = 'player' | 'enemy';

// ── Card categories ────────────────────────────────────────────────────────────
export type CardCategory = 'unit' | 'spell' | 'building';

export type UnitType =
  | 'pharaoh_guard'
  | 'sand_wraith'
  | 'stone_colossus'
  | 'oracle'
  | 'berserker'
  | 'blade_dancer'
  | 'shaman';

export type SpellType =
  | 'sandstorm'       // medium AOE damage over 2 s
  | 'pharaohs_wrath'  // small high-burst AOE
  | 'desert_tempest'; // large AOE + slow

export type BuildingType =
  | 'obelisk'          // defensive sniper tower
  | 'burial_chamber'   // spawns Sand Wraiths periodically
  | 'inferno_trap';    // high-DPS melee burn trap

export type CardId = UnitType | SpellType | BuildingType;

// ── Geometry ──────────────────────────────────────────────────────────────────
export type TowerType = 'king' | 'princess';

export interface Position {
  x: number;
  y: number;
}

// ── Entities ──────────────────────────────────────────────────────────────────
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
  attackSpeed: number;   // attacks per second
  lastAttackTime: number;
  targetId: string | null;
  alive: boolean;
  slowedUntil: number;   // ms timestamp; 0 = not slowed
}

export interface Spell {
  id: string;
  type: SpellType;
  team: Team;
  position: Position;
  radius: number;
  totalDamage: number;   // total damage dealt over full duration
  duration: number;      // seconds
  elapsed: number;       // seconds elapsed so far
  slowDuration: number;  // seconds to slow targets; 0 = no slow
}

export interface Building {
  id: string;
  type: BuildingType;
  team: Team;
  hp: number;
  maxHp: number;
  position: Position;
  alive: boolean;
  attackRange: number;
  dps: number;           // damage per second (continuous model)
  lastAttackTime: number;
  spawnType: UnitType | null;
  spawnInterval: number; // seconds; 0 = not a spawner
  lastSpawnTime: number;
}

// ── Card definitions (discriminated union) ────────────────────────────────────
interface BaseCardDef {
  id: CardId;
  name: string;
  cost: number;
  emoji: string;
  color: string;
  category: CardCategory;
}

export interface UnitCardDef extends BaseCardDef {
  category: 'unit';
  unitStats: Omit<Unit, 'id' | 'team' | 'position' | 'lastAttackTime' | 'targetId' | 'alive' | 'slowedUntil'>;
}

export interface SpellCardDef extends BaseCardDef {
  category: 'spell';
  radius: number;
  totalDamage: number;
  duration: number;
  slowDuration: number;
}

export interface BuildingCardDef extends BaseCardDef {
  category: 'building';
  hp: number;
  attackRange: number;
  dps: number;
  spawnType: UnitType | null;
  spawnInterval: number;
}

export type CardDef = UnitCardDef | SpellCardDef | BuildingCardDef;

// ── Game state ────────────────────────────────────────────────────────────────
export type GamePhase = 'menu' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  towers: Tower[];
  units: Unit[];
  spells: Spell[];
  buildings: Building[];
  playerElixir: number;
  enemyElixir: number;
  timeLeft: number;
  playerHand: CardId[];
  nextCard: CardId;
  winner: Team | 'draw' | null;
}
