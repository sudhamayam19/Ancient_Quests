import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CardDef, CardId } from '../types';
import { CARD_POOL } from '../constants';
import { CardEmoji, CardRow, StatPill } from '../components/shared/CardComponents';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
}

type Tab = 'deck' | 'collection';

const UNIT_POOL   = CARD_POOL.filter((c) => c.category === 'unit');
const SPELL_POOL  = CARD_POOL.filter((c) => c.category === 'spell');
const BUILD_POOL  = CARD_POOL.filter((c) => c.category === 'building');

export default function DeckScreen({ deck, onDeckChange }: Props) {
  const [tab, setTab] = useState<Tab>('deck');
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null);

  // Find which slot to replace when a collection card is tapped
  const [pendingSwap, setPendingSwap] = useState<number | null>(null);

  function handleDeckCardPress(idx: number) {
    // Tap deck card → select it as the swap source
    setPendingSwap(idx);
    setSelectedCard(null);
    setTab('collection');
  }

  function handleCollectionCardPress(card: CardDef) {
    if (pendingSwap !== null) {
      // Replace the deck slot with this card
      const newDeck = [...deck];
      newDeck[pendingSwap] = card.id;
      onDeckChange(newDeck);
      setPendingSwap(null);
      setSelectedCard(null);
      setTab('deck');
    } else {
      setSelectedCard(card.id);
    }
  }

  function renderDeckEditor() {
    return (
      <View style={styles.deckEditor}>
        <Text style={styles.sectionTitle}>Your Battle Deck</Text>
        <Text style={styles.sectionSub}>Tap a card → select from collection to swap</Text>

        <View style={styles.deckGrid}>
          {deck.map((cardId, i) => {
            const card = CARD_POOL.find((c) => c.id === cardId)!;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.deckSlot, pendingSwap === i && styles.deckSlotActive]}
                onPress={() => handleDeckCardPress(i)}
              >
                <View style={[styles.deckCardCircle, { backgroundColor: card.color + 'cc', borderColor: card.color }]}>
                  <Text style={styles.deckEmoji}>{card.emoji}</Text>
                  <View style={[styles.deckCost, { backgroundColor: '#555' }]}>
                    <Text style={styles.deckCostText}>{card.cost}</Text>
                  </View>
                </View>
                <Text style={styles.deckIdx}>#{i + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Deck stats summary */}
        <View style={styles.deckStats}>
          <StatPill label="Avg Cost" value={(deck.reduce((s, id) => {
            const c = CARD_POOL.find((x) => x.id === id);
            return s + (c?.cost ?? 0);
          }, 0) / deck.length).toFixed(1)} color="#3a86ff" />
          <StatPill label="Cards" value={deck.length} color="#27ae60" />
          <StatPill label="Units" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'unit').length} color="#e67e22" />
          <StatPill label="Spells" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'spell').length} color="#9b59b6" />
          <StatPill label="Buildings" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'building').length} color="#c0392b" />
        </View>
      </View>
    );
  }

  function renderCollection() {
    return (
      <ScrollView style={styles.collectionList} contentContainerStyle={{ gap: 8 }}>
        {pendingSwap !== null && (
          <View style={styles.swapBanner}>
            <Text style={styles.swapText}>
              Selecting card for deck slot #{pendingSwap + 1} — tap a card below
            </Text>
            <TouchableOpacity onPress={() => { setPendingSwap(null); setTab('deck'); }}>
              <Text style={styles.cancelText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.catLabel}>UNITS ({UNIT_POOL.length})</Text>
        {UNIT_POOL.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            onPress={() => handleCollectionCardPress(card)}
            selected={selectedCard === card.id}
            inDeck={deck.includes(card.id)}
            rightSlot={deck.includes(card.id) && <Text style={styles.inDeckBadge}>IN DECK</Text>}
          />
        ))}

        <Text style={styles.catLabel}>SPELLS ({SPELL_POOL.length})</Text>
        {SPELL_POOL.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            onPress={() => handleCollectionCardPress(card)}
            selected={selectedCard === card.id}
            inDeck={deck.includes(card.id)}
            rightSlot={deck.includes(card.id) && <Text style={styles.inDeckBadge}>IN DECK</Text>}
          />
        ))}

        <Text style={styles.catLabel}>BUILDINGS ({BUILD_POOL.length})</Text>
        {BUILD_POOL.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            onPress={() => handleCollectionCardPress(card)}
            selected={selectedCard === card.id}
            inDeck={deck.includes(card.id)}
            rightSlot={deck.includes(card.id) && <Text style={styles.inDeckBadge}>IN DECK</Text>}
          />
        ))}
      </ScrollView>
    );
  }

  function renderCardDetail() {
    if (!selectedCard) return null;
    const card = CARD_POOL.find((c) => c.id === selectedCard)!;
    return (
      <View style={styles.cardDetail}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailEmojiWrap, { backgroundColor: card.color + '33', borderColor: card.color }]}>
            <Text style={styles.detailEmoji}>{card.emoji}</Text>
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailName}>{card.name}</Text>
            <Text style={styles.detailCat}>{card.category.toUpperCase()} · Elixir {card.cost}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedCard(null)}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {card.category === 'unit' && card.unitStats && (
          <View style={styles.statRow}>
            <StatPill label="HP" value={card.unitStats.maxHp} color="#2ecc71" />
            <StatPill label="Damage" value={card.unitStats.damage} color="#e74c3c" />
            <StatPill label="Speed" value={card.unitStats.speed} color="#3498db" />
            <StatPill label="Range" value={card.unitStats.attackRange} color="#9b59b6" />
            <StatPill label="ATK/s" value={card.unitStats.attackSpeed.toFixed(1)} color="#e67e22" />
          </View>
        )}

        {card.category === 'spell' && (
          <View style={styles.statRow}>
            <StatPill label="Radius" value={card.radius} color="#e67e22" />
            <StatPill label="Total DMG" value={card.totalDamage} color="#e74c3c" />
            <StatPill label="Duration" value={`${card.duration}s`} color="#3498db" />
            {card.slowDuration > 0 && <StatPill label="Slow" value={`${card.slowDuration}s`} color="#9b59b6" />}
          </View>
        )}

        {card.category === 'building' && (
          <View style={styles.statRow}>
            <StatPill label="HP" value={card.hp} color="#2ecc71" />
            {card.dps > 0 && <StatPill label="DPS" value={card.dps} color="#e74c3c" />}
            {card.attackRange > 0 && <StatPill label="Range" value={card.attackRange} color="#9b59b6" />}
            {card.spawnType && <StatPill label="Spawn" value={card.spawnType.replace('_', ' ')} color="#27ae60" />}
            {card.decayTime > 0 && <StatPill label="Decay" value={`${card.decayTime}s`} color="#f39c12" />}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Tab bar */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'deck' && styles.tabActive]} onPress={() => setTab('deck')}>
          <Text style={[styles.tabText, tab === 'deck' && styles.tabTextActive]}>My Deck</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'collection' && styles.tabActive]} onPress={() => setTab('collection')}>
          <Text style={[styles.tabText, tab === 'collection' && styles.tabTextActive]}>Collection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'deck' ? renderDeckEditor() : renderCollection()}
        {selectedCard && tab === 'collection' && renderCardDetail()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#3a86ff' },
  tabText: { color: '#888', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },

  // Deck editor
  deckEditor: { padding: 16, gap: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  sectionSub: { color: '#666', fontSize: 12 },
  deckGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center',
  },
  deckSlot: {
    alignItems: 'center', gap: 4,
    padding: 8, borderRadius: 10,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5, borderColor: '#2a2a4a',
  },
  deckSlotActive: {
    borderColor: '#3a86ff',
    backgroundColor: '#1a2a4e',
  },
  deckCardCircle: {
    width: 60, height: 60, borderRadius: 10,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  deckEmoji: { fontSize: 30, textAlign: 'center' },
  deckCost: {
    position: 'absolute', bottom: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  deckCostText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  deckIdx: { color: '#555', fontSize: 10, fontWeight: '600' },
  deckStats: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, justifyContent: 'center',
  },

  // Collection
  collectionList: { flex: 1, padding: 12 },
  swapBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a2a4e', borderRadius: 10, padding: 12,
    marginBottom: 8,
  },
  swapText: { color: '#3a86ff', fontSize: 12, fontWeight: '700' },
  cancelText: { color: '#e63946', fontSize: 12, fontWeight: '700' },
  catLabel: { color: '#555', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 8, marginBottom: 4 },
  inDeckBadge: { color: '#3a86ff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // Card detail
  cardDetail: {
    backgroundColor: '#111',
    borderTopWidth: 1, borderTopColor: '#222',
    padding: 16, gap: 12,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailEmojiWrap: {
    width: 60, height: 60, borderRadius: 12,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  detailEmoji: { fontSize: 32 },
  detailInfo: { flex: 1, gap: 4 },
  detailName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  detailCat: { color: '#888', fontSize: 12 },
  closeBtn: { color: '#666', fontSize: 18, fontWeight: '700', padding: 4 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});