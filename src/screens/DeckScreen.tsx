import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { CardDef, CardId } from '../types';
import { CARD_POOL } from '../constants';
import { StatPill } from '../components/shared/CardComponents';
import { getUnitSprite, getBuildingSprite } from '../constants/sprites';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
}

type Tab = 'deck' | 'collection';

const UNIT_POOL  = CARD_POOL.filter((c) => c.category === 'unit');
const SPELL_POOL = CARD_POOL.filter((c) => c.category === 'spell');
const BUILD_POOL = CARD_POOL.filter((c) => c.category === 'building');

function getCardSprite(card: CardDef) {
  if (card.category === 'unit') return getUnitSprite(card.id);
  if (card.category === 'building') return getBuildingSprite(card.id);
  return null;
}

function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const isUnit  = card.category === 'unit';
  const isSpell = card.category === 'spell';
  const isBuild = card.category === 'building';
  const superDef = isUnit ? (card as any).super : null;
  const sprite = getCardSprite(card);

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
        <View style={[styles.modalCard, { borderColor: card.color }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: card.color + '22' }]}>
            <View style={styles.modalHeroWrap}>
              {sprite ? (
                <Image source={sprite} style={styles.modalSprite} resizeMode="contain" />
              ) : (
                <View style={[styles.modalEmoji, { backgroundColor: card.color + '33', borderColor: card.color }]}>
                  <Text style={styles.modalEmojiText}>{card.emoji}</Text>
                </View>
              )}
            </View>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalName}>{card.name}</Text>
              <View style={[styles.modalCostBadge, { backgroundColor: '#000a', borderColor: card.color }]}>
                <Text style={styles.modalCostText}>⚡ {card.cost}</Text>
              </View>
            </View>
            <Text style={[styles.modalCategory, { color: card.color }]}>{card.category.toUpperCase()}</Text>
          </View>

          <ScrollView style={styles.modalStats} contentContainerStyle={{ gap: 16 }}>
            {superDef && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⭐ SUPER ABILITY</Text>
                <View style={styles.superBox}>
                  <Text style={styles.superTypeLabel}>{superLabel[superDef.type] ?? superDef.type}</Text>
                  <View style={styles.superMeta}>
                    <StatPill label="Charge" value={`${superDef.chargeTime}s`} color="#f1c40f" />
                    {superDef.radius   && <StatPill label="Radius"   value={`${superDef.radius}px`} color="#3498db" />}
                    {superDef.potency  && <StatPill label="Potency"  value={superDef.potency}        color="#e74c3c" />}
                    {superDef.duration && <StatPill label="Duration" value={`${superDef.duration}s`} color="#9b59b6" />}
                  </View>
                  <Text style={styles.superDesc}>
                    {superDef.type === 'heal_ally'       && 'Fully heals the most wounded ally unit in range.'}
                    {superDef.type === 'shield'          && 'Grants a shield absorbing damage.'}
                    {superDef.type === 'rage'            && `Boosts all nearby ally damage by ${superDef.potency}% for ${superDef.duration}s.`}
                    {superDef.type === 'chain_lightning' && 'Damages target then chains to 2 nearest enemies.'}
                    {superDef.type === 'summon_minion'   && 'Spawns a weak clone of self nearby.'}
                    {superDef.type === 'piercing_arrow'  && (superDef.description ?? 'Fires a piercing arrow that devastates all enemies in its path.')}
                  </Text>
                </View>
              </View>
            )}

            {isUnit && (card as any).unitStats && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>⚔️ COMBAT STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="HP"     value={(card as any).unitStats.maxHp}                  color="#2ecc71" />
                  <StatPill label="Damage" value={(card as any).unitStats.damage}                 color="#e74c3c" />
                  <StatPill label="Speed"  value={(card as any).unitStats.speed}                  color="#3498db" />
                </View>
                <View style={styles.statRow}>
                  <StatPill label="Range"  value={(card as any).unitStats.attackRange}            color="#9b59b6" />
                  <StatPill label="ATK/s"  value={(card as any).unitStats.attackSpeed.toFixed(2)} color="#e67e22" />
                </View>
              </View>
            )}

            {isSpell && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>✨ SPELL STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="Radius"    value={`${card.radius}px`}   color="#e67e22" />
                  <StatPill label="Total DMG" value={card.totalDamage}     color="#e74c3c" />
                  <StatPill label="Duration"  value={`${card.duration}s`}  color="#3498db" />
                </View>
                {card.slowDuration > 0 && (
                  <StatPill label="Slow" value={`${card.slowDuration}s`} color="#9b59b6" />
                )}
              </View>
            )}

            {isBuild && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>🏗️ BUILDING STATS</Text>
                <View style={styles.statRow}>
                  <StatPill label="HP"    value={card.hp}           color="#2ecc71" />
                  {card.dps > 0         && <StatPill label="DPS"   value={card.dps}           color="#e74c3c" />}
                  {card.attackRange > 0 && <StatPill label="Range" value={card.attackRange}   color="#9b59b6" />}
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

          <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: card.color }]} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕  CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CollectionCard({ card, onPress, inDeck }: { card: CardDef; onPress: () => void; inDeck: boolean }) {
  const sprite = getCardSprite(card);
  return (
    <TouchableOpacity
      style={[styles.collCard, inDeck && styles.collCardInDeck, { borderColor: inDeck ? card.color : '#2a2a4a' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.collCardArt, { backgroundColor: card.color + '22' }]}>
        {sprite ? (
          <Image source={sprite} style={styles.collSprite} resizeMode="contain" />
        ) : (
          <Text style={styles.collEmoji}>{card.emoji}</Text>
        )}
        <View style={[styles.collCost, { backgroundColor: '#000c' }]}>
          <Text style={styles.collCostText}>{card.cost}</Text>
        </View>
      </View>
      <Text style={styles.collName} numberOfLines={2}>{card.name}</Text>
      {inDeck && (
        <View style={[styles.inDeckBadge, { backgroundColor: card.color }]}>
          <Text style={styles.inDeckText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DeckScreen({ deck, onDeckChange }: Props) {
  const [tab, setTab]               = useState<Tab>('deck');
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
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'deck' && styles.tabActive]} onPress={() => setTab('deck')}>
          <Text style={[styles.tabText, tab === 'deck' && styles.tabTextActive]}>MY DECK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'collection' && styles.tabActive]} onPress={() => setTab('collection')}>
          <Text style={[styles.tabText, tab === 'collection' && styles.tabTextActive]}>COLLECTION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'deck' && (
          <ScrollView contentContainerStyle={styles.deckContent}>
            <View style={styles.deckHeaderRow}>
              <Text style={styles.sectionTitle}>Battle Deck</Text>
              <View style={styles.avgBadge}>
                <Text style={styles.avgText}>⚡ {avgCost()} avg cost</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Tap a slot to swap a card</Text>

            <View style={styles.deckGrid}>
              {deck.map((cardId, i) => {
                const card = CARD_POOL.find((c) => c.id === cardId)!;
                const sprite = getCardSprite(card);
                const isActive = pendingSwap === i;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.deckSlot, { borderColor: isActive ? '#3a86ff' : card.color + '88' }, isActive && styles.deckSlotActive]}
                    onPress={() => handleDeckCardPress(i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.deckArt, { backgroundColor: card.color + '22' }]}>
                      {sprite ? (
                        <Image source={sprite} style={styles.deckSprite} resizeMode="contain" />
                      ) : (
                        <Text style={styles.deckEmoji}>{card.emoji}</Text>
                      )}
                    </View>
                    <Text style={styles.deckName} numberOfLines={1}>{card.name.split(' ').pop()}</Text>
                    <View style={[styles.deckCostBadge, { backgroundColor: card.color }]}>
                      <Text style={styles.deckCostText}>{card.cost}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.statsRow}>
              <StatPill label="Avg Cost"  value={avgCost()} color="#3a86ff" />
              <StatPill label="Units"     value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'unit').length}     color="#e67e22" />
              <StatPill label="Spells"    value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'spell').length}    color="#9b59b6" />
              <StatPill label="Buildings" value={deck.filter((id) => CARD_POOL.find((c) => c.id === id)?.category === 'building').length} color="#c0392b" />
            </View>
          </ScrollView>
        )}

        {tab === 'collection' && (
          <ScrollView contentContainerStyle={styles.collContent}>
            {pendingSwap !== null && (
              <View style={styles.swapBanner}>
                <Text style={styles.swapText}>Select card to replace slot #{pendingSwap + 1}</Text>
                <TouchableOpacity onPress={() => setPendingSwap(null)}>
                  <Text style={styles.cancelText}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.catTitle}>⚔️  UNITS</Text>
            <View style={styles.collGrid}>
              {UNIT_POOL.map((card) => (
                <CollectionCard key={card.id} card={card} onPress={() => handleCollectionCardPress(card)} inDeck={deck.includes(card.id)} />
              ))}
            </View>

            <Text style={styles.catTitle}>✨  SPELLS</Text>
            <View style={styles.collGrid}>
              {SPELL_POOL.map((card) => (
                <CollectionCard key={card.id} card={card} onPress={() => handleCollectionCardPress(card)} inDeck={deck.includes(card.id)} />
              ))}
            </View>

            <Text style={styles.catTitle}>🏗️  BUILDINGS</Text>
            <View style={styles.collGrid}>
              {BUILD_POOL.map((card) => (
                <CollectionCard key={card.id} card={card} onPress={() => handleCollectionCardPress(card)} inDeck={deck.includes(card.id)} />
              ))}
            </View>
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
  root: { flex: 1, backgroundColor: '#07071a' },
  tabs: {
    flexDirection: 'row', backgroundColor: '#0e0e22',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 13,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#3a86ff' },
  tabText: { color: '#444', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },

  // Deck tab
  deckContent: { padding: 16, gap: 14 },
  deckHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  avgBadge: {
    backgroundColor: '#3a86ff22', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#3a86ff44',
  },
  avgText: { color: '#3a86ff', fontSize: 11, fontWeight: '800' },
  sectionSub: { color: '#444', fontSize: 12, marginTop: -8 },
  deckGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
  },
  deckSlot: {
    width: 76, alignItems: 'center', gap: 4,
    backgroundColor: '#111428', borderRadius: 12,
    borderWidth: 1.5, padding: 6, overflow: 'hidden',
  },
  deckSlotActive: { backgroundColor: '#0d1f3e' },
  deckArt: {
    width: 64, height: 64, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  deckSprite: { width: 64, height: 64 },
  deckEmoji: { fontSize: 30 },
  deckName: { color: '#ccc', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  deckCostBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  deckCostText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },

  // Collection tab
  collContent: { padding: 12, gap: 4, paddingBottom: 24 },
  swapBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0d1f3e', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#3a86ff55',
  },
  swapText: { color: '#3a86ff', fontSize: 12, fontWeight: '700' },
  cancelText: { color: '#e63946', fontSize: 12, fontWeight: '700' },
  catTitle: { color: '#555', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 16, marginBottom: 8 },
  collGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  collCard: {
    width: 90, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#111428', borderWidth: 1.5,
  },
  collCardInDeck: { backgroundColor: '#0d1e2e' },
  collCardArt: {
    height: 80, alignItems: 'center', justifyContent: 'center',
  },
  collSprite: { width: 78, height: 78 },
  collEmoji: { fontSize: 34 },
  collCost: {
    position: 'absolute', bottom: 3, right: 4,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
  },
  collCostText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  collName: {
    color: '#ccc', fontSize: 10, fontWeight: '700',
    textAlign: 'center', padding: 6, paddingTop: 4,
  },
  inDeckBadge: {
    position: 'absolute', top: 4, left: 4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  inDeckText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalCard: {
    backgroundColor: '#0e0e22', borderRadius: 24,
    borderWidth: 2, width: '100%', maxHeight: '88%', overflow: 'hidden',
  },
  modalHeader: { padding: 20, alignItems: 'center', gap: 8 },
  modalHeroWrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  modalSprite: { width: 100, height: 100 },
  modalEmoji: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  modalEmojiText: { fontSize: 44 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  modalCostBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  modalCostText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  modalCategory: { fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  modalStats: { padding: 20, maxHeight: 300 },
  modalSection: { gap: 10 },
  modalSectionTitle: { color: '#555', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
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
  modalCloseBtn: { padding: 16, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
});
