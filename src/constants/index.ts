import { CardDef } from '../types';

export const ARENA_WIDTH  = 370;
export const ARENA_HEIGHT = 620;
export const RIVER_Y      = ARENA_HEIGHT / 2;

export const LEFT_LANE_X  = ARENA_WIDTH * 0.28;
export const RIGHT_LANE_X = ARENA_WIDTH * 0.72;
export const CENTER_X     = ARENA_WIDTH / 2;

export const PLAYER_KING_POS         = { x: CENTER_X,    y: ARENA_HEIGHT * 0.88 };
export const PLAYER_LEFT_TOWER_POS   = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.76 };
export const PLAYER_RIGHT_TOWER_POS  = { x: RIGHT_LANE_X,y: ARENA_HEIGHT * 0.76 };

export const ENEMY_KING_POS          = { x: CENTER_X,    y: ARENA_HEIGHT * 0.12 };
export const ENEMY_LEFT_TOWER_POS    = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.24 };
export const ENEMY_RIGHT_TOWER_POS   = { x: RIGHT_LANE_X,y: ARENA_HEIGHT * 0.24 };

export const TOWER_RADIUS   = 28;
export const UNIT_RADIUS    = 12;
export const BUILDING_RADIUS = 20;

export const GAME_DURATION        = 180;
export const ELIXIR_MAX           = 10;
export const PLAYER_ELIXIR_REGEN  = 1.2;
export const ENEMY_ELIXIR_REGEN   = 1.0;

// ─────────────────────────────────────────────────────────────────────────────
//  UNITS  (7 ancient-world originals)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  SPELLS  (3)
//
//  Sandstorm        — Egyptian AOE, medium radius, moderate damage over 2 s
//  Pharaoh's Wrath  — High-burst small AOE, instant-ish (0.6 s)
//  Desert Tempest   — Large slow-field + damage over 3 s
// ─────────────────────────────────────────────────────────────────────────────
//  BUILDINGS  (3)
//
//  Obelisk          — Defensive sniper, 100-range, 1 800 HP
//  Burial Chamber   — Spawner: releases a Sand Wraith every 10 s, 900 HP
//  Inferno Trap     — Short-range burn trap, very high DPS, 500 HP
// ─────────────────────────────────────────────────────────────────────────────

