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
  LEFT_LANE_X,
  RIGHT_LANE_X,
} from '../constants';

let _unitCounter = 0;
const uid = () => `u_${_unitCounter++}`;

// ─── Initial state ────────────────────────────────────────────────────────────

export function buildInitialState(): GameState {
  const towers: Tower[] = [
    { id: 'pk', type: 'king',     team: 'player', hp: 4032, maxHp: 4032, position: PLAYER_KING_POS,        alive: true },
    { id: 'pl', type: 'princess', team: 'player', hp: 3052, maxHp: 3052, position: PLAYER_LEFT_TOWER_POS,  alive: true },
    { id: 'pr', type: 'princess', team: 'player', hp: 3052, maxHp: 3052, position: PLAYER_RIGHT_TOWER_POS, alive: true },
    { id: 'ek', type: 'king',     team: 'enemy',  hp: 4032, maxHp: 4032, position: ENEMY_KING_POS,         alive: true },
    { id: 'el', type: 'princess', team: 'enemy',  hp: 3052, maxHp: 3052, position: ENEMY_LEFT_TOWER_POS,   alive: true },
    { id: 'er', type: 'princess', team: 'enemy',  hp: 3052, maxHp: 3052, position: ENEMY_RIGHT_TOWER_POS,  alive: true },
  ];

  const shuffled = shuffleDeck();
  return {
    phase: 'playing',
    towers,
    units: [],
    playerElixir: 5,
    enemyElixir: 5,
    timeLeft: GAME_DURATION,
    playerHand: shuffled.slice(0, 4),
    nextCard: shuffled[4],
    winner: null,
  };
}

function shuffleDeck(): UnitType[] {
  const types = CARD_POOL.map((c) => c.id);
  const deck: UnitType[] = [];
  while (deck.length < 12) deck.push(...types);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dist(a: Position, b: Position) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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

/**
 * Stone Colossus ignores enemy units entirely — marches straight to towers.
 * All other units prefer the nearest enemy unit, then fall back to nearest tower.
 */
function findTarget(
  unit: Unit,
  units: Unit[],
  towers: Tower[]
): { id: string; pos: Position } | null {
  const enemyTeam: Team = unit.team === 'player' ? 'enemy' : 'player';
  const enemyTowers = towers.filter((t) => t.team === enemyTeam && t.alive);

  // Stone Colossus: towers only
  if (unit.type === 'stone_colossus') {
    let best: { id: string; pos: Position; d: number } | null = null;
    for (const et of enemyTowers) {
      const d = dist(unit.position, et.position);
      if (!best || d < best.d) best = { id: et.id, pos: et.position, d };
    }
    return best;
  }

  // Normal: closest enemy unit OR tower
  const candidates: { id: string; pos: Position; d: number }[] = [];

  for (const eu of units) {
    if (!eu.alive || eu.team !== enemyTeam) continue;
    candidates.push({ id: eu.id, pos: eu.position, d: dist(unit.position, eu.position) });
  }
  for (const et of enemyTowers) {
    candidates.push({ id: et.id, pos: et.position, d: dist(unit.position, et.position) });
  }

  candidates.sort((a, b) => a.d - b.d);
  return candidates[0] ?? null;
}

// ─── Game step ────────────────────────────────────────────────────────────────

export function stepGame(state: GameState, dt: number, now: number): GameState {
  if (state.phase !== 'playing') return state;

  const playerElixir = Math.min(ELIXIR_MAX, state.playerElixir + PLAYER_ELIXIR_REGEN * dt);
  const enemyElixir  = Math.min(ELIXIR_MAX, state.enemyElixir  + ENEMY_ELIXIR_REGEN  * dt);
  const timeLeft     = Math.max(0, state.timeLeft - dt);

  let towers: Tower[] = state.towers.map((t) => ({ ...t }));
  let units:  Unit[]  = state.units.map((u)  => ({ ...u }));

  // ── Unit movement & combat ──
  for (const unit of units) {
    if (!unit.alive) continue;

    const target = findTarget(unit, units, towers);
    if (!target) continue;

    const d = dist(unit.position, target.pos);

    if (d > unit.attackRange + TOWER_RADIUS) {
      unit.position = clampToArena(moveTowards(unit.position, target.pos, unit.speed, dt));
      unit.targetId = target.id;
    } else {
      unit.targetId = target.id;
      const attackInterval = 1000 / unit.attackSpeed;
      if (now - unit.lastAttackTime >= attackInterval) {
        unit.lastAttackTime = now;

        const tIdx = towers.findIndex((t) => t.id === target.id);
        if (tIdx !== -1) {
          towers[tIdx].hp = Math.max(0, towers[tIdx].hp - unit.damage);
          if (towers[tIdx].hp === 0) towers[tIdx].alive = false;
        }
        const uIdx = units.findIndex((u) => u.id === target.id);
        if (uIdx !== -1) {
          units[uIdx].hp = Math.max(0, units[uIdx].hp - unit.damage);
          if (units[uIdx].hp === 0) units[uIdx].alive = false;
        }
      }
    }
  }

  // ── Tower defense (continuous DPS model) ──
  for (const tower of towers) {
    if (!tower.alive) continue;
    const enemyTeam: Team = tower.team === 'player' ? 'enemy' : 'player';
    const range = tower.type === 'king' ? 130 : 105;
    const dps   = tower.type === 'king' ? 90  : 65;

    let closest: { idx: number; d: number } | null = null;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (!u.alive || u.team !== enemyTeam) continue;
      const d = dist(tower.position, u.position);
      if (d <= range && (!closest || d < closest.d)) closest = { idx: i, d };
    }
    if (closest) {
      units[closest.idx].hp = Math.max(0, units[closest.idx].hp - dps * dt);
      if (units[closest.idx].hp === 0) units[closest.idx].alive = false;
    }
  }

  units = units.filter((u) => u.alive);

  // ── Win condition ──
  const playerKingAlive = towers.find((t) => t.id === 'pk')?.alive;
  const enemyKingAlive  = towers.find((t) => t.id === 'ek')?.alive;

  let winner: GameState['winner'] = null;
  let phase:  GameState['phase']  = 'playing';

  if (!playerKingAlive && !enemyKingAlive) { winner = 'draw';   phase = 'gameover'; }
  else if (!playerKingAlive)               { winner = 'enemy';  phase = 'gameover'; }
  else if (!enemyKingAlive)                { winner = 'player'; phase = 'gameover'; }
  else if (timeLeft <= 0) {
    const playerCrowns = towers.filter((t) => t.team === 'enemy'  && !t.alive).length;
    const enemyCrowns  = towers.filter((t) => t.team === 'player' && !t.alive).length;
    winner = playerCrowns > enemyCrowns ? 'player' : enemyCrowns > playerCrowns ? 'enemy' : 'draw';
    phase  = 'gameover';
  }

  return { ...state, towers, units, playerElixir, enemyElixir, timeLeft, phase, winner };
}

