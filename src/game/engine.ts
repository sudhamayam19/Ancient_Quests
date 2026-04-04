import {
  GameState,
  Unit,
  Tower,
  Team,
  Position,
  UnitType,
} from '../types';
import {
  CARD_POOL,
  PLAYER_KING_POS,
  PLAYER_LEFT_TOWER_POS,
  PLAYER_RIGHT_TOWER_POS,
  ENEMY_KING_POS,
  ENEMY_LEFT_TOWER_POS,
  ENEMY_RIGHT_TOWER_POS,
  TOWER_RADIUS,
  UNIT_RADIUS,
  GAME_DURATION,
  ELIXIR_MAX,
  PLAYER_ELIXIR_REGEN,
  ENEMY_ELIXIR_REGEN,
  ARENA_HEIGHT,
  ARENA_WIDTH,
  RIVER_Y,
} from '../constants';

let _unitCounter = 0;
const uid = () => `u_${_unitCounter++}`;

export function buildInitialState(): GameState {
  const towers: Tower[] = [
    // Player towers
    {
      id: 'pk',
      type: 'king',
      team: 'player',
      hp: 4032,
      maxHp: 4032,
      position: PLAYER_KING_POS,
      alive: true,
    },
    {
      id: 'pl',
      type: 'princess',
      team: 'player',
      hp: 3052,
      maxHp: 3052,
      position: PLAYER_LEFT_TOWER_POS,
      alive: true,
    },
    {
      id: 'pr',
      type: 'princess',
      team: 'player',
      hp: 3052,
      maxHp: 3052,
      position: PLAYER_RIGHT_TOWER_POS,
      alive: true,
    },
    // Enemy towers
    {
      id: 'ek',
      type: 'king',
      team: 'enemy',
      hp: 4032,
      maxHp: 4032,
      position: ENEMY_KING_POS,
      alive: true,
    },
    {
      id: 'el',
      type: 'princess',
      team: 'enemy',
      hp: 3052,
      maxHp: 3052,
      position: ENEMY_LEFT_TOWER_POS,
      alive: true,
    },
    {
      id: 'er',
      type: 'princess',
      team: 'enemy',
      hp: 3052,
      maxHp: 3052,
      position: ENEMY_RIGHT_TOWER_POS,
      alive: true,
    },
  ];

  const shuffled = shuffleDeck();
  const playerHand = shuffled.slice(0, 4);
  const nextCard = shuffled[4];

  return {
    phase: 'playing',
    towers,
    units: [],
    playerElixir: 5,
    enemyElixir: 5,
    timeLeft: GAME_DURATION,
    playerHand,
    nextCard,
    winner: null,
  };
}

