import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Modal,
} from 'react-native';
import { CARD_POOL } from '../constants';
import { getUnitSprite, getBuildingSprite } from '../constants/sprites';
import { PlayerProfile } from '../types/progression';
import { canUpgrade, upgradeCard } from '../utils/progression';
import { RARITY_COLOR, RARITY_LABEL } from '../types';

interface Props {
  profile: PlayerProfile;
  onProfileChange: (p: PlayerProfile) => void;
}

function getCardSprite(id: string) {
  const card = CARD_POOL.find(c => c.id === id);
  if (!card) return null;
  if (card.category === 'unit') return getUnitSprite(id);
  if (card.category === 'building') return getBuildingSprite(id);
  return null;
}

function Stars({ level }: { level: number }) {
  return (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={[styles.star, i <= level && styles.starFilled]}>★</Text>
      ))}
    </View>
  );
}

export default function CollectionScreen({ profile, onProfileChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedEntry = selected ? profile.collection.find(e => e.cardId === selected) : null;
  const selectedCard  = selected ? CARD_POOL.find(c => c.id === selected) : null;
  const canUp = selected ? canUpgrade(profile, selected as any) : false;

  function handleUpgrade() {
    if (!selected) return;
    const updated = upgradeCard(profile, selected as any);
    onProfileChange(updated);
  }

  // Group: unlocked first, then locked
  const unlocked = profile.collection.filter(e => e.unlocked);
  const locked   = profile.collection.filter(e => !e.unlocked);
  const ordered  = [...unlocked, ...locked];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {ordered.map(entry => {
          const card   = CARD_POOL.find(c => c.id === entry.cardId);
          const sprite = getCardSprite(entry.cardId);
          const rColor = card ? RARITY_COLOR[card.rarity] : '#888';
          const isSelected = selected === entry.cardId;

          return (
            <TouchableOpacity
              key={entry.cardId}
              style={[
                styles.card,
                { borderColor: entry.unlocked ? rColor : '#333' },
                isSelected && styles.cardSelected,
                !entry.unlocked && styles.cardLocked,
              ]}
              onPress={() => setSelected(prev => prev === entry.cardId ? null : entry.cardId)}
              activeOpacity={0.8}
            >
              {/* Sprite / emoji */}
              <View style={styles.cardArt}>
                {sprite ? (
                  <Image
                    source={sprite}
                    style={[styles.cardSprite, !entry.unlocked && styles.lockedImg]}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={[styles.cardEmoji, !entry.unlocked && styles.lockedImg]}>
                    {card?.emoji ?? '?'}
                  </Text>
                )}
                {!entry.unlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </View>

              {/* Card name */}
              <Text style={[styles.cardName, !entry.unlocked && styles.lockedText]} numberOfLines={1}>
                {card?.name ?? entry.cardId}
              </Text>

              {/* Stars */}
              {entry.unlocked && <Stars level={entry.level} />}

              {/* Shards */}
              {entry.unlocked && (
                <View style={styles.shardsRow}>
                  <Text style={styles.shardsIcon}>💎</Text>
                  <Text style={styles.shardsText}>{entry.shards}</Text>
                </View>
              )}

              {/* Upgrade badge */}
              {entry.unlocked && canUpgrade(profile, entry.cardId as any) && (
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>↑</Text>
                </View>
              )}

              {/* Rarity dot */}
              <View style={[styles.rarityDot, { backgroundColor: rColor }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail panel */}
      {selectedEntry && selectedCard && (
        <View style={styles.detailPanel}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailName}>{selectedCard.name}</Text>
            <Text style={[styles.detailRarity, { color: RARITY_COLOR[selectedCard.rarity] }]}>
              {RARITY_LABEL[selectedCard.rarity]}
            </Text>
            <Stars level={selectedEntry.level} />
          </View>

          <View style={styles.detailCenter}>
            {selectedEntry.unlocked ? (
              <>
                <Text style={styles.detailStat}>
                  <Text style={styles.detailStatLabel}>Shards </Text>
                  {selectedEntry.shards}
                </Text>
                {selectedEntry.level < 5 && (
                  <Text style={styles.detailStat}>
                    <Text style={styles.detailStatLabel}>Next lvl </Text>
                    {10 * [0,1,2.5,6,15][selectedEntry.level]}💎 +{[0,200,500,1000,2000][selectedEntry.level]}🪙
                  </Text>
                )}
                {selectedEntry.level >= 5 && (
                  <Text style={styles.maxText}>MAX LEVEL</Text>
                )}
              </>
            ) : (
              <Text style={styles.lockedHint}>Open relics to unlock</Text>
            )}
          </View>

          <View style={styles.detailRight}>
            {selectedEntry.unlocked && selectedEntry.level < 5 && (
              <TouchableOpacity
                style={[styles.upgradeBtn, !canUp && styles.upgradeBtnDisabled]}
                onPress={handleUpgrade}
                disabled={!canUp}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradeBtnText}>UPGRADE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, paddingTop: 14, paddingBottom: 120,
    gap: 8, justifyContent: 'flex-start',
  },

  card: {
    width: 80, borderRadius: 12,
    backgroundColor: '#111428',
    borderWidth: 1.5, alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 4,
    position: 'relative',
  },
  cardSelected: { backgroundColor: '#1a1a3e', transform: [{ scale: 1.05 }] },
  cardLocked: { opacity: 0.55 },

  cardArt: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  cardSprite: { width: 56, height: 56 },
  cardEmoji: { fontSize: 36 },
  lockedImg: { opacity: 0.3 },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  lockIcon: { fontSize: 22 },

  cardName: { color: '#ddd', fontSize: 9, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },
  lockedText: { color: '#555' },

  starsRow: { flexDirection: 'row', gap: 1, marginTop: 3 },
  star: { fontSize: 10, color: '#333' },
  starFilled: { color: '#f1c40f' },

  shardsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  shardsIcon: { fontSize: 9 },
  shardsText: { color: '#aaa', fontSize: 9, fontWeight: '700' },

  upgradeBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#2ecc71', width: 14, height: 14,
    borderRadius: 7, alignItems: 'center', justifyContent: 'center',
  },
  upgradeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  rarityDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 6, height: 6, borderRadius: 3,
  },

  // Detail panel
  detailPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0e0e22', borderTopWidth: 1, borderTopColor: '#2a2a4a',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  detailLeft: { gap: 3, flex: 1 },
  detailName: { color: '#fff', fontSize: 14, fontWeight: '900' },
  detailRarity: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  detailCenter: { flex: 2, gap: 3 },
  detailStat: { color: '#aaa', fontSize: 11 },
  detailStatLabel: { color: '#666', fontWeight: '700' },
  maxText: { color: '#f1c40f', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  lockedHint: { color: '#666', fontSize: 11, fontStyle: 'italic' },
  detailRight: { flex: 1, alignItems: 'flex-end' },
  upgradeBtn: {
    backgroundColor: '#2ecc71', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12,
    shadowColor: '#2ecc71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
  },
  upgradeBtnDisabled: { backgroundColor: '#2a2a3a', shadowOpacity: 0 },
  upgradeBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