// ─── Deploy helper ────────────────────────────────────────────────────────────

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
  let nextCard   = state.nextCard;

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
    enemyElixir:  team === 'enemy'  ? state.enemyElixir  - cardDef.cost : state.enemyElixir,
  };
}

export function getRandomCard(): UnitType {
  const types = CARD_POOL.map((c) => c.id);
  return types[Math.floor(Math.random() * types.length)];
}

// ─── Enemy AI ─────────────────────────────────────────────────────────────────
//
//  Strategy layers (evaluated each tick, actual play gated by cooldown):
//
//  1. PANIC RESPONSE  — if a player unit is past the river heading toward our
//     towers, immediately deploy the cheapest fast counter on that lane.
//
//  2. LANE PRESSURE   — detect which of our towers has lower HP and defend it
//     with a tanky unit if we have the elixir.
//
//  3. PUSH            — if we have ≥ 7 elixir, deploy a strong offensive unit
//     on the lane where the player's tower is weakest.
//
//  4. FALLBACK        — deploy a random affordable unit every 5-8 s.
//
// ─────────────────────────────────────────────────────────────────────────────

export interface AIState {
  lastPlay: number;
  nextThinkInterval: number;
}

export function makeAIState(): AIState {
  return { lastPlay: 0, nextThinkInterval: randomThinkInterval() };
}

function randomThinkInterval(): number {
  return 4500 + Math.random() * 3000; // 4.5 – 7.5 s
}

function cheapFastCards(elixir: number): UnitType[] {
  // sand_wraith (2), berserker (3), pharaoh_guard (3)
  return (['sand_wraith', 'berserker', 'pharaoh_guard'] as UnitType[])
    .filter((id) => {
      const def = CARD_POOL.find((c) => c.id === id)!;
      return def.cost <= elixir;
    });
}

