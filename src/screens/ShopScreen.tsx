import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { PlayerProfile, RELIC_DEFS, RelicType } from '../types/progression';
import { openRelic } from '../utils/progression';

interface Props {
  profile: PlayerProfile;
  onProfileChange: (p: PlayerProfile) => void;
  onRelicEarned: (reward: import('../types/progression').RelicReward) => void;
}

const DIAMOND_PACKS = [
  { id: 'd1', diamonds: 80,   bonus: 0,   price: '$0.99',  label: 'Starter',  emoji: '💎', color: '#3498db' },
  { id: 'd2', diamonds: 500,  bonus: 50,  price: '$4.99',  label: 'Popular',  emoji: '💎', color: '#9b59b6', tag: 'BEST VALUE' },
  { id: 'd3', diamonds: 1200, bonus: 200, price: '$9.99',  label: 'Big Pack', emoji: '💎', color: '#f39c12' },
  { id: 'd4', diamonds: 2500, bonus: 600, price: '$19.99', label: 'Mega',     emoji: '💎', color: '#e74c3c', tag: 'MOST POPULAR' },
];

const GOLD_PACKS = [
  { id: 'g1', gold: 1000,  price: 50,   emoji: '🪙', label: 'Gold Sack' },
  { id: 'g2', gold: 5000,  price: 200,  emoji: '🪙', label: 'Gold Chest' },
  { id: 'g3', gold: 15000, price: 500,  emoji: '🪙', label: 'Gold Vault' },
];

const RELIC_PACKS: { id: RelicType; diamonds: number }[] = [
  { id: 'canopic_jar',    diamonds: 10  },
  { id: 'scarab_amulet',  diamonds: 30  },
  { id: 'golden_ankh',    diamonds: 80  },
  { id: 'pharaohs_crown', diamonds: 200 },
];

