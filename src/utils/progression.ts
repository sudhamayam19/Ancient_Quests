import { CardId, RARITY_COLOR } from '../types';
import { CARD_POOL } from '../constants';
import {
  PlayerProfile, RelicType, RelicDef, RELIC_DEFS,
  RelicReward, UPGRADE_COST, makeDefaultProfile, statMultiplier,
} from '../types/progression';

// ── Random helpers ────────────────────────────────────────────────────────────
function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Open a relic and generate rewards ────────────────────────────────────────
export function openRelic(profile: PlayerProfile, relicType: RelicType): {
  reward: RelicReward;
  updatedProfile: PlayerProfile;
} {
  const def = RELIC_DEFS[relicType];

  // How many card rewards
  const cardCount = rng(def.cards[0], def.cards[1]);
  const gold      = rng(def.gold[0],  def.gold[1]);
  const diamonds  = rng(def.diamonds[0], def.diamonds[1]);

  // Pick random cards from the full pool, weighted by rarity
  const cardPool = CARD_POOL.filter(c => c.category === 'unit' || c.category === 'building');
  const weights  = { common: 60, rare: 28, epic: 10, legendary: 2 };
  const weighted: CardId[] = [];
  for (const c of cardPool) {
    const w = weights[c.rarity] ?? 10;
    for (let i = 0; i < w; i++) weighted.push(c.id);
  }

  const cardRewards: { cardId: CardId; shards: number }[] = [];
  for (let i = 0; i < cardCount; i++) {
    const cardId = pick(weighted);
    const shards = rng(def.shards[0], def.shards[1]);
    cardRewards.push({ cardId, shards });
  }

  // Apply rewards to profile
  const collection = profile.collection.map(entry => {
    const reward = cardRewards.find(r => r.cardId === entry.cardId);
    if (!reward) return entry;
    return {
      ...entry,
      unlocked: true,
      shards: entry.shards + reward.shards,
    };
  });

  const updatedProfile: PlayerProfile = {
    ...profile,
    gold:         profile.gold + gold,
    diamonds:     profile.diamonds + diamonds,
    pendingRelic: null,
    collection,
  };

  return { reward: { relicType, cardRewards, gold, diamonds }, updatedProfile };
}

// ── Upgrade a card ────────────────────────────────────────────────────────────
export function canUpgrade(profile: PlayerProfile, cardId: CardId): boolean {
  const entry = profile.collection.find(e => e.cardId === cardId);
  if (!entry || !entry.unlocked || entry.level >= 5) return false;
  const cost = UPGRADE_COST[entry.level + 1];
  return entry.shards >= cost.shards && profile.gold >= cost.gold;
}

export function upgradeCard(profile: PlayerProfile, cardId: CardId): PlayerProfile {
  if (!canUpgrade(profile, cardId)) return profile;
  const entry = profile.collection.find(e => e.cardId === cardId)!;
  const cost  = UPGRADE_COST[entry.level + 1];
  return {
    ...profile,
    gold: profile.gold - cost.gold,
    collection: profile.collection.map(e =>
      e.cardId === cardId
        ? { ...e, level: e.level + 1, shards: e.shards - cost.shards }
        : e
    ),
  };
}

// ── Post-battle rewards ───────────────────────────────────────────────────────
export function applyBattleResult(
  profile: PlayerProfile,
  won: boolean,
  crowns: number,
  destroyedEnemyKing: boolean
): PlayerProfile {
  const goldEarned = won
    ? 150 + crowns * 50
    : 50;

  const trophyDelta = won ? 30 : -15;
  const relicType: RelicType = (() => {
    if (!won) return Math.random() < 0.5 ? 'canopic_jar' : null as any;
    if (destroyedEnemyKing) return 'pharaohs_crown';
    if (crowns >= 3) return 'golden_ankh';
    if (crowns >= 1) return 'scarab_amulet';
    return 'canopic_jar';
  })();

  return {
    ...profile,
    gold:         profile.gold + goldEarned,
    wins:         won ? profile.wins + 1 : profile.wins,
    losses:       won ? profile.losses : profile.losses + 1,
    trophies:     Math.max(0, profile.trophies + trophyDelta),
    pendingRelic: relicType ?? null,
  };
}

// ── Get stat-scaled unit stats ────────────────────────────────────────────────
export function getCardLevel(profile: PlayerProfile, cardId: CardId): number {
  return profile.collection.find(e => e.cardId === cardId)?.level ?? 1;
}

export { statMultiplier, UPGRADE_COST };