function tankCards(elixir: number): UnitType[] {
  return (['stone_colossus', 'pharaoh_guard'] as UnitType[])
    .filter((id) => {
      const def = CARD_POOL.find((c) => c.id === id)!;
      return def.cost <= elixir;
    });
}

function strongOffensiveCards(elixir: number): UnitType[] {
  return (['stone_colossus', 'shaman', 'oracle', 'blade_dancer'] as UnitType[])
    .filter((id) => {
      const def = CARD_POOL.find((c) => c.id === id)!;
      return def.cost <= elixir;
    });
}

function laneX(lane: 'left' | 'right'): number {
  return lane === 'left' ? LEFT_LANE_X : RIGHT_LANE_X;
}

function enemyDeployY(): number {
  // Enemy deploys just below river on their side
  return ARENA_HEIGHT * 0.30 + (Math.random() * 36 - 18);
}

export function enemyAI(
  state: GameState,
  ai: AIState,
  now: number
): { state: GameState; ai: AIState } {
  if (now - ai.lastPlay < ai.nextThinkInterval) return { state, ai };

  const elixir = state.enemyElixir;

  // ── 1. Panic response ─────────────────────────────────────────────
  // Player unit crossed the river (y < RIVER_Y means enemy half)
  const playerThreat = state.units.find(
    (u) => u.team === 'player' && u.alive && u.position.y < RIVER_Y
  );
  if (playerThreat) {
    const counters = cheapFastCards(elixir);
    if (counters.length > 0) {
      const card = counters[Math.floor(Math.random() * counters.length)];
      // Deploy on same x-lane as threat
      const x = playerThreat.position.x < ARENA_WIDTH / 2 ? laneX('left') : laneX('right');
      const newState = deployUnit(state, card, { x: x + (Math.random() * 24 - 12), y: enemyDeployY() }, 'enemy');
      return {
        state: newState,
        ai: { lastPlay: now, nextThinkInterval: 2200 + Math.random() * 1200 }, // react faster after panic
      };
    }
  }

  // ── 2. Defend weakened tower ──────────────────────────────────────
  const enemyTowers = state.towers.filter((t) => t.team === 'enemy' && t.alive);
  const weakest = enemyTowers.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  if (weakest && weakest.hp / weakest.maxHp < 0.65) {
    const tanks = tankCards(elixir);
    if (tanks.length > 0) {
      const card = tanks[0]; // prefer stone_colossus
      const x = weakest.position.x < ARENA_WIDTH / 2 ? laneX('left') : laneX('right');
      const newState = deployUnit(state, card, { x: x + (Math.random() * 20 - 10), y: enemyDeployY() }, 'enemy');
      return { state: newState, ai: { lastPlay: now, nextThinkInterval: randomThinkInterval() } };
    }
  }

  // ── 3. Offensive push when elixir high ───────────────────────────
  if (elixir >= 7) {
    const strong = strongOffensiveCards(elixir);
    if (strong.length > 0) {
      const card = strong[Math.floor(Math.random() * strong.length)];
      // Push the lane where player's tower is weaker
      const plTower = state.towers.find((t) => t.id === 'pl');
      const prTower = state.towers.find((t) => t.id === 'pr');
      let pushLane: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
      if (plTower && prTower) {
        const lhp = plTower.alive ? plTower.hp / plTower.maxHp : 0;
        const rhp = prTower.alive ? prTower.hp / prTower.maxHp : 0;
        pushLane = lhp <= rhp ? 'left' : 'right';
      }
      const x = laneX(pushLane) + (Math.random() * 24 - 12);
      const newState = deployUnit(state, card, { x, y: enemyDeployY() }, 'enemy');
      return { state: newState, ai: { lastPlay: now, nextThinkInterval: randomThinkInterval() } };
    }
  }

  // ── 4. Fallback: any affordable card ────────────────────────────
  const affordable = CARD_POOL.filter((c) => c.cost <= elixir && elixir >= 3);
  if (affordable.length === 0) return { state, ai: { ...ai, lastPlay: now } };

  const card = affordable[Math.floor(Math.random() * affordable.length)];
  const lane = Math.random() < 0.5 ? 'left' : 'right';
  const x    = laneX(lane) + (Math.random() * 30 - 15);
  const newState = deployUnit(state, card.id, { x, y: enemyDeployY() }, 'enemy');
  return { state: newState, ai: { lastPlay: now, nextThinkInterval: randomThinkInterval() } };
}
