import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { CardId } from '../types';
import { CARD_POOL } from '../constants';
import { getUnitSprite, getBuildingSprite } from '../constants/sprites';
import DeckScreen from './DeckScreen';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
  onPlay: () => void;
}

type LobbyTab = 'play' | 'deck';

function getCardSprite(cardId: string) {
  const card = CARD_POOL.find((c) => c.id === cardId);
  if (!card) return null;
  if (card.category === 'unit') return getUnitSprite(cardId);
  if (card.category === 'building') return getBuildingSprite(cardId);
  return null;
}

export default function LobbyScreen({ deck, onDeckChange, onPlay }: Props) {
  const [tab, setTab] = useState<LobbyTab>('play');

  const avgCost = (deck.reduce((s, id) => s + (CARD_POOL.find((c) => c.id === id)?.cost ?? 0), 0) / deck.length).toFixed(1);

  return (
    <SafeAreaView style={styles.root}>
      {/* Glow accents */}
      <View style={styles.glowTop} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ANCIENT <Text style={styles.titleGold}>QUESTS</Text></Text>
        <Text style={styles.subtitle}>BATTLE ARENA</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'play' && styles.tabActive]}
          onPress={() => setTab('play')}
        >
          <Text style={[styles.tabText, tab === 'play' && styles.tabTextActive]}>⚔️  BATTLE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'deck' && styles.tabActive]}
          onPress={() => setTab('deck')}
        >
          <Text style={[styles.tabText, tab === 'deck' && styles.tabTextActive]}>🗂  DECK</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {tab === 'play' && (
          <View style={styles.playTab}>

            {/* Deck preview */}
            <View style={styles.deckBox}>
              <View style={styles.deckBoxHeader}>
                <Text style={styles.deckBoxTitle}>YOUR DECK</Text>
                <View style={styles.avgCostBadge}>
                  <Text style={styles.avgCostText}>⚡ {avgCost} avg</Text>
                </View>
              </View>
              <View style={styles.deckRow}>
                {deck.map((cardId, i) => {
                  const card = CARD_POOL.find((c) => c.id === cardId);
                  const sprite = getCardSprite(cardId);
                  return (
                    <View
                      key={i}
                      style={[styles.previewCard, { borderColor: card?.color ?? '#888' }]}
                    >
                      {sprite ? (
                        <Image source={sprite} style={styles.previewSprite} resizeMode="contain" />
                      ) : (
                        <Text style={styles.previewEmoji}>{card?.emoji ?? '?'}</Text>
                      )}
                      <View style={styles.previewCostBadge}>
                        <Text style={styles.previewCost}>{card?.cost}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Battle button */}
            <TouchableOpacity style={styles.battleBtn} onPress={onPlay} activeOpacity={0.85}>
              <View style={styles.battleBtnInner}>
                <Text style={styles.battleText}>⚔️  ENTER BATTLE</Text>
              </View>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>HOW TO PLAY</Text>
              <Text style={styles.tip}>• Tap a card, then tap your half to deploy</Text>
              <Text style={styles.tip}>• Destroy the enemy King Tower to win</Text>
              <Text style={styles.tip}>• Spells can be cast anywhere on the arena</Text>
              <Text style={styles.tip}>• Match lasts 3 minutes — spend elixir wisely</Text>
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
  root: { flex: 1, backgroundColor: '#07071a' },
  glowTop: {
    position: 'absolute',
    top: -40, alignSelf: 'center',
    width: 300, height: 150, borderRadius: 150,
    backgroundColor: '#3a86ff14',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  title: {
    color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4,
  },
  titleGold: { color: '#f1c40f' },
  subtitle: {
    color: '#3a86ff', fontSize: 11, fontWeight: '700', letterSpacing: 3, marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0e0e22',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#3a86ff' },
  tabText: { color: '#444', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },

  playTab: { flex: 1, padding: 20, gap: 18, alignItems: 'center', justifyContent: 'center' },

  deckBox: {
    backgroundColor: '#111428',
    borderRadius: 18, padding: 16, width: '100%',
    borderWidth: 1, borderColor: '#2a2a4a', gap: 12,
  },
  deckBoxHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  deckBoxTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  avgCostBadge: {
    backgroundColor: '#3a86ff22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#3a86ff55',
  },
  avgCostText: { color: '#3a86ff', fontSize: 12, fontWeight: '800' },
  deckRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  previewCard: {
    width: 54, height: 62, borderRadius: 10,
    borderWidth: 1.5, backgroundColor: '#1a1a2e',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  previewSprite: { width: 54, height: 54 },
  previewEmoji: { fontSize: 26 },
  previewCostBadge: {
    position: 'absolute', bottom: 2, right: 3,
    backgroundColor: '#000a', borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  previewCost: { color: '#fff', fontSize: 10, fontWeight: '900' },

  battleBtn: {
    width: '100%', borderRadius: 18,
    shadowColor: '#3a86ff', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  battleBtnInner: {
    backgroundColor: '#3a86ff', paddingVertical: 18,
    alignItems: 'center', borderRadius: 18,
    borderWidth: 1, borderColor: '#6ab0ff',
  },
  battleText: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 },

  tipBox: {
    backgroundColor: '#111428', borderRadius: 14,
    padding: 16, width: '100%', gap: 6,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  tipTitle: { color: '#555', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  tip: { color: '#777', fontSize: 12, lineHeight: 20 },
});
