import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { CardId } from '../types';
import { CARD_POOL } from '../constants';
import DeckScreen from './DeckScreen';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
  onPlay: () => void;
}

type LobbyTab = 'play' | 'deck';

export default function LobbyScreen({ deck, onDeckChange, onPlay }: Props) {
  const [tab, setTab] = useState<LobbyTab>('play');

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>⚔️</Text>
        <Text style={styles.title}>Ancient Quests</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'play' && styles.tabActive]}
          onPress={() => setTab('play')}
        >
          <Text style={[styles.tabText, tab === 'play' && styles.tabTextActive]}>⚔️ Battle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'deck' && styles.tabActive]}
          onPress={() => setTab('deck')}
        >
          <Text style={[styles.tabText, tab === 'deck' && styles.tabTextActive]}>🗂 Deck</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {tab === 'play' && (
          <View style={styles.playTab}>
            <View style={styles.deckPreview}>
              <Text style={styles.previewTitle}>Your Battle Deck ({deck.length} cards)</Text>
              <View style={styles.deckRow}>
                {deck.map((cardId, i) => {
                  const card = CARD_POOL.find((c) => c.id === cardId);
                  return (
                    <View
                      key={i}
                      style={[styles.previewCard, { backgroundColor: (card?.color ?? '#888') + '44', borderColor: card?.color ?? '#888' }]}
                    >
                      <Text style={styles.previewEmoji}>{card?.emoji ?? '?'}</Text>
                      <Text style={styles.previewCost}>{card?.cost ?? '?'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity style={styles.battleBtn} onPress={onPlay}>
              <Text style={styles.battleText}>⚔️ Enter Battle</Text>
            </TouchableOpacity>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Arena Tips</Text>
              <Text style={styles.tip}>• Destroy the enemy King Tower to win</Text>
              <Text style={styles.tip}>• Tap a card below, then tap your side to deploy</Text>
              <Text style={styles.tip}>• Spells can be cast anywhere</Text>
              <Text style={styles.tip}>• Time limit: 3 minutes per match</Text>
            </View>
          </View>
        )}

        {tab === 'deck' && (
          <DeckScreen deck={deck} onDeckChange={onDeckChange} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
  header: {
    alignItems: 'center', paddingVertical: 14, gap: 4,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  logo: { fontSize: 36 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#3a86ff' },
  tabText: { color: '#666', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },

  // Play tab
  playTab: { flex: 1, padding: 20, gap: 20, alignItems: 'center', justifyContent: 'center' },
  deckPreview: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, width: '100%',
    borderWidth: 1, borderColor: '#2a2a4a', gap: 10,
  },
  previewTitle: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  deckRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  previewCard: {
    width: 44, height: 44, borderRadius: 8,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  previewEmoji: { fontSize: 22 },
  previewCost: {
    position: 'absolute', bottom: 2, right: 2,
    color: '#fff', fontSize: 9, fontWeight: '900',
    backgroundColor: '#333', borderRadius: 4, paddingHorizontal: 3,
  },
  battleBtn: {
    backgroundColor: '#3a86ff',
    paddingHorizontal: 48, paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#3a86ff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  battleText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  tipBox: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, width: '100%', gap: 6, borderWidth: 1, borderColor: '#2a2a4a' },
  tipTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  tip: { color: '#888', fontSize: 12, lineHeight: 18 },
});