export default function ShopScreen({ profile, onProfileChange, onRelicEarned }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function buyGoldPack(gold: number, diamondCost: number) {
    if (profile.diamonds < diamondCost) { showToast('Not enough diamonds!'); return; }
    onProfileChange({ ...profile, gold: profile.gold + gold, diamonds: profile.diamonds - diamondCost });
    showToast(`+${gold.toLocaleString()} 🪙 Gold added!`);
  }

  function buyRelic(relicId: RelicType, diamondCost: number) {
    if (profile.diamonds < diamondCost) { showToast('Not enough diamonds!'); return; }
    const paid = { ...profile, diamonds: profile.diamonds - diamondCost };
    const { reward, updatedProfile } = openRelic(paid, relicId);
    onProfileChange(updatedProfile);
    onRelicEarned(reward);
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SHOP</Text>
        <View style={styles.headerBalance}>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceEmoji}>🪙</Text>
            <Text style={styles.balanceVal}>{profile.gold.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceEmoji}>💎</Text>
            <Text style={styles.balanceVal}>{profile.diamonds}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Diamond packs ── */}
        <Text style={styles.sectionTitle}>💎 DIAMONDS</Text>
        <Text style={styles.sectionSub}>Premium currency — unlock relics & gold</Text>
        <View style={styles.diamondGrid}>
          {DIAMOND_PACKS.map(pack => (
            <TouchableOpacity key={pack.id} style={[styles.diamondCard, { borderColor: pack.color }]} activeOpacity={0.85}>
              {pack.tag && (
                <View style={[styles.packTag, { backgroundColor: pack.color }]}>
                  <Text style={styles.packTagText}>{pack.tag}</Text>
                </View>
              )}
              <Text style={styles.diamondPackEmoji}>💎</Text>
              <Text style={[styles.diamondPackCount, { color: pack.color }]}>
                {pack.diamonds.toLocaleString()}
              </Text>
              {pack.bonus > 0 && (
                <Text style={styles.diamondBonus}>+{pack.bonus} bonus</Text>
              )}
              <Text style={styles.diamondLabel}>{pack.label}</Text>
              <View style={[styles.priceBtn, { backgroundColor: pack.color }]}>
                <Text style={styles.priceBtnText}>{pack.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Relic shop ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🏺 RELICS</Text>
        <Text style={styles.sectionSub}>Open instantly — cards, shards & gold inside</Text>
        <View style={styles.relicList}>
          {RELIC_PACKS.map(({ id, diamonds }) => {
            const def = RELIC_DEFS[id];
            const canAfford = profile.diamonds >= diamonds;
            return (
              <View key={id} style={[styles.relicRow, { borderColor: def.color + '66' }]}>
                <View style={[styles.relicIconBox, { backgroundColor: def.color + '18' }]}>
                  <Text style={styles.relicIconEmoji}>{def.emoji}</Text>
                </View>
                <View style={styles.relicInfo}>
                  <Text style={styles.relicName}>{def.name}</Text>
                  <Text style={styles.relicHint}>
                    {def.cards[0]}–{def.cards[1]} cards · {def.shards[0]}–{def.shards[1]} shards
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.relicBuyBtn, !canAfford && styles.relicBuyBtnDim]}
                  onPress={() => buyRelic(id, diamonds)}
                  disabled={!canAfford}
                  activeOpacity={0.85}
                >
                  <Text style={styles.relicBuyEmoji}>💎</Text>
                  <Text style={styles.relicBuyText}>{diamonds}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Gold packs ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🪙 GOLD</Text>
        <Text style={styles.sectionSub}>Spend gold to upgrade your cards</Text>
        <View style={styles.goldList}>
          {GOLD_PACKS.map(pack => {
            const canAfford = profile.diamonds >= pack.price;
            return (
              <TouchableOpacity
                key={pack.id}
                style={[styles.goldRow, !canAfford && styles.goldRowDim]}
                onPress={() => buyGoldPack(pack.gold, pack.price)}
                disabled={!canAfford}
                activeOpacity={0.85}
              >
                <Text style={styles.goldEmoji}>{pack.emoji}</Text>
                <View style={styles.goldInfo}>
                  <Text style={styles.goldLabel}>{pack.label}</Text>
                  <Text style={styles.goldAmt}>+{pack.gold.toLocaleString()} Gold</Text>
                </View>
                <View style={[styles.goldPrice, !canAfford && styles.goldPriceDim]}>
                  <Text style={styles.goldPriceEmoji}>💎</Text>
                  <Text style={styles.goldPriceText}>{pack.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Free daily ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🎁 FREE</Text>
        <TouchableOpacity style={styles.freeBtn} activeOpacity={0.85}>
          <Text style={styles.freeBtnEmoji}>🎁</Text>
          <View style={styles.freeInfo}>
            <Text style={styles.freeBtnTitle}>Daily Gift</Text>
            <Text style={styles.freeBtnSub}>Free gold & shards every 24h</Text>
          </View>
          <View style={styles.freeTag}>
            <Text style={styles.freeTagText}>FREE</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
    backgroundColor: '#0a0a18',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  headerBalance: { flexDirection: 'row', gap: 8 },
  balanceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111428', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  balanceEmoji: { fontSize: 13 },
  balanceVal: { color: '#fff', fontSize: 13, fontWeight: '800' },

  scroll: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  sectionSub: { color: '#555', fontSize: 11, marginBottom: 12 },

  // Diamond grid
  diamondGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  diamondCard: {
    width: '47%', backgroundColor: '#111428', borderRadius: 16,
    borderWidth: 1.5, padding: 14, alignItems: 'center', gap: 4,
    position: 'relative', overflow: 'hidden',
  },
  packTag: {
    position: 'absolute', top: 8, right: -16,
    paddingHorizontal: 20, paddingVertical: 3,
    transform: [{ rotate: '35deg' }],
  },
  packTagText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  diamondPackEmoji: { fontSize: 36, marginTop: 8 },
  diamondPackCount: { fontSize: 28, fontWeight: '900' },
  diamondBonus: { color: '#2ecc71', fontSize: 10, fontWeight: '700' },
  diamondLabel: { color: '#888', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  priceBtn: {
    marginTop: 8, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6,
    alignSelf: 'stretch', alignItems: 'center',
  },
  priceBtnText: { color: '#fff', fontSize: 13, fontWeight: '900' },

  // Relic list
  relicList: { gap: 8 },
  relicRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111428', borderRadius: 14,
    borderWidth: 1, padding: 12,
  },
  relicIconBox: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  relicIconEmoji: { fontSize: 30 },
  relicInfo: { flex: 1 },
  relicName: { color: '#fff', fontSize: 14, fontWeight: '800' },
  relicHint: { color: '#666', fontSize: 11, marginTop: 2 },
  relicBuyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#3a86ff', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  relicBuyBtnDim: { backgroundColor: '#2a2a3a' },
  relicBuyEmoji: { fontSize: 13 },
  relicBuyText: { color: '#fff', fontSize: 14, fontWeight: '900' },

  // Gold packs
  goldList: { gap: 8 },
  goldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111428', borderRadius: 14,
    borderWidth: 1, borderColor: '#c9a84c44', padding: 14,
  },
  goldRowDim: { opacity: 0.5 },
  goldEmoji: { fontSize: 32 },
  goldInfo: { flex: 1 },
  goldLabel: { color: '#fff', fontSize: 14, fontWeight: '800' },
  goldAmt: { color: '#c9a84c', fontSize: 12, fontWeight: '700', marginTop: 2 },
  goldPrice: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#9b59b622', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#9b59b644',
  },
  goldPriceDim: { opacity: 0.5 },
  goldPriceEmoji: { fontSize: 13 },
  goldPriceText: { color: '#fff', fontSize: 14, fontWeight: '900' },

  // Free daily
  freeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111428', borderRadius: 16,
    borderWidth: 1, borderColor: '#2ecc7155', padding: 16,
  },
  freeBtnEmoji: { fontSize: 36 },
  freeInfo: { flex: 1 },
  freeBtnTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  freeBtnSub: { color: '#666', fontSize: 11, marginTop: 2 },
  freeTag: {
    backgroundColor: '#2ecc71', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  freeTagText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  toast: {
    position: 'absolute', bottom: 20, alignSelf: 'center',
    backgroundColor: '#1a1a2e', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: '#3a3a5a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
