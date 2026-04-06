export type Team = 'player' | 'enemy';

// ── Super abilities ──────────────────────────────────────────────────────────
export type SuperType =
  | 'heal_ally'      // heal nearest wounded ally to full
  | 'shield'         // give self or nearest ally a shield absorbing damage
  | 'rage'           // boost all nearby ally damage by 40% for 4s
  | 'chain_lightning' // deal damage to target + 2 nearest enemies
  | 'summon_minion'  // spawn a weak copy of self nearby
  | 'piercing_arrow'; // pierce through all enemies in a line

export interface SuperAbility {
  type: SuperType;
  chargeTime: number;   // seconds to fill meter
  radius?: number;       // effect radius (for AOE supers)
  potency?: number;      // value varies by type (heal amount, shield HP, etc.)
  duration?: number;    // for timed effects
  description?: string; // ability flavor text
}

export interface SuperMeter {
  current: number;  // 0 to chargeTime
}

// ── Card categories ────────────────────────────────────────────────────────────
export type CardCategory = 'unit' | 'spell' | 'building';

export type UnitType =
  | 'pharaoh_guard'
  | 'sand_wraith'
  | 'stone_colossus'
  | 'oracle'
  | 'berserker'
  | 'blade_dancer'
  | 'shaman'
  | 'princess_archer';

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
  superMeter: number;     // current charge 0–chargeTime; 0 = no super
  superFiredAt: number;   // ms timestamp when super last fired; 0 = never
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
  decayTime: number;     // seconds until building expires; 0 = permanent
  placedAt: number;      // timestamp when building was placed
}

export interface Projectile {
  id: string;
  team: Team;
  from: Position;       // starting position
  to: Position;         // target position
  progress: number;     // 0–1 travel progress
  damage: number;
  targetId: string;     // what it's hitting
  speed: number;        // pixels per second
  color: string;        // projectile color
  emoji?: string;      // optional emoji in center
  isPiercingArrow?: boolean; // special arrow that draws a long trail
  angle?: number;       // direction angle for piercing arrow
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
  unitStats: Omit<Unit, 'id' | 'team' | 'position' | 'lastAttackTime' | 'targetId' | 'alive' | 'slowedUntil' | 'superMeter' | 'superFiredAt'>;
  super?: SuperAbility;
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
  decayTime: number;
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
  projectiles: Projectile[];
  playerElixir: number;
  enemyElixir: number;
  timeLeft: number;
  playerHand: CardId[];
  nextCard: CardId;
  winner: Team | 'draw' | null;
}
