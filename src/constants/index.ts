import { CardDef } from '../types';

export const ARENA_WIDTH = 370;
export const ARENA_HEIGHT = 620;
export const RIVER_Y = ARENA_HEIGHT / 2;

export const LEFT_LANE_X = ARENA_WIDTH * 0.28;
export const RIGHT_LANE_X = ARENA_WIDTH * 0.72;
export const CENTER_X = ARENA_WIDTH / 2;

export const PLAYER_KING_POS = { x: CENTER_X, y: ARENA_HEIGHT * 0.88 };
export const PLAYER_LEFT_TOWER_POS = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.76 };
export const PLAYER_RIGHT_TOWER_POS = { x: RIGHT_LANE_X, y: ARENA_HEIGHT * 0.76 };

export const ENEMY_KING_POS = { x: CENTER_X, y: ARENA_HEIGHT * 0.12 };
export const ENEMY_LEFT_TOWER_POS = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.24 };
export const ENEMY_RIGHT_TOWER_POS = { x: RIGHT_LANE_X, y: ARENA_HEIGHT * 0.24 };

export const TOWER_RADIUS = 28;
export const UNIT_RADIUS = 12;

export const GAME_DURATION = 180;
export const ELIXIR_MAX = 10;
export const PLAYER_ELIXIR_REGEN = 1.2;
export const ENEMY_ELIXIR_REGEN = 1.0;

// ── Original ancient-world troop roster ──────────────────────────────────────
//
//  Pharaoh's Guard  — Egyptian heavy lancer. Tanky frontliner.
//  Sand Wraith      — Egyptian fast glass-cannon scout.
//  Stone Colossus   — Greek titan. Slow, massive HP, ignores units → towers only.
//  Oracle           — Greek long-range bolt thrower. Fragile sniper.
//  Berserker        — Norse rage warrior. Fast melee, self-damages when low HP.
//  Blade Dancer     — Persian acrobat. Highest speed, medium stats.
//  Shaman           — Tribal spirit caller. Slow but high damage.
//
// ─────────────────────────────────────────────────────────────────────────────

export const CARD_POOL: CardDef[] = [
  {
    id: 'pharaoh_guard',
    name: "Pharaoh's Guard",
    cost: 3,
    emoji: '𓂀',   // Eye of Horus as stand-in; rendered as text
    color: '#c9a84c',
    unitStats: {
      type: 'pharaoh_guard',
      hp: 1400,
      maxHp: 1400,
      speed: 36,
      damage: 110,
      attackRange: 28,
      attackSpeed: 1.0,
    },
  },
  {
    id: 'sand_wraith',
    name: 'Sand Wraith',
    cost: 2,
    emoji: '🌪',
    color: '#d4a96a',
    unitStats: {
      type: 'sand_wraith',
      hp: 260,
      maxHp: 260,
      speed: 68,
      damage: 75,
      attackRange: 22,
      attackSpeed: 1.6,
    },
  },
  {
    id: 'stone_colossus',
    name: 'Stone Colossus',
    cost: 6,
    emoji: '🗿',
    color: '#7f8c8d',
    unitStats: {
      type: 'stone_colossus',
      hp: 4200,
      maxHp: 4200,
      speed: 18,
      damage: 220,
      attackRange: 34,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'oracle',
    name: 'Oracle',
    cost: 4,
    emoji: '🔮',
    color: '#5d6af5',
    unitStats: {
      type: 'oracle',
      hp: 520,
      maxHp: 520,
      speed: 32,
      damage: 175,
      attackRange: 105,
      attackSpeed: 0.88,
    },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    cost: 3,
    emoji: '🪓',
    color: '#e74c3c',
    unitStats: {
      type: 'berserker',
      hp: 900,
      maxHp: 900,
      speed: 56,
      damage: 140,
      attackRange: 26,
      attackSpeed: 1.3,
    },
  },
  {
    id: 'blade_dancer',
    name: 'Blade Dancer',
    cost: 4,
    emoji: '🌙',
    color: '#e91e8c',
    unitStats: {
      type: 'blade_dancer',
      hp: 680,
      maxHp: 680,
      speed: 72,
      damage: 120,
      attackRange: 24,
      attackSpeed: 1.4,
    },
  },
  {
    id: 'shaman',
    name: 'Shaman',
    cost: 5,
    emoji: '🦴',
    color: '#27ae60',
    unitStats: {
      type: 'shaman',
      hp: 780,
      maxHp: 780,
      speed: 28,
      damage: 210,
      attackRange: 85,
      attackSpeed: 0.75,
    },
  },
];
