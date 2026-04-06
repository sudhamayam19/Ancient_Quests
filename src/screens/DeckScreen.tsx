import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { CardDef, CardId, RARITY_COLOR, RARITY_LABEL } from '../types';
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

const SUPER_LABEL: Record<string, string> = {
  heal_ally:       '💚 Heal Ally',
  shield:          '🛡️ Shield',
  rage:            '😤 Rage',
  chain_lightning: '⚡ Chain Lightning',
  summon_minion:   '👤 Summon Minion',
  piercing_arrow:  '🏹 Piercing Arrow',
};

function RarityBadge({ rarity }: { rarity: CardDef['rarity'] }) {
  const color = RARITY_COLOR[rarity];
  return (
    <View style={[styles.rarityBadge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.rarityText, { color }]}>{RARITY_LABEL[rarity]}</Text>
    </View>
  );
}

function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const isUnit  = card.category === 'unit';
  const isSpell = card.category === 'spell';
  const isBuild = card.category === 'building';
  const superDef = isUnit ? (card as any).super : null;
  const sprite = getCardSprite(card);
  const rarityColor = RARITY_COLOR[card.rarity];

  return (
    <Modal visible animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { borderColor: rarityColor }]}>

          {/* Rarity strip at top */}
          <View style={[styles.rarityStrip, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityStripText}>{RARITY_LABEL[card.rarity]}</Text>
          </View>

          {/* Hero art */}
          <View style={[styles.modalHero, { backgroundColor: card.color + '18' }]}>
            {sprite ? (
              <Image source={sprite} style={styles.modalSprite} resizeMode="contain" />
            ) : (
              <Text style={styles.modalEmojiText}>{card.emoji}</Text>
            )}
          </View>

          {/* Name + cost + category */}
          <View style={styles.modalTitleSection}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalName}>{card.name}</Text>
              <View style={[styles.modalCostBadge, { backgroundColor: '#1a1a2e', borderColor: rarityColor }]}>
                <Text style={styles.modalCostText}>⚡ {card.cost}</Text>
              </View>
            </View>
            <View style={styles.modalMetaRow}>
              <Text style={[styles.modalCategory, { color: card.color }]}>
                {card.category.toUpperCase()}
              </Text>
              <RarityBadge rarity={card.rarity} />
            </View>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 14, paddingBottom: 8 }}>
            {/* Super ability */}
            {superDef && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>⭐ SUPER ABILITY</Text>
                <View style={[styles.superBox, { borderColor: '#f1c40f44' }]}>
                  <Text style={styles.superTypeLabel}>{SUPER_LABEL[superDef.type] ?? superDef.type}</Text>
                  <View style={styles.pillRow}>
                    <StatPill label="Charge"   value={`${superDef.chargeTime}s`} color="#f1c40f" />
                    {superDef.radius   && <StatPill label="Radius"   value={`${superDef.radius}px`}  color="#3498db" />}
                    {superDef.potency  && superDef.potency < 9999 && <StatPill label="Potency"  value={superDef.potency}         color="#e74c3c" />}
                    {superDef.duration && <StatPill label="Duration" value={`${superDef.duration}s`} color="#9b59b6" />}
                  </View>
                  <Text style={styles.superDesc}>
                    {superDef.type === 'heal_ally'       && 'Fully heals the most wounded ally unit in range.'}
                    {superDef.type === 'shield'          && 'Grants a shield that absorbs incoming damage.'}
                    {superDef.type === 'rage'            && `Boosts all nearby ally damage by ${superDef.potency}% for ${superDef.duration}s.`}
                    {superDef.type === 'chain_lightning' && 'Damages target then chains to 2 nearest enemies.'}
                    {superDef.type === 'summon_minion'   && 'Spawns a weak clone of self nearby.'}
                    {superDef.type === 'piercing_arrow'  && (superDef.description ?? 'Fires a piercing arrow that devastates all enemies in its path.')}
                  </Text>
                </View>
              </View>
            )}

            {/* Unit combat stats */}
            {isUnit && (card as any).unitStats && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>⚔️ COMBAT STATS</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statBlock, { borderColor: '#2ecc7144' }]}>
                    <Text style={[styles.statVal, { color: '#2ecc71' }]}>{(card as any).unitStats.maxHp}</Text>
                    <Text style={styles.statKey}>HP</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#e74c3c44' }]}>
                    <Text style={[styles.statVal, { color: '#e74c3c' }]}>{(card as any).unitStats.damage}</Text>
                    <Text style={styles.statKey}>DMG</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#3498db44' }]}>
                    <Text style={[styles.statVal, { color: '#3498db' }]}>{(card as any).unitStats.speed}</Text>
                    <Text style={styles.statKey}>SPD</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#9b59b644' }]}>
                    <Text style={[styles.statVal, { color: '#9b59b6' }]}>{(card as any).unitStats.attackRange}</Text>
                    <Text style={styles.statKey}>RNG</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#e67e2244' }]}>
                    <Text style={[styles.statVal, { color: '#e67e22' }]}>{(card as any).unitStats.attackSpeed.toFixed(2)}</Text>
                    <Text style={styles.statKey}>ATK/S</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Spell stats */}
            {isSpell && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>✨ SPELL STATS</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statBlock, { borderColor: '#e67e2244' }]}>
                    <Text style={[styles.statVal, { color: '#e67e22' }]}>{card.radius}</Text>
                    <Text style={styles.statKey}>RADIUS</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#e74c3c44' }]}>
                    <Text style={[styles.statVal, { color: '#e74c3c' }]}>{card.totalDamage}</Text>
                    <Text style={styles.statKey}>DAMAGE</Text>
                  </View>
                  <View style={[styles.statBlock, { borderColor: '#3498db44' }]}>
                    <Text style={[styles.statVal, { color: '#3498db' }]}>{card.duration}s</Text>
                    <Text style={styles.statKey}>DURATION</Text>
                  </View>
                  {card.slowDuration > 0 && (
                    <View style={[styles.statBlock, { borderColor: '#9b59b644' }]}>
                      <Text style={[styles.statVal, { color: '#9b59b6' }]}>{card.slowDuration}s</Text>
                      <Text style={styles.statKey}>SLOW</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Building stats */}
            {isBuild && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>🏗️ BUILDING STATS</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statBlock, { borderColor: '#2ecc7144' }]}>
                    <Text style={[styles.statVal, { color: '#2ecc71' }]}>{card.hp}</Text>
                    <Text style={styles.statKey}>HP</Text>
                  </View>
                  {card.dps > 0 && (
                    <View style={[styles.statBlock, { borderColor: '#e74c3c44' }]}>
                      <Text style={[styles.statVal, { color: '#e74c3c' }]}>{card.dps}</Text>
                      <Text style={styles.statKey}>DPS</Text>
                    </View>
                  )}
                  {card.attackRange > 0 && (
                    <View style={[styles.statBlock, { borderColor: '#9b59b644' }]}>
                      <Text style={[styles.statVal, { color: '#9b59b6' }]}>{card.attackRange}</Text>
                      <Text style={styles.statKey}>RANGE</Text>
                    </View>
                  )}
                  {card.decayTime > 0 && (
                    <View style={[styles.statBlock, { borderColor: '#f39c1244' }]}>
                      <Text style={[styles.statVal, { color: '#f39c12' }]}>{card.decayTime}s</Text>
                      <Text style={styles.statKey}>DECAY</Text>
                    </View>
                  )}
                </View>
                {card.spawnType && (
                  <View style={styles.spawnRow}>
                    <Text style={styles.spawnLabel}>🏭 Spawns</Text>
                    <Text style={styles.spawnValue}>{card.spawnType.replace('_', ' ')} every {(card as any).spawnInterval}s</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: rarityColor }]} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕  CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CollectionCard({ card, onPress, inDeck }: { card: CardDef; onPress: () => void; inDeck: boolean }) {
  const sprite = getCardSprite(card);
  const rarityColor = RARITY_COLOR[card.rarity];
  return (
    <TouchableOpacity
      style={[styles.collCard, { borderColor: inDeck ? rarityColor : '#2a2a4a' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Rarity bar at top */}
      <View style={[styles.collRarityBar, { backgroundColor: rarityColor }]} />
      <View style={[styles.collCardArt, { backgroundColor: card.color + '18' }]}>
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
      <Text style={[styles.collRarity, { color: rarityColor }]}>{RARITY_LABEL[card.rarity]}</Text>
      {inDeck && (
        <View style={[styles.inDeckBadge, { backgroundColor: rarityColor }]}>
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
                <Text style={styles.avgText}>⚡ {avgCost()} avg</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Tap a slot to swap a card</Text>

            <View style={styles.deckGrid}>
              {deck.map((cardId, i) => {
                const card = CARD_POOL.find((c) => c.id === cardId)!;
                const sprite = getCardSprite(card);
                const isActive = pendingSwap === i;
                const rarityColor = RARITY_COLOR[card.rarity];
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.deckSlot, { borderColor: isActive ? '#fff' : rarityColor }, isActive && styles.deckSlotActive]}
                    onPress={() => handleDeckCardPress(i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.collRarityBar, { backgroundColor: rarityColor }]} />
                    <View style={[styles.deckArt, { backgroundColor: card.color + '18' }]}>
                      {sprite ? (
                        <Image source={sprite} style={styles.deckSprite} resizeMode="contain" />
                      ) : (
                        <Text style={styles.deckEmoji}>{card.emoji}</Text>
                      )}
                    </View>
                    <Text style={styles.deckName} numberOfLines={1}>{card.name.split(' ').pop()}</Text>
                    <View style={[styles.deckCostBadge, { backgroundColor: rarityColor }]}>
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
  deckGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  deckSlot: {
    width: 76, alignItems: 'center',
    backgroundColor: '#111428', borderRadius: 12,
    borderWidth: 1.5, overflow: 'hidden',
  },
  deckSlotActive: { backgroundColor: '#0d1f3e' },
  deckArt: {
    width: 76, height: 64,
    alignItems: 'center', justifyContent: 'center',
  },
  deckSprite: { width: 64, height: 64 },
  deckEmoji: { fontSize: 30 },
  deckName: { color: '#ccc', fontSize: 9, fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
  deckCostBadge: {
    position: 'absolute', top: 6, right: 5,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  deckCostText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },

  // Collection
  collContent: { padding: 12, gap: 4, paddingBottom: 24 },
  swapBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0d1f3e', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#3a86ff55',
  },
  swapText: { color: '#3a86ff', fontSize: 12, fontWeight: '700' },
  cancelText: { color: '#e63946', fontSize: 12, fontWeight: '700' },
  catTitle: { color: '#555', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 16, marginBottom: 8 },
  collGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  collCard: {
    width: 90, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#111428', borderWidth: 1.5,
  },
  collRarityBar: { height: 3, width: '100%' },
  collCardArt: { height: 80, alignItems: 'center', justifyContent: 'center' },
  collSprite: { width: 78, height: 78 },
  collEmoji: { fontSize: 34 },
  collCost: {
    position: 'absolute', bottom: 3, right: 4,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
  },
  collCostText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  collName: { color: '#ccc', fontSize: 10, fontWeight: '700', textAlign: 'center', paddingHorizontal: 4, paddingTop: 4 },
  collRarity: { fontSize: 8, fontWeight: '900', textAlign: 'center', paddingBottom: 6, letterSpacing: 1 },
  inDeckBadge: {
    position: 'absolute', top: 8, left: 4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  inDeckText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  // Rarity badge
  rarityBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  rarityText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  modalCard: {
    backgroundColor: '#0e0e22', borderRadius: 24,
    borderWidth: 2, width: '100%', maxHeight: '92%', overflow: 'hidden',
  },
  rarityStrip: { height: 4, width: '100%' },
  rarityStripText: { display: 'none' },
  modalHero: {
    height: 160, alignItems: 'center', justifyContent: 'center',
  },
  modalSprite: { width: 150, height: 150 },
  modalEmojiText: { fontSize: 80 },
  modalTitleSection: {
    paddingHorizontal: 20, paddingBottom: 14, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '900', flex: 1 },
  modalCostBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1.5, marginLeft: 8,
  },
  modalCostText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalCategory: { fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  modalBody: { padding: 16, maxHeight: 340 },
  modalSection: { gap: 10 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  superBox: {
    backgroundColor: '#111428', borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1,
  },
  superTypeLabel: { color: '#f1c40f', fontSize: 17, fontWeight: '900' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  superDesc: { color: '#888', fontSize: 13, lineHeight: 19 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  statBlock: {
    flex: 1, minWidth: 60, backgroundColor: '#111428',
    borderRadius: 10, borderWidth: 1, padding: 10,
    alignItems: 'center', gap: 3,
  },
  statVal: { fontSize: 20, fontWeight: '900' },
  statKey: { color: '#555', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  spawnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  spawnLabel: { color: '#888', fontSize: 12 },
  spawnValue: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  modalCloseBtn: { padding: 18, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
});
