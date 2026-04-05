import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardId } from '../types';

const DECK_STORAGE_KEY = '@ancient_quests/deck_v1';

export async function loadDeck(): Promise<CardId[]> {
  try {
    const raw = await AsyncStorage.getItem(DECK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CardId[];
      // Validate: must be exactly 8 valid card IDs
      if (Array.isArray(parsed) && parsed.length === 8) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Default starter deck
  return ['pharaoh_guard', 'oracle', 'sand_wraith', 'berserker', 'stone_colossus', 'shaman', 'sandstorm', 'obelisk'];
}

export async function saveDeck(deck: CardId[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
  } catch {
    // ignore
  }
}
