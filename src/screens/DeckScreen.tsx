import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { CardDef, CardId } from '../types';
import { CARD_POOL } from '../constants';
import { StatPill } from '../components/shared/CardComponents';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
}

type Tab = 'deck' | 'collection';

const UNIT_POOL  = CARD_POOL.filter((c) => c.category === 'unit');
const SPELL_POOL = CARD_POOL.filter((c) => c.category === 'spell');
const BUILD_POOL = CARD_POOL.filter((c) => c.category === 'building');

const { width: SCREEN_W } = Dimensions.get('window');

function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const isUnit   = card.category === 'unit';
  const isSpell  = card.category === 'spell';
  const isBuild  = card.category === 'building';
  const superDef = isUnit ? (card as any).super : null;

  const superLabel: Record<string, string> = {
    heal_ally:       '💚 Heal Ally',
    shield:          '🛡️ Shield',
    rage:            '😤 Rage',
    chain_lightning: '⚡ Chain Lightning',
    summon_minion:   '👤 Summon Minion',
    piercing_arrow:  '🏹 Piercing Arrow',
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalEmoji, { backgroundColor: card.color + '33', borderColor: card.color }]}>
              <Text style={styles.modalEmojiText}>{card.emoji}</Text>
            </View>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalName}>{card.name}</Text>
              <View style={[styles.modalCostBadge, { backgroundColor: '#333' }]}>
                <Text style={styles.modalCostText}>⚡ {card.cost}</Text>
              </View>
            </View>
            <Text style={styles.modalCategory}>{card.category.toUpperCase()}</Text>
          </View>

          <ScrollView style={styles.modalStats} contentContainerStyle={{ gap: 16 }}>
            {/* Super ability */}
            {superDef && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⭐ SUPER ABILITY</Text>
                <View style={styles.superBox}>
                  <Text style={styles.superTypeLabel}>{superLabel[superDef.type] ?? superDef.type}</Text>
                  <View style={styles.superMeta}>
                    <StatPill label="Charge" value={`${superDef.chargeTime}s`} color="#f1c40f" />
                    {superDef.radius && (
                      <StatPill label="Radius" value={`${superDef.radius}px`} color="#3498db" />
                    )}
                    {superDef.potency && (
                      <StatPill label="Potency" value={superDef.potency} color="#e74c3c" />
                    )}
                    {superDef.duration && (
                      <StatPill label="Duration" value={`${superDef.duration}s`} color="#9b59b6" />
                    )}
                  </View>
                  <Text style={styles.superDesc}>
                    {superDef.type === 'heal_ally'    && 'Fully heals the most wounded ally unit in range.'}
                    {superDef.type === 'shield'       && 'Grants a shield absorbing damage.'}
                    {superDef.type === 'rage'         && `Boosts all nearby ally damage by ${superDef.potency}% for ${superDef.duration}s.`}
                    {superDef.type === 'chain_lightning' && 'Damages target then chains to 2 nearest enemies.'}
                    {superDef.type === 'summon_minion'   && 'Spawns a weak clone of self nearby.'}
                    {superDef.type === 'piercing_arrow'  && (superDef.description ?? 'Fires a piercing arrow that devastates all enemies in its path.')}
                  </Text>
                </View>
              </View>
            )}

            {/* Unit stats */}
            {isUnit && (card as any).unitStats && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⚔️ COMBAT STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="HP" value={(card as any).unitStats.maxHp} color="#2ecc71" />
                  <StatPill label="Damage" value={(card as any).unitStats.damage} color="#e74c3c" />
                  <StatPill label="Speed" value={(card as any).unitStats.speed} color="#3498db" />
                </View>
                <View style={styles.statRow}>
                  <StatPill label="Range" value={(card as any).unitStats.attackRange} color="#9b59b6" />
                  <StatPill label="ATK/s" value={(card as any).unitStats.attackSpeed.toFixed(2)} color="#e67e22" />
                </View>
              </View>
            )}

            {/* Spell stats */}
            {isSpell && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>✨ SPELL STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="Radius" value={`${card.radius}px`} color="#e67e22" />
                  <StatPill label="Total DMG" value={card.totalDamage} color="#e74c3c" />
                  <StatPill label="Duration" value={`${card.duration}s`} color="#3498db" />
                </View>
                {card.slowDuration > 0 && (
                  <StatPill label="Slow" value={`${card.slowDuration}s`} color="#9b59b6" />
                )}
              </View>
            )}

            {/* Building stats */}
            {isBuild && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>🏗️ BUILDING STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="HP" value={card.hp} color="#2ecc71" />
                  {card.dps > 0 && <StatPill label="DPS" value={card.dps} color="#e74c3c" />}
                  {card.attackRange > 0 && <StatPill label="Range" value={card.attackRange} color="#9b59b6" />}
                </View>
                {card.spawnType && (
                  <View style={styles.spawnRow}>
                    <Text style={styles.spawnLabel}>🏭 Spawns:</Text>
                    <Text style={styles.spawnValue}>{card.spawnType.replace('_', ' ')}</Text>
                  </View>
                )}
                {card.decayTime > 0 && (
                  <View style={styles.spawnRow}>
                    <Text style={styles.spawnLabel}>⏱ Decay:</Text>
                    <Text style={[styles.spawnValue, { color: '#f39c12' }]}>{card.decayTime}s</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CardRowSmall({ card, onPress, inDeck }: { card: CardDef; onPress: () => void; inDeck: boolean }) {
  return (
    <TouchableOpacity style={[styles.cardRow, inDeck && styles.cardRowInDeck]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardCircle, { backgroundColor: card.color + 'cc', borderColor: card.color }]}>
        <Text style={styles.cardEmoji}>{card.emoji}</Text>
        <View style={[styles.costBadge, { backgroundColor: '#333' }]}>
          <Text style={styles.costText}>{card.cost}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardCategory}>{card.category.toUpperCase()}</Text>
      </View>
      {inDeck && <Text style={styles.inDeckTag}>IN DECK</Text>}
    </TouchableOpacity>
  );
}

export default function DeckScreen({ deck, onDeckChange }: Props) {
  const [tab, setTab]             = useState<Tab>('deck');
  const [selectedCard, setSelected] = useState<CardDef | null>(null);
  const [pendingSwap, setPendingSwap] = useState<number | null>(null);

  function handleDeckCardPress(i: number) {
    setPendingSwap(i);
    setTab('collection');
  }

  function handleCollectionCardPress(card: CardDef) {
    if (pendingSwap !== null) {
      const newDeck = [...deck];
      newDeck[pendingSwap] = card.id;
      onDeckChange(newDeck);
      setPendingSwap(null);
      setTab('deck');
    } else {
      setSelected(card);
    }
  }

  function avgCost() {
    return (deck.reduce((s, id) => s + (CARD_POOL.find((c) => c.id === id)?.cost ?? 0), 0) / deck.length).toFixed(1);
  }

  return (
    <View style={styles.root}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'deck' && styles.tabActive]} onPress={() => setTab('deck')}>
          <Text style={[styles.tabText, tab === 'deck' && styles.tabTextActive]}>My Deck</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'collection' && styles.tabActive]} onPress={() => setTab('collection')}>
          <Text style={[styles.tabText, tab === 'collection' && styles.tabTextActive]}>Collection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'deck' && (
          <ScrollView contentContainerStyle={styles.deckEditorContent}>
            <Text style={styles.sectionTitle}>Your Battle Deck</Text>
            <Text style={styles.sectionSub}>Tap a card → then pick from collection to swap it out</Text>

            <View style={styles.deckGrid}>
              {deck.map((cardId, i) => {
                const card = CARD_POOL.find((c) => c.id === cardId)!;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.deckSlot, pendingSwap === i && styles.deckSlotActive]}
                    onPress={() => handleDeckCardPress(i)}
                  >
                    <View style={[styles.deckCircle, { backgroundColor: card.color + 'cc', borderColor: card.color }]}>
                      <Text style={styles.deckEmoji}>{card.emoji}</Text>
                      <View style={[styles.deckCost, { backgroundColor: '#333' }]}>
                        <Text style={styles.deckCostText}>{card.cost}</Text>
                      </View>
                    </View>
                    <Text style={styles.deckIdx}>#{i + 1}</Text>
                    {card.name.split(' ').slice(-1)[0] && (
                      <Text style={styles.deckType} numberOfLines={1}>{card.name.split(' ').slice(-1)[0]}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.deckStatsRow}>
              <StatPill label="Avg Cost" value={avgCost()} color="#3a86ff" />
              <StatPill label="Units" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'unit').length} color="#e67e22" />
              <StatPill label="Spells" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'spell').length} color="#9b59b6" />
              <StatPill label="Buildings" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'building').length} color="#c0392b" />
            </View>
          </ScrollView>
        )}

        {tab === 'collection' && (
          <ScrollView contentContainerStyle={styles.collectionContent}>
            {pendingSwap !== null && (
              <View style={styles.swapBanner}>
                <Text style={styles.swapText}>Tap a card to replace deck slot #{pendingSwap + 1}</Text>
                <TouchableOpacity onPress={() => setPendingSwap(null)}>
                  <Text style={styles.cancelText}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.catTitle}>⚔️ UNITS ({UNIT_POOL.length})</Text>
            {UNIT_POOL.map((card) => (
              <CardRowSmall
                key={card.id}
                card={card}
                onPress={() => handleCollectionCardPress(card)}
                inDeck={deck.includes(card.id)}
              />
            ))}

            <Text style={styles.catTitle}>✨ SPELLS ({SPELL_POOL.length})</Text>
            {SPELL_POOL.map((card) => (
              <CardRowSmall
                key={card.id}
                card={card}
                onPress={() => handleCollectionCardPress(card)}
                inDeck={deck.includes(card.id)}
              />
            ))}

            <Text style={styles.catTitle}>🏗️ BUILDINGS ({BUILD_POOL.length})</Text>
            {BUILD_POOL.map((card) => (
              <CardRowSmall
                key={card.id}
                card={card}
                onPress={() => handleCollectionCardPress(card)}
                inDeck={deck.includes(card.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelected(null)} />
      )}
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
  deckEditorContent: { padding: 16, gap: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  sectionSub: { color: '#666', fontSize: 12 },
  deckGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center',
  },
  deckSlot: {
    alignItems: 'center', gap: 3,
    padding: 8, borderRadius: 10,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5, borderColor: '#2a2a4a',
    width: 74,
  },
  deckSlotActive: {
    borderColor: '#3a86ff',
    backgroundColor: '#1a2a4e',
  },
  deckCircle: {
    width: 50, height: 50, borderRadius: 10,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  deckEmoji: { fontSize: 26 },
  deckCost: {
    position: 'absolute', bottom: -3, right: -3,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  deckCostText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  deckIdx: { color: '#555', fontSize: 9, fontWeight: '600' },
  deckType: { color: '#666', fontSize: 8, fontWeight: '600', textAlign: 'center' },
  deckStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },

  // Collection
  collectionContent: { padding: 12, gap: 4 },
  swapBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a2a4e', borderRadius: 10, padding: 12, marginBottom: 10,
  },
  swapText: { color: '#3a86ff', fontSize: 12, fontWeight: '700' },
  cancelText: { color: '#e63946', fontSize: 12, fontWeight: '700' },
  catTitle: { color: '#555', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 10, marginBottom: 4 },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a2e', borderRadius: 10,
    padding: 10, gap: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  cardRowInDeck: {
    borderColor: '#3a86ff',
    backgroundColor: '#1a2a3e',
  },
  cardCircle: {
    width: 44, height: 44, borderRadius: 8,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 22 },
  costBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  costText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardCategory: { color: '#888', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  inDeckTag: { color: '#3a86ff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3a86ff',
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  modalEmoji: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  modalEmojiText: { fontSize: 44 },
  modalTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  modalCostBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  modalCostText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  modalCategory: { color: '#888', fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  modalStats: { padding: 20, maxHeight: 300 },
  modalSection: { gap: 10 },
  modalSectionTitle: { color: '#888', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  superBox: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, gap: 8,
    borderWidth: 1, borderColor: '#f1c40f44',
  },
  superTypeLabel: { color: '#f1c40f', fontSize: 16, fontWeight: '900' },
  superMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  superDesc: { color: '#aaa', fontSize: 13, lineHeight: 18 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spawnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spawnLabel: { color: '#888', fontSize: 12 },
  spawnValue: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  modalCloseBtn: {
    backgroundColor: '#3a86ff', padding: 16,
    alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});