import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardId } from '../types';
import { PlayerProfile, makeDefaultProfile } from '../types/progression';

const DECK_STORAGE_KEY    = '@ancient_quests/deck_v1';
const PROFILE_STORAGE_KEY = '@ancient_quests/profile_v1';

// ── Player profile ─────────────────────────────────────────────────────────
export async function loadProfile(): Promise<PlayerProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      // Merge in any new cards added since last save
      const defaults = makeDefaultProfile();
      const existingIds = new Set(parsed.collection.map(e => e.cardId));
      const merged = [
        ...parsed.collection,
        ...defaults.collection.filter(e => !existingIds.has(e.cardId)),
      ];
      return { ...parsed, collection: merged };
    }
  } catch {}
  return makeDefaultProfile();
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

// ── Deck ──────────────────────────────────────────────────────────────────
export async function loadDeck(): Promise<CardId[]> {
  try {
    const raw = await AsyncStorage.getItem(DECK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CardId[];
      if (Array.isArray(parsed) && parsed.length === 8) return parsed;
    }
  } catch {}
  return ['pharaoh_guard', 'oracle', 'sand_wraith', 'berserker',
          'stone_colossus', 'shaman', 'sandstorm', 'obelisk'];
}

export async function saveDeck(deck: CardId[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
  } catch {}
}
