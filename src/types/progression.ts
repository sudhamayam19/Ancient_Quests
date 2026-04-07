import { CardId, Rarity } from './index';

// ── Card collection entry ─────────────────────────────────────────────────────
export interface CardEntry {
  cardId: CardId;
  unlocked: boolean;
  level: number;   // 1–5
  shards: number;  // accumulated shards for this card
}

// Shards + gold required to reach each level
export const UPGRADE_COST: Record<number, { shards: number; gold: number }> = {
  2: { shards: 10,  gold: 200  },
  3: { shards: 25,  gold: 500  },
  4: { shards: 60,  gold: 1000 },
  5: { shards: 150, gold: 2000 },
};

// Stat multiplier per level (1 = base, 5 = +32%)
export function statMultiplier(level: number): number {
  return 1 + (level - 1) * 0.08;
}

// ── Relics ────────────────────────────────────────────────────────────────────
export type RelicType = 'canopic_jar' | 'scarab_amulet' | 'golden_ankh' | 'pharaohs_crown';

export interface RelicDef {
  type: RelicType;
  name: string;
  emoji: string;
  color: string;
  // Loot ranges
  cards:    [number, number]; // [min, max] cards inside
  shards:   [number, number]; // [min, max] shards per card
  gold:     [number, number];
  diamonds: [number, number];
}

export const RELIC_DEFS: Record<RelicType, RelicDef> = {
  canopic_jar: {
    type: 'canopic_jar', name: 'Canopic Jar', emoji: '🏺', color: '#c9a84c',
    cards:    [1, 2],
    shards:   [8,  20],
    gold:     [80,  180],
    diamonds: [0,   2],
  },
  scarab_amulet: {
    type: 'scarab_amulet', name: 'Scarab Amulet', emoji: '🪲', color: '#3498db',
    cards:    [2, 3],
    shards:   [20, 50],
    gold:     [200, 400],
    diamonds: [2,   6],
  },
  golden_ankh: {
    type: 'golden_ankh', name: 'Golden Ankh', emoji: '☥', color: '#9b59b6',
    cards:    [3, 5],
    shards:   [50, 100],
    gold:     [450, 900],
    diamonds: [8,   18],
  },
  pharaohs_crown: {
    type: 'pharaohs_crown', name: "Pharaoh's Crown", emoji: '👑', color: '#f39c12',
    cards:    [5, 8],
    shards:   [100, 250],
    gold:     [800, 1800],
    diamonds: [25,  50],
  },
};

// Which relic drops based on battle result
export function relicTypeForResult(crowns: number, destroyedKing: boolean): RelicType {
  if (destroyedKing) return 'pharaohs_crown';
  if (crowns >= 3)   return 'golden_ankh';
  if (crowns >= 1)   return 'scarab_amulet';
  return 'canopic_jar';
}

// ── Relic reward (what came out of a specific opened relic) ───────────────────
export interface RelicReward {
  relicType: RelicType;
  cardRewards: { cardId: CardId; shards: number }[];
  gold: number;
  diamonds: number;
}

// ── Player profile ────────────────────────────────────────────────────────────
export interface PlayerProfile {
  gold:      number;
  diamonds:  number;
  wins:      number;
  losses:    number;
  trophies:  number;
  collection: CardEntry[];
  // Pending relic (earned after battle, opened on result screen)
  pendingRelic: RelicType | null;
}

export const DEFAULT_UNLOCKED: CardId[] = [
  'pharaoh_guard', 'sand_wraith', 'berserker',
  'oracle', 'shaman', 'sandstorm', 'obelisk',
];

export function makeDefaultProfile(): PlayerProfile {
  const allCards: CardId[] = [
    'pharaoh_guard','sand_wraith','stone_colossus','oracle',
    'berserker','blade_dancer','shaman','princess_archer',
    'sandstorm','pharaohs_wrath','desert_tempest',
    'obelisk','burial_chamber','inferno_trap',
  ];
  return {
    gold: 500,
    diamonds: 20,
    wins: 0,
    losses: 0,
    trophies: 0,
    pendingRelic: null,
    collection: allCards.map(cardId => ({
      cardId,
      unlocked: DEFAULT_UNLOCKED.includes(cardId),
      level: 1,
      shards: 0,
    })),
  };
}