function shuffleDeck(): UnitType[] {
  const types = CARD_POOL.map((c) => c.id);
  const deck: UnitType[] = [];
  while (deck.length < 10) {
    deck.push(...types);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dist(a: Position, b: Position) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function findTarget(
  unit: Unit,
  units: Unit[],
  towers: Tower[]
): { id: string; pos: Position } | null {
  const enemyTeam: Team = unit.team === 'player' ? 'enemy' : 'player';

  // Prioritize units in range first
  const enemyUnits = units.filter((u) => u.team === enemyTeam && u.alive);
  let closest: { id: string; pos: Position; d: number } | null = null;

  for (const eu of enemyUnits) {
    const d = dist(unit.position, eu.position);
    if (!closest || d < closest.d) {
      closest = { id: eu.id, pos: eu.position, d };
    }
  }

  // Also consider towers
  const enemyTowers = towers.filter((t) => t.team === enemyTeam && t.alive);
  for (const et of enemyTowers) {
    const d = dist(unit.position, et.position);
    if (!closest || d < closest.d) {
      closest = { id: et.id, pos: et.position, d };
    }
  }

  return closest ? { id: closest.id, pos: closest.pos } : null;
}

function moveTowards(pos: Position, target: Position, speed: number, dt: number): Position {
  const d = dist(pos, target);
  if (d < 1) return pos;
  const ratio = Math.min((speed * dt) / d, 1);
  return {
    x: pos.x + (target.x - pos.x) * ratio,
    y: pos.y + (target.y - pos.y) * ratio,
  };
}

function clampToArena(pos: Position): Position {
  return {
    x: Math.max(UNIT_RADIUS, Math.min(ARENA_WIDTH - UNIT_RADIUS, pos.x)),
    y: Math.max(UNIT_RADIUS, Math.min(ARENA_HEIGHT - UNIT_RADIUS, pos.y)),
  };
}

export function stepGame(state: GameState, dt: number, now: number): GameState {
  if (state.phase !== 'playing') return state;

  // --- Elixir regen ---
  const playerElixir = Math.min(
    ELIXIR_MAX,
    state.playerElixir + PLAYER_ELIXIR_REGEN * dt
  );
  const enemyElixir = Math.min(
    ELIXIR_MAX,
    state.enemyElixir + ENEMY_ELIXIR_REGEN * dt
  );

  // --- Timer ---
  const timeLeft = Math.max(0, state.timeLeft - dt);

  // --- Deep copy towers & units ---
  let towers: Tower[] = state.towers.map((t) => ({ ...t }));
  let units: Unit[] = state.units.map((u) => ({ ...u }));

  // --- Unit AI & combat ---
  for (const unit of units) {
    if (!unit.alive) continue;

    const target = findTarget(unit, units, towers);
    if (!target) continue;

    const d = dist(unit.position, target.pos);

    if (d > unit.attackRange + TOWER_RADIUS) {
      // Move towards target
      unit.position = clampToArena(
        moveTowards(unit.position, target.pos, unit.speed, dt)
      );
      unit.targetId = target.id;
    } else {
      // Attack
      unit.targetId = target.id;
      const attackInterval = 1 / unit.attackSpeed;
      if (now - unit.lastAttackTime >= attackInterval * 1000) {
        unit.lastAttackTime = now;
        // Apply damage
        const towerIdx = towers.findIndex((t) => t.id === target.id);
        if (towerIdx !== -1) {
          towers[towerIdx].hp -= unit.damage;
          if (towers[towerIdx].hp <= 0) {
            towers[towerIdx].hp = 0;
            towers[towerIdx].alive = false;
          }
        }
        const unitIdx = units.findIndex((u) => u.id === target.id);
        if (unitIdx !== -1) {
          units[unitIdx].hp -= unit.damage;
          if (units[unitIdx].hp <= 0) {
            units[unitIdx].hp = 0;
            units[unitIdx].alive = false;
          }
        }
      }
    }
  }

  // Tower defense — towers shoot nearby enemies
  for (const tower of towers) {
    if (!tower.alive) continue;
    const enemyTeam: Team = tower.team === 'player' ? 'enemy' : 'player';
    const range = tower.type === 'king' ? 120 : 100;
    const dmg = tower.type === 'king' ? 80 : 60;

    // Find closest enemy unit in range
    let closest: { idx: number; d: number } | null = null;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (!u.alive || u.team !== enemyTeam) continue;
      const d = dist(tower.position, u.position);
      if (d <= range && (!closest || d < closest.d)) {
        closest = { idx: i, d };
      }
    }
    if (closest) {
      // Tower attacks every 1.5s — use tower id as key with time tracking
      // Simple approach: damage per frame proportional
      units[closest.idx].hp -= dmg * dt * 0.8;
      if (units[closest.idx].hp <= 0) {
        units[closest.idx].hp = 0;
        units[closest.idx].alive = false;
      }
    }
  }

  // Remove dead units
  units = units.filter((u) => u.alive);

  // --- Check win condition ---
  const playerKingAlive = towers.find((t) => t.id === 'pk')?.alive;
  const enemyKingAlive = towers.find((t) => t.id === 'ek')?.alive;

  let winner: GameState['winner'] = null;
  let phase: GameState['phase'] = 'playing';

  if (!playerKingAlive && !enemyKingAlive) {
    winner = 'draw';
    phase = 'gameover';
  } else if (!playerKingAlive) {
    winner = 'enemy';
    phase = 'gameover';
  } else if (!enemyKingAlive) {
    winner = 'player';
    phase = 'gameover';
  } else if (timeLeft <= 0) {
    // Count crowns
    const playerCrowns = towers.filter(
      (t) => t.team === 'enemy' && !t.alive
    ).length;
    const enemyCrowns = towers.filter(
      (t) => t.team === 'player' && !t.alive
    ).length;
    if (playerCrowns > enemyCrowns) winner = 'player';
    else if (enemyCrowns > playerCrowns) winner = 'enemy';
    else winner = 'draw';
    phase = 'gameover';
  }

  return {
    ...state,
    towers,
    units,
    playerElixir,
    enemyElixir,
    timeLeft,
    phase,
    winner,
  };
}

export function deployUnit(
  state: GameState,
  cardType: UnitType,
  position: Position,
  team: Team,
  newNextCard?: UnitType
): GameState {
  const cardDef = CARD_POOL.find((c) => c.id === cardType);
  if (!cardDef) return state;

  const { type: _t, ...restStats } = cardDef.unitStats;
  const unit: Unit = {
    id: uid(),
    type: cardType,
    team,
    ...restStats,
    position,
    lastAttackTime: 0,
    targetId: null,
    alive: true,
  };

  let playerHand = [...state.playerHand];
  let nextCard = state.nextCard;

  if (team === 'player') {
    const idx = playerHand.indexOf(cardType);
    if (idx !== -1) {
      playerHand[idx] = nextCard;
      nextCard = newNextCard ?? getRandomCard();
    }
  }

  return {
    ...state,
    units: [...state.units, unit],
    playerHand,
    nextCard,
    playerElixir: team === 'player' ? state.playerElixir - cardDef.cost : state.playerElixir,
    enemyElixir: team === 'enemy' ? state.enemyElixir - cardDef.cost : state.enemyElixir,
  };
}

export function getRandomCard(): UnitType {
  const types = CARD_POOL.map((c) => c.id);
  return types[Math.floor(Math.random() * types.length)];
}

// Simple enemy AI: deploys cards periodically
export function enemyAI(
  state: GameState,
  lastEnemyPlay: number,
  now: number
): { state: GameState; lastEnemyPlay: number } {
  const thinkInterval = 4000 + Math.random() * 3000; // 4-7 seconds
  if (now - lastEnemyPlay < thinkInterval) return { state, lastEnemyPlay };

  // Pick a random affordable card
  const affordable = CARD_POOL.filter((c) => c.cost <= state.enemyElixir);
  if (affordable.length === 0) return { state, lastEnemyPlay };

  const card = affordable[Math.floor(Math.random() * affordable.length)];

  // Deploy on a random lane
  const lanes = [ARENA_WIDTH * 0.28, ARENA_WIDTH * 0.72];
  const x = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() * 30 - 15);
  const y = ARENA_HEIGHT * 0.32 + (Math.random() * 40 - 20);

  const newState = deployUnit(state, card.id, { x, y }, 'enemy');
  return { state: newState, lastEnemyPlay: now };
}
