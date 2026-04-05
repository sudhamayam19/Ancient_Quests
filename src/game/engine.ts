import {
  GameState,
  Unit,
  Tower,
  Building,
  Spell,
  Team,
  Position,
  CardId,
  UnitType,
  SpellType,
  BuildingType,
  Projectile,
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
  BUILDING_RADIUS,
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

let _counter = 0;
const uid = () => `e_${_counter++}`;

// Decay damage per second — applied to buildings that have a finite decayTime
const DECAY_DPS = 18;

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
    spells: [],
    buildings: [],
    projectiles: [],
    playerElixir: 5,
    enemyElixir: 5,
    timeLeft: GAME_DURATION,
    playerHand: shuffled.slice(0, 4),
    nextCard: shuffled[4],
    winner: null,
  };
}

function shuffleDeck(): CardId[] {
  const ids = CARD_POOL.map((c) => c.id);
  const deck: CardId[] = [];
  while (deck.length < 16) deck.push(...ids);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function dist(a: Position, b: Position) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function moveTowards(pos: Position, target: Position, speed: number, dt: number): Position {
  const d = dist(pos, target);
  if (d < 1) return pos;
  const t = Math.min((speed * dt) / d, 1);
  return { x: pos.x + (target.x - pos.x) * t, y: pos.y + (target.y - pos.y) * t };
}

function clampToArena(pos: Position): Position {
  return {
    x: Math.max(UNIT_RADIUS, Math.min(ARENA_WIDTH  - UNIT_RADIUS, pos.x)),
    y: Math.max(UNIT_RADIUS, Math.min(ARENA_HEIGHT - UNIT_RADIUS, pos.y)),
  };
}

function applyDamage(
  targetId: string,
  damage: number,
  units: Unit[],
  towers: Tower[],
  buildings: Building[]
) {
  const tIdx = towers.findIndex((t) => t.id === targetId);
  if (tIdx !== -1) {
    towers[tIdx].hp = Math.max(0, towers[tIdx].hp - damage);
    if (towers[tIdx].hp === 0) towers[tIdx].alive = false;
    return;
  }
  const uIdx = units.findIndex((u) => u.id === targetId);
  if (uIdx !== -1) {
    units[uIdx].hp = Math.max(0, units[uIdx].hp - damage);
    if (units[uIdx].hp === 0) units[uIdx].alive = false;
    return;
  }
  const bIdx = buildings.findIndex((b) => b.id === targetId);
  if (bIdx !== -1) {
    buildings[bIdx].hp = Math.max(0, buildings[bIdx].hp - damage);
    if (buildings[bIdx].hp === 0) buildings[bIdx].alive = false;
  }
}

// ─── Target finding ───────────────────────────────────────────────────────────

function findUnitTarget(
  unit: Unit,
  units: Unit[],
  towers: Tower[],
  buildings: Building[]
): { id: string; pos: Position } | null {
  const enemyTeam: Team = unit.team === 'player' ? 'enemy' : 'player';

  // Stone Colossus: towers only
  if (unit.type === 'stone_colossus') {
    const candidates = towers
      .filter((t) => t.team === enemyTeam && t.alive)
      .map((t) => ({ id: t.id, pos: t.position, d: dist(unit.position, t.position) }));
    candidates.sort((a, b) => a.d - b.d);
    return candidates[0] ?? null;
  }

  const candidates: { id: string; pos: Position; d: number }[] = [];
  for (const u of units)     if (u.alive && u.team === enemyTeam)     candidates.push({ id: u.id,  pos: u.position,  d: dist(unit.position, u.position) });
  for (const b of buildings) if (b.alive && b.team === enemyTeam)     candidates.push({ id: b.id,  pos: b.position,  d: dist(unit.position, b.position) });
  for (const t of towers)    if (t.alive && t.team === enemyTeam)     candidates.push({ id: t.id,  pos: t.position,  d: dist(unit.position, t.position) });
  candidates.sort((a, b) => a.d - b.d);
  return candidates[0] ?? null;
}

// ─── Game step ────────────────────────────────────────────────────────────────

export function stepGame(state: GameState, dt: number, now: number): GameState {
  if (state.phase !== 'playing') return state;

  const playerElixir = Math.min(ELIXIR_MAX, state.playerElixir + PLAYER_ELIXIR_REGEN * dt);
  const enemyElixir  = Math.min(ELIXIR_MAX, state.enemyElixir  + ENEMY_ELIXIR_REGEN  * dt);
  const timeLeft     = Math.max(0, state.timeLeft - dt);

  let towers:    Tower[]    = state.towers.map((t) => ({ ...t }));
  let units:     Unit[]     = state.units.map((u)  => ({ ...u }));
  let buildings: Building[] = state.buildings.map((b) => ({ ...b }));
  let spells:    Spell[]    = state.spells.map((s)  => ({ ...s }));
  let projectiles: Projectile[] = state.projectiles.map((p) => ({ ...p }));

  // ── Spell AOE ────────────────────────────────────────────────────────────
  const expiredSpells: string[] = [];
  for (const spell of spells) {
    spell.elapsed = Math.min(spell.elapsed + dt, spell.duration);
    const dps = spell.totalDamage / spell.duration;
    const dmgThisTick = dps * dt;

    const enemyTeam: Team = spell.team === 'player' ? 'enemy' : 'player';

    // Damage units in radius
    for (const u of units) {
      if (!u.alive || u.team !== enemyTeam) continue;
      if (dist(spell.position, u.position) <= spell.radius) {
        u.hp = Math.max(0, u.hp - dmgThisTick);
        if (u.hp === 0) u.alive = false;
        // Apply slow
        if (spell.slowDuration > 0) {
          u.slowedUntil = Math.max(u.slowedUntil, now + spell.slowDuration * 1000);
        }
      }
    }

    // Damage towers in radius
    for (const t of towers) {
      if (!t.alive || t.team !== enemyTeam) continue;
      if (dist(spell.position, t.position) <= spell.radius + TOWER_RADIUS) {
        t.hp = Math.max(0, t.hp - dmgThisTick);
        if (t.hp === 0) t.alive = false;
      }
    }

    // Damage buildings in radius
    for (const b of buildings) {
      if (!b.alive || b.team !== enemyTeam) continue;
      if (dist(spell.position, b.position) <= spell.radius + BUILDING_RADIUS) {
        b.hp = Math.max(0, b.hp - dmgThisTick);
        if (b.hp === 0) b.alive = false;
      }
    }

    if (spell.elapsed >= spell.duration) expiredSpells.push(spell.id);
  }
  spells = spells.filter((s) => !expiredSpells.includes(s.id));

  // ── Building attacks & spawning ───────────────────────────────────────────
  const newUnitsFromBuildings: Unit[] = [];
  for (const building of buildings) {
    if (!building.alive) continue;
    const enemyTeam: Team = building.team === 'player' ? 'enemy' : 'player';

    // Attack building: find closest enemy in range
    if (building.dps > 0 && building.attackRange > 0) {
      let closest: { idx: number; d: number } | null = null;
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        if (!u.alive || u.team !== enemyTeam) continue;
        const d = dist(building.position, u.position);
        if (d <= building.attackRange && (!closest || d < closest.d)) closest = { idx: i, d };
      }
      if (closest) {
        units[closest.idx].hp = Math.max(0, units[closest.idx].hp - building.dps * dt);
        if (units[closest.idx].hp === 0) units[closest.idx].alive = false;
      }
    }

    // Spawner building
    if (building.spawnType && building.spawnInterval > 0) {
      if (now - building.lastSpawnTime >= building.spawnInterval * 1000) {
        building.lastSpawnTime = now;
        const cardDef = CARD_POOL.find((c) => c.id === building.spawnType);
        if (cardDef && cardDef.category === 'unit') {
          const { type: _t, ...stats } = cardDef.unitStats;
          newUnitsFromBuildings.push({
            id: uid(),
            type: building.spawnType!,
            team: building.team,
            ...stats,
            position: {
              x: building.position.x + (Math.random() * 20 - 10),
              y: building.position.y + (building.team === 'player' ? -20 : 20),
            },
            lastAttackTime: 0,
            targetId: null,
            alive: true,
            slowedUntil: 0,
          });
        }
      }
    }
  }
  units.push(...newUnitsFromBuildings);

  // Ranged threshold: units with attackRange > this fire projectiles
  const RANGED_THRESHOLD = 45;
  const PROJECTILE_SPEED = 280; // pixels per second

function getUnitColor(type: UnitType): string {
  const colors: Record<UnitType, string> = {
    pharaoh_guard: '#c9a84c',
    sand_wraith:   '#d4a96a',
    stone_colossus:'#7f8c8d',
    oracle:        '#5d6af5',
    berserker:     '#e74c3c',
    blade_dancer:  '#e91e8c',
    shaman:        '#27ae60',
  };
  return colors[type] ?? '#888';
}

// ── Unit movement & combat ────────────────────────────────────────────────
  for (const unit of units) {
    if (!unit.alive) continue;

    const isSlowed = unit.slowedUntil > now;
    const effectiveSpeed = isSlowed ? unit.speed * 0.4 : unit.speed;

    const target = findUnitTarget(unit, units, towers, buildings);
    if (!target) continue;

    const d = dist(unit.position, target.pos);
    const attackReach = unit.attackRange + TOWER_RADIUS;

    if (d > attackReach) {
      unit.position = clampToArena(moveTowards(unit.position, target.pos, effectiveSpeed, dt));
      unit.targetId = target.id;
    } else {
      unit.targetId = target.id;
      const attackInterval = 1000 / unit.attackSpeed;
      if (now - unit.lastAttackTime >= attackInterval) {
        unit.lastAttackTime = now;

        const isRanged = unit.attackRange > RANGED_THRESHOLD;

        if (isRanged) {
          // Fire a projectile that travels to target
          const proj: Projectile = {
            id: uid(),
            team: unit.team,
            from: { ...unit.position },
            to: { ...target.pos },
            progress: 0,
            damage: unit.damage,
            targetId: target.id,
            speed: PROJECTILE_SPEED + unit.speed * 2,
            color: getUnitColor(unit.type),
          };
          projectiles.push(proj);
        } else {
          // Melee: instant damage
          applyDamage(target.id, unit.damage, units, towers, buildings);
        }
      }
    }
  }

  // ── Advance projectiles ───────────────────────────────────────────────────
  const hitProjectiles: Set<string> = new Set();
  for (const proj of projectiles) {
    const totalDist = dist(proj.from, proj.to);
    if (totalDist < 1) { hitProjectiles.add(proj.id); continue; }
    const move = (proj.speed * dt) / totalDist;
    proj.progress = Math.min(1, proj.progress + move);
    if (proj.progress >= 1) {
      hitProjectiles.add(proj.id);
      applyDamage(proj.targetId, proj.damage, units, towers, buildings);
    }
  }
  projectiles = projectiles.filter((p) => !hitProjectiles.has(p.id));

  // ── Tower defense (DPS model) ─────────────────────────────────────────────
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

// Decay damage per second — applied to buildings that have a finite decayTime
const DECAY_DPS = 18;

// ── Building decay ───────────────────────────────────────────────────────
for (const building of buildings) {
  if (!building.alive) continue;
  if (building.decayTime > 0) {
    building.hp = Math.max(0, building.hp - DECAY_DPS * dt);
    if (building.hp === 0) building.alive = false;
  }
}

  units     = units.filter((u) => u.alive);
  buildings = buildings.filter((b) => b.alive);

  // ── Win condition ─────────────────────────────────────────────────────────
  const playerKingAlive = towers.find((t) => t.id === 'pk')?.alive;
  const enemyKingAlive  = towers.find((t) => t.id === 'ek')?.alive;

  let winner: GameState['winner'] = null;
  let phase:  GameState['phase']  = 'playing';

  if (!playerKingAlive && !enemyKingAlive) { winner = 'draw';   phase = 'gameover'; }
  else if (!playerKingAlive)               { winner = 'enemy';  phase = 'gameover'; }
  else if (!enemyKingAlive)                { winner = 'player'; phase = 'gameover'; }
  else if (timeLeft <= 0) {
    const pc = towers.filter((t) => t.team === 'enemy'  && !t.alive).length;
    const ec = towers.filter((t) => t.team === 'player' && !t.alive).length;
    winner = pc > ec ? 'player' : ec > pc ? 'enemy' : 'draw';
    phase  = 'gameover';
  }

  return { ...state, towers, units, spells, buildings, projectiles, playerElixir, enemyElixir, timeLeft, phase, winner };
}

