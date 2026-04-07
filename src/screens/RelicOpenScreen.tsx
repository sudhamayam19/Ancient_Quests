import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, ScrollView,
} from 'react-native';
import { RelicReward, RELIC_DEFS } from '../types/progression';
import { CARD_POOL } from '../constants';
import { RARITY_COLOR, RARITY_LABEL } from '../types';

interface Props {
  reward: RelicReward;
  onClose: () => void;
}

export default function RelicOpenScreen({ reward, onClose }: Props) {
  const [phase, setPhase] = useState<'shake' | 'reveal'>('shake');

  const def = RELIC_DEFS[reward.relicType];

  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Scale for relic icon
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  // Glow pulse
  const glowAnim = useRef(new Animated.Value(0)).current;
  // Cards fade-in
  const cardsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance scale + glow
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ),
    ]).start();

    // Shake loop until tapped
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.delay(1200),
      ])
    );
    shakeLoop.start();
    return () => shakeLoop.stop();
  }, []);

  function handleOpen() {
    if (phase === 'reveal') return;
    setPhase('reveal');
    // Burst scale then settle
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.6, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(cardsFade, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    });
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0.3, 0.9] });

  return (
    <View style={styles.root}>
      {/* Background glow */}
      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity, backgroundColor: def.color + '22' }]} />

      {phase === 'shake' ? (
        <View style={styles.centerSection}>
          <Text style={styles.tapHint}>TAP TO OPEN</Text>

          <TouchableOpacity onPress={handleOpen} activeOpacity={0.9}>
            <Animated.View style={[
              styles.relicWrap,
              {
                transform: [
                  { translateX: shakeAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}>
              {/* Glow ring */}
              <Animated.View style={[
                styles.glowRing,
                { borderColor: def.color, opacity: glowOpacity },
              ]} />
              {/* Relic */}
              <View style={[styles.relicBox, { borderColor: def.color, shadowColor: def.color }]}>
                <Text style={styles.relicEmoji}>{def.emoji}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={[styles.relicName, { color: def.color }]}>{def.name}</Text>
          <Text style={styles.relicDesc}>Ancient treasures await inside</Text>
        </View>
      ) : (
        <Animated.View style={[styles.revealSection, { opacity: cardsFade }]}>
          <Text style={[styles.relicNameSmall, { color: def.color }]}>
            {def.emoji}  {def.name}  {def.emoji}
          </Text>

          <ScrollView
            style={styles.rewardScroll}
            contentContainerStyle={styles.rewardList}
            showsVerticalScrollIndicator={false}
          >
            {/* Currency row */}
            <View style={styles.currencyRow}>
              <View style={styles.currencyBubble}>
                <Text style={styles.currencyEmoji}>🪙</Text>
                <Text style={styles.currencyVal}>+{reward.gold}</Text>
                <Text style={styles.currencyLabel}>GOLD</Text>
              </View>
              <View style={styles.currencyBubble}>
                <Text style={styles.currencyEmoji}>💎</Text>
                <Text style={styles.currencyVal}>+{reward.diamonds}</Text>
                <Text style={styles.currencyLabel}>DIAMONDS</Text>
              </View>
            </View>

            {/* Card rewards */}
            <Text style={styles.cardsHeader}>CARDS & SHARDS</Text>
            {reward.cardRewards.map((cr, i) => {
              const card = CARD_POOL.find(c => c.id === cr.cardId);
              const rColor = card ? RARITY_COLOR[card.rarity] : '#888';
              return (
                <View key={i} style={[styles.cardRow, { borderColor: rColor + '55' }]}>
                  <View style={[styles.cardIcon, { backgroundColor: rColor + '22', borderColor: rColor }]}>
                    <Text style={styles.cardIconEmoji}>{card?.emoji ?? '?'}</Text>
                  </View>
                  <View style={styles.cardRowCenter}>
                    <Text style={styles.cardRowName}>{card?.name ?? cr.cardId}</Text>
                    <Text style={[styles.cardRowRarity, { color: rColor }]}>
                      {card ? RARITY_LABEL[card.rarity] : ''}
                    </Text>
                  </View>
                  <View style={styles.shardsEarned}>
                    <Text style={styles.shardsEarnedIcon}>💎</Text>
                    <Text style={styles.shardsEarnedVal}>+{cr.shards}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.collectBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.collectText}>COLLECT</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#07071a',
    alignItems: 'center', justifyContent: 'center',
  },
  bgGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },

  centerSection: { alignItems: 'center', gap: 16 },
  tapHint: {
    color: '#555', fontSize: 12, fontWeight: '900', letterSpacing: 3,
    marginBottom: 8,
  },

  relicWrap: { alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 2,
  },
  relicBox: {
    width: 130, height: 130, borderRadius: 30,
    backgroundColor: '#111428', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 12,
  },
  relicEmoji: { fontSize: 70 },

  relicName: { fontSize: 22, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  relicDesc: { color: '#555', fontSize: 12, fontStyle: 'italic' },

  // Reveal phase
  revealSection: { flex: 1, width: '100%', alignItems: 'center', paddingTop: 40 },
  relicNameSmall: { fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },

  rewardScroll: { flex: 1, width: '100%' },
  rewardList: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },

  currencyRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 8 },
  currencyBubble: {
    backgroundColor: '#111428', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    alignItems: 'center', gap: 4, flex: 1,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  currencyEmoji: { fontSize: 28 },
  currencyVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  currencyLabel: { color: '#555', fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  cardsHeader: { color: '#444', fontSize: 11, fontWeight: '900', letterSpacing: 3, marginTop: 4 },

  cardRow: {
    backgroundColor: '#111428', borderRadius: 12,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 12,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  cardIconEmoji: { fontSize: 26 },
  cardRowCenter: { flex: 1 },
  cardRowName: { color: '#ddd', fontSize: 14, fontWeight: '700' },
  cardRowRarity: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  shardsEarned: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shardsEarnedIcon: { fontSize: 14 },
  shardsEarnedVal: { color: '#fff', fontSize: 16, fontWeight: '900' },

  collectBtn: {
    margin: 20, backgroundColor: '#f1c40f',
    paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: 18, width: '80%', alignItems: 'center',
    shadowColor: '#f1c40f', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 8,
  },
  collectText: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
});