export const CARD_POOL: CardDef[] = [
  // ── UNITS ────────────────────────────────────────────────────────────────
  {
    id: 'pharaoh_guard',
    name: "Pharaoh's Guard",
    cost: 3,
    emoji: '𓂀',
    color: '#c9a84c',
    category: 'unit',
    unitStats: {
      type: 'pharaoh_guard',
      hp: 1400, maxHp: 1400,
      speed: 36, damage: 110,
      attackRange: 28, attackSpeed: 1.0,
          },
    super: {
      type: 'shield',
      chargeTime: 8,
      potency: 400,
    },
  },
  {
    id: 'sand_wraith',
    name: 'Sand Wraith',
    cost: 2,
    emoji: '🌪',
    color: '#d4a96a',
    category: 'unit',
    unitStats: {
      type: 'sand_wraith',
      hp: 260, maxHp: 260,
      speed: 68, damage: 75,
      attackRange: 22, attackSpeed: 1.6,
          },
    super: {
      type: 'rage',
      chargeTime: 10,
      radius: 80,
      potency: 40,  // +40% damage
      duration: 4,
    },
  },
  {
    id: 'stone_colossus',
    name: 'Stone Colossus',
    cost: 6,
    emoji: '🗿',
    color: '#7f8c8d',
    category: 'unit',
    unitStats: {
      type: 'stone_colossus',
      hp: 4200, maxHp: 4200,
      speed: 18, damage: 220,
      attackRange: 34, attackSpeed: 0.6,
          },
    super: {
      type: 'summon_minion',
      chargeTime: 14,
      radius: 60,
    },
  },
  {
    id: 'oracle',
    name: 'Oracle',
    cost: 4,
    emoji: '🔮',
    color: '#5d6af5',
    category: 'unit',
    unitStats: {
      type: 'oracle',
      hp: 520, maxHp: 520,
      speed: 32, damage: 175,
      attackRange: 105, attackSpeed: 0.88,
          },
    super: {
      type: 'heal_ally',
      chargeTime: 9,
      radius: 90,
      potency: 9999,  // full heal
    },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    cost: 3,
    emoji: '🪓',
    color: '#e74c3c',
    category: 'unit',
    unitStats: {
      type: 'berserker',
      hp: 900, maxHp: 900,
      speed: 56, damage: 140,
      attackRange: 26, attackSpeed: 1.3,
          },
    super: {
      type: 'rage',
      chargeTime: 7,
      radius: 100,
      potency: 50,  // +50% damage
      duration: 5,
    },
  },
  {
    id: 'blade_dancer',
    name: 'Blade Dancer',
    cost: 4,
    emoji: '🌙',
    color: '#e91e8c',
    category: 'unit',
    unitStats: {
      type: 'blade_dancer',
      hp: 680, maxHp: 680,
      speed: 72, damage: 120,
      attackRange: 24, attackSpeed: 1.4,
          },
    super: {
      type: 'shield',
      chargeTime: 6,
      potency: 300,
    },
  },
  {
    id: 'shaman',
    name: 'Shaman',
    cost: 5,
    emoji: '🦴',
    color: '#27ae60',
    category: 'unit',
    unitStats: {
      type: 'shaman',
      hp: 780, maxHp: 780,
      speed: 28, damage: 210,
      attackRange: 85, attackSpeed: 0.75,
          },
    super: {
      type: 'heal_ally',
      chargeTime: 8,
      radius: 80,
      potency: 9999,
    },
  },

  // ── SPELLS ───────────────────────────────────────────────────────────────
  {
    id: 'sandstorm',
    name: 'Sandstorm',
    cost: 3,
    emoji: '🏜️',
    color: '#e67e22',
    category: 'spell',
    radius: 65,
    totalDamage: 450,
    duration: 2.0,
    slowDuration: 0,
  },
  {
    id: 'pharaohs_wrath',
    name: "Pharaoh's Wrath",
    cost: 4,
    emoji: '⚡',
    color: '#f1c40f',
    category: 'spell',
    radius: 40,
    totalDamage: 850,
    duration: 0.5,
    slowDuration: 0,
  },
  {
    id: 'desert_tempest',
    name: 'Desert Tempest',
    cost: 5,
    emoji: '🌀',
    color: '#9b59b6',
    category: 'spell',
    radius: 82,
    totalDamage: 320,
    duration: 3.0,
    slowDuration: 2.5,  // slows hit units for 2.5 s
  },

  // ── BUILDINGS ────────────────────────────────────────────────────────────
  {
    id: 'obelisk',
    name: 'Obelisk',
    cost: 4,
    emoji: '🪬',
    color: '#bdc3c7',
    category: 'building',
    hp: 1800,
    attackRange: 100,
    dps: 95,
    spawnType: null,
    spawnInterval: 0,
    decayTime: 30,   // permanent structure, no decay
  },
  {
    id: 'burial_chamber',
    name: 'Burial Chamber',
    cost: 5,
    emoji: '⚰️',
    color: '#6c3483',
    category: 'building',
    hp: 900,
    attackRange: 0,
    dps: 0,
    spawnType: 'sand_wraith',
    spawnInterval: 10,
    decayTime: 45,   // crumbles after 45 seconds
  },
  {
    id: 'inferno_trap',
    name: 'Inferno Trap',
    cost: 3,
    emoji: '🔥',
    color: '#c0392b',
    category: 'building',
    hp: 500,
    attackRange: 48,
    dps: 180,
    spawnType: null,
    spawnInterval: 0,
    decayTime: 20,   // short-lived trap
  },
];