// ─── Deploy router ────────────────────────────────────────────────────────────

export function deployCard(
  state: GameState,
  cardId: CardId,
  position: Position,
  team: Team,
  newNextCard?: CardId
): GameState {
  const cardDef = CARD_POOL.find((c) => c.id === cardId);
  if (!cardDef) return state;

  const cost = cardDef.cost;
  if (team === 'player' && state.playerElixir < cost) return state;
  if (team === 'enemy'  && state.enemyElixir  < cost) return state;

  let next = { ...state };

  if (cardDef.category === 'unit') {
    const { type: _t, ...stats } = cardDef.unitStats;
    const unit: Unit = {
      id: uid(),
      type: cardId as UnitType,
      team,
      ...stats,
      position,
      lastAttackTime: 0,
      targetId: null,
      alive: true,
      slowedUntil: 0,
    };
    next = { ...next, units: [...next.units, unit] };
  }

  if (cardDef.category === 'spell') {
    const spell: Spell = {
      id: uid(),
      type: cardId as SpellType,
      team,
      position,
      radius:      cardDef.radius,
      totalDamage: cardDef.totalDamage,
      duration:    cardDef.duration,
      elapsed:     0,
      slowDuration: cardDef.slowDuration,
    };
    next = { ...next, spells: [...next.spells, spell] };
  }

  if (cardDef.category === 'building') {
    // For timed buildings: HP = decayTime × DPS so the bar depletes as a countdown
    const timedHp  = cardDef.decayTime > 0 ? cardDef.decayTime * DECAY_DPS : cardDef.hp;
    const building: Building = {
      id: uid(),
      type: cardId as BuildingType,
      team,
      hp:         timedHp,
      maxHp:      timedHp,
      position,
      alive:      true,
      attackRange: cardDef.attackRange,
      dps:        cardDef.dps,
      lastAttackTime: 0,
      spawnType:  cardDef.spawnType,
      spawnInterval: cardDef.spawnInterval,
      lastSpawnTime: 0,
      decayTime:  cardDef.decayTime,
      placedAt:   Date.now(),
    };
    next = { ...next, buildings: [...next.buildings, building] };
  }

  // Rotate player hand
  if (team === 'player') {
    const hand = [...next.playerHand];
    const idx  = hand.indexOf(cardId);
    if (idx !== -1) {
      hand[idx] = next.nextCard;
      next = { ...next, playerHand: hand, nextCard: newNextCard ?? getRandomCard() };
    }
  }

  return {
    ...next,
    playerElixir: team === 'player' ? next.playerElixir - cost : next.playerElixir,
    enemyElixir:  team === 'enemy'  ? next.enemyElixir  - cost : next.enemyElixir,
  };
}

