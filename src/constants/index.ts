import { CardDef } from '../types';

export const ARENA_WIDTH = 370;
export const ARENA_HEIGHT = 620;
export const RIVER_Y = ARENA_HEIGHT / 2; // y center of river

// Lane x positions
export const LEFT_LANE_X = ARENA_WIDTH * 0.28;
export const RIGHT_LANE_X = ARENA_WIDTH * 0.72;
export const CENTER_X = ARENA_WIDTH / 2;

// Tower positions (normalized arena coords)
export const PLAYER_KING_POS = { x: CENTER_X, y: ARENA_HEIGHT * 0.88 };
export const PLAYER_LEFT_TOWER_POS = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.76 };
export const PLAYER_RIGHT_TOWER_POS = { x: RIGHT_LANE_X, y: ARENA_HEIGHT * 0.76 };

export const ENEMY_KING_POS = { x: CENTER_X, y: ARENA_HEIGHT * 0.12 };
export const ENEMY_LEFT_TOWER_POS = { x: LEFT_LANE_X, y: ARENA_HEIGHT * 0.24 };
export const ENEMY_RIGHT_TOWER_POS = { x: RIGHT_LANE_X, y: ARENA_HEIGHT * 0.24 };

export const TOWER_RADIUS = 28;
export const UNIT_RADIUS = 12;

export const GAME_DURATION = 180; // 3 minutes in seconds
export const ELIXIR_MAX = 10;
export const PLAYER_ELIXIR_REGEN = 1.2; // per second
export const ENEMY_ELIXIR_REGEN = 0.9;

export const CARD_POOL: CardDef[] = [
  {
    id: 'knight',
    name: 'Knight',
    cost: 3,
    emoji: '⚔️',
    color: '#c0392b',
    unitStats: {
      type: 'knight',
      hp: 1200,
      maxHp: 1200,
      speed: 38,
      damage: 120,
      attackRange: 30,
      attackSpeed: 1.0,
    },
  },
  {
    id: 'archer',
    name: 'Archer',
    cost: 3,
    emoji: '🏹',
    color: '#27ae60',
    unitStats: {
      type: 'archer',
      hp: 400,
      maxHp: 400,
      speed: 45,
      damage: 80,
      attackRange: 80,
      attackSpeed: 1.2,
    },
  },
  {
    id: 'giant',
    name: 'Giant',
    cost: 5,
    emoji: '👹',
    color: '#8e44ad',
    unitStats: {
      type: 'giant',
      hp: 3500,
      maxHp: 3500,
      speed: 22,
      damage: 160,
      attackRange: 32,
      attackSpeed: 0.7,
    },
  },
  {
    id: 'goblin',
    name: 'Goblin',
    cost: 2,
    emoji: '👺',
    color: '#2ecc71',
    unitStats: {
      type: 'goblin',
      hp: 250,
      maxHp: 250,
      speed: 60,
      damage: 60,
      attackRange: 25,
      attackSpeed: 1.5,
    },
  },
  {
    id: 'wizard',
    name: 'Wizard',
    cost: 5,
    emoji: '🧙',
    color: '#e67e22',
    unitStats: {
      type: 'wizard',
      hp: 700,
      maxHp: 700,
      speed: 35,
      damage: 200,
      attackRange: 90,
      attackSpeed: 0.9,
    },
  },
  {
    id: 'musketeer',
    name: 'Musketeer',
    cost: 4,
    emoji: '🔫',
    color: '#3498db',
    unitStats: {
      type: 'musketeer',
      hp: 600,
      maxHp: 600,
      speed: 40,
      damage: 150,
      attackRange: 100,
      attackSpeed: 0.85,
    },
  },
  {
    id: 'minion',
    name: 'Minion',
    cost: 3,
    emoji: '😈',
    color: '#9b59b6',
    unitStats: {
      type: 'minion',
      hp: 300,
      maxHp: 300,
      speed: 55,
      damage: 90,
      attackRange: 60,
      attackSpeed: 1.1,
    },
  },
];