export function getRandomCard(): CardId {
  const ids = CARD_POOL.map((c) => c.id);
  return ids[Math.floor(Math.random() * ids.length)];
}

// ─── Enemy AI ─────────────────────────────────────────────────────────────────
//
//  Priority order each think cycle:
//  1. Panic  — player unit in enemy half → fast counter on that lane
//  2. Spell  — cluster of ≥2 player units close together → area spell
//  3. Defend — enemy tower < 65 % HP → deploy Obelisk or tank near it
//  4. Push   — elixir ≥ 7 → strong offensive on player's weakest-tower lane
//  5. Spawn  — Burial Chamber if no spawner building alive
//  6. Fallback — random affordable card

export interface AIState {
  lastPlay: number;
  nextThinkInterval: number;
}

export function makeAIState(): AIState {
  return { lastPlay: 0, nextThinkInterval: randomThink() };
}

function randomThink() { return 4200 + Math.random() * 3200; }

function laneX(lane: 'left' | 'right') {
  return lane === 'left' ? LEFT_LANE_X : RIGHT_LANE_X;
}
function enemyY() {
  return ARENA_HEIGHT * 0.30 + (Math.random() * 36 - 18);
}
function jitter(x: number, r = 16) { return x + (Math.random() * r * 2 - r); }

export function enemyAI(
  state: GameState,
  ai: AIState,
  now: number
): { state: GameState; ai: AIState } {
  if (now - ai.lastPlay < ai.nextThinkInterval) return { state, ai };

  const elixir = state.enemyElixir;
  const canAfford = (id: CardId) => {
    const c = CARD_POOL.find((x) => x.id === id);
    return c ? c.cost <= elixir : false;
  };
  const play = (id: CardId, pos: Position): { state: GameState; ai: AIState } => {
    if (!canAfford(id)) return { state, ai: { ...ai, lastPlay: now } };
    return {
      state: deployCard(state, id, pos, 'enemy'),
      ai: { lastPlay: now, nextThinkInterval: randomThink() },
    };
  };

  // 1. Panic response
  const threat = state.units.find(
    (u) => u.team === 'player' && u.alive && u.position.y < RIVER_Y
  );
  if (threat) {
    const fastCards: CardId[] = ['sand_wraith', 'berserker', 'blade_dancer'];
    const choice = fastCards.find(canAfford);
    if (choice) {
      const lane = threat.position.x < ARENA_WIDTH / 2 ? 'left' : 'right';
      return { ...play(choice, { x: jitter(laneX(lane)), y: enemyY() }), ai: { lastPlay: now, nextThinkInterval: 2000 + Math.random() * 1200 } };
    }
  }

  // 2. Spell on clustered player units
  const playerUnits = state.units.filter((u) => u.team === 'player' && u.alive);
  for (const center of playerUnits) {
    const nearby = playerUnits.filter(
      (u) => u.id !== center.id && dist(center.position, u.position) < 60
    );
    if (nearby.length >= 2) {
      // pick a spell
      const spellPick: CardId[] = ['desert_tempest', 'sandstorm', 'pharaohs_wrath'];
      const choice = spellPick.find(canAfford);
      if (choice) return play(choice, center.position);
    }
  }

  // 3. Defend weakened tower
  const enemyTowers = state.towers.filter((t) => t.team === 'enemy' && t.alive);
  const weak = enemyTowers.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (weak && weak.hp / weak.maxHp < 0.65) {
    const defCards: CardId[] = ['obelisk', 'stone_colossus', 'pharaoh_guard'];
    const choice = defCards.find(canAfford);
    if (choice) {
      const lane = weak.position.x < ARENA_WIDTH / 2 ? 'left' : 'right';
      return play(choice, { x: jitter(laneX(lane)), y: jitter(weak.position.y + 40) });
    }
  }

  // 4. Offensive push
  if (elixir >= 7) {
    const pushCards: CardId[] = ['stone_colossus', 'shaman', 'oracle', 'blade_dancer'];
    const choice = pushCards.find(canAfford);
    if (choice) {
      const plL = state.towers.find((t) => t.id === 'pl');
      const plR = state.towers.find((t) => t.id === 'pr');
      const lhp = plL?.alive ? plL.hp / plL.maxHp : 0;
      const rhp = plR?.alive ? plR.hp / plR.maxHp : 0;
      const lane = lhp <= rhp ? 'left' : 'right';
      return play(choice, { x: jitter(laneX(lane)), y: enemyY() });
    }
  }

  // 5. Place Burial Chamber if none alive
  const hasSpawner = state.buildings.some((b) => b.team === 'enemy' && b.alive && b.spawnType);
  if (!hasSpawner && canAfford('burial_chamber') && elixir >= 5) {
    const lane = Math.random() < 0.5 ? 'left' : 'right';
    return play('burial_chamber', { x: jitter(laneX(lane)), y: enemyY() });
  }

  // 6. Fallback
  const affordable = CARD_POOL.filter((c) => c.cost <= elixir && elixir >= 2);
  if (!affordable.length) return { state, ai: { ...ai, lastPlay: now } };
  const card = affordable[Math.floor(Math.random() * affordable.length)];
  const lane = Math.random() < 0.5 ? 'left' : 'right';

  // Spells: AI drops them near player towers
  if (card.category === 'spell') {
    const target = state.towers.find((t) => t.id === (lane === 'left' ? 'pl' : 'pr'));
    const pos = target ? { x: jitter(target.position.x), y: jitter(target.position.y) } : { x: jitter(laneX(lane)), y: RIVER_Y + 60 };
    return play(card.id, pos);
  }

  return play(card.id, { x: jitter(laneX(lane)), y: enemyY() });
}
