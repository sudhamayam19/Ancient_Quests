import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Image, ScrollView,
} from 'react-native';
import { PlayerProfile } from '../types/progression';

const kiaraSprite = require('../../assets/sprites/princess_archer.png');

interface Props {
  profile: PlayerProfile;
  onPlay: () => void;
}

export default function HomeScreen({ profile, onPlay }: Props) {
  const winRate = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header bar ── */}
        <View style={styles.headerBar}>
          <View style={styles.currency}>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyEmoji}>🪙</Text>
              <Text style={styles.currencyVal}>{profile.gold.toLocaleString()}</Text>
            </View>
            <View style={styles.currencyChip}>
              <Text style={styles.currencyEmoji}>💎</Text>
              <Text style={styles.currencyVal}>{profile.diamonds}</Text>
            </View>
          </View>
          <View style={styles.trophyChip}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.trophyVal}>{profile.trophies}</Text>
          </View>
        </View>

        {/* ── Hero section ── */}
        <View style={styles.heroSection}>
          {/* Glow blobs */}
          <View style={styles.glowBlue} />
          <View style={styles.glowGold} />

          {/* Hero art */}
          <View style={styles.heroWrap}>
            <View style={styles.heroRing} />
            <Image source={kiaraSprite} style={styles.heroSprite} resizeMode="contain" />
          </View>

          {/* Title */}
          <Text style={styles.title}>ANCIENT</Text>
          <Text style={styles.titleGold}>QUESTS</Text>
          <Text style={styles.subtitle}>CARD BATTLE ARENA</Text>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{profile.wins}</Text>
            <Text style={styles.statLbl}>WINS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#e63946' }]}>{profile.losses}</Text>
            <Text style={styles.statLbl}>LOSSES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#2ecc71' }]}>{winRate}%</Text>
            <Text style={styles.statLbl}>WIN RATE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#f1c40f' }]}>{profile.trophies}</Text>
            <Text style={styles.statLbl}>TROPHIES</Text>
          </View>
        </View>

        {/* ── League badge ── */}
        <View style={styles.leagueCard}>
          <Text style={styles.leagueEmoji}>{getTierEmoji(profile.trophies)}</Text>
          <View style={styles.leagueInfo}>
            <Text style={styles.leagueName}>{getTierName(profile.trophies)}</Text>
            <Text style={styles.leagueSub}>
              {getNextTierTrophies(profile.trophies) > 0
                ? `${getNextTierTrophies(profile.trophies) - profile.trophies} trophies to next tier`
                : 'Maximum tier reached!'}
            </Text>
            <View style={styles.leagueBar}>
              <View style={[styles.leagueBarFill, { width: `${getTierProgress(profile.trophies)}%` }]} />
            </View>
          </View>
        </View>

        {/* ── Battle button ── */}
        <TouchableOpacity style={styles.battleBtn} onPress={onPlay} activeOpacity={0.85}>
          <View style={styles.battleBtnInner}>
            <Text style={styles.battleIcon}>⚔️</Text>
            <Text style={styles.battleText}>BATTLE</Text>
          </View>
          <View style={styles.battleGlow} />
        </TouchableOpacity>

        {/* ── Quick info ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoEmoji}>⚡</Text>
            <Text style={styles.infoText}>3 min matches</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoEmoji}>🏺</Text>
            <Text style={styles.infoText}>Win relics</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoEmoji}>⬆️</Text>
            <Text style={styles.infoText}>Upgrade cards</Text>
          </View>
        </View>

        <Text style={styles.version}>Ancient Quests v1.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── League helpers ────────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Bronze',   emoji: '🥉', min: 0,    max: 299  },
  { name: 'Silver',   emoji: '🥈', min: 300,  max: 699  },
  { name: 'Gold',     emoji: '🥇', min: 700,  max: 1299 },
  { name: 'Platinum', emoji: '💠', min: 1300, max: 2199 },
  { name: 'Diamond',  emoji: '💎', min: 2200, max: 3499 },
  { name: 'Legend',   emoji: '👑', min: 3500, max: 99999 },
];

function getTier(trophies: number) {
  return TIERS.find(t => trophies >= t.min && trophies <= t.max) ?? TIERS[0];
}
function getTierName(t: number)  { return getTier(t).name; }
function getTierEmoji(t: number) { return getTier(t).emoji; }
function getNextTierTrophies(t: number): number {
  const idx = TIERS.findIndex(tier => t >= tier.min && t <= tier.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1].min : 0;
}
function getTierProgress(t: number): number {
  const tier = getTier(t);
  if (tier.max === 99999) return 100;
  return Math.round(((t - tier.min) / (tier.max - tier.min)) * 100);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  scroll: { paddingBottom: 24, alignItems: 'center' },

  headerBar: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10,
  },
  currency: { flexDirection: 'row', gap: 8 },
  currencyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111428', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  currencyEmoji: { fontSize: 14 },
  currencyVal: { color: '#fff', fontSize: 13, fontWeight: '800' },
  trophyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1e1600', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#f1c40f44',
  },
  trophyEmoji: { fontSize: 14 },
  trophyVal: { color: '#f1c40f', fontSize: 13, fontWeight: '800' },

  heroSection: {
    width: '100%', alignItems: 'center',
    paddingTop: 10, paddingBottom: 4,
    overflow: 'hidden',
  },
  glowBlue: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#3a86ff12', top: -40, left: -40,
  },
  glowGold: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#f1c40f0a', bottom: 0, right: 0,
  },
  heroWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  heroRing: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: '#3a86ff22',
    backgroundColor: '#3a86ff08',
  },
  heroSprite: { width: 190, height: 190 },

  title: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: 6 },
  titleGold: { color: '#f1c40f', fontSize: 38, fontWeight: '900', letterSpacing: 6, marginTop: -8 },
  subtitle: { color: '#3a86ff', fontSize: 11, fontWeight: '700', letterSpacing: 4, marginTop: 4, marginBottom: 16 },

  statsCard: {
    flexDirection: 'row', backgroundColor: '#111428',
    borderRadius: 16, marginHorizontal: 16, marginVertical: 8,
    paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#2a2a4a', gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statLbl: { color: '#555', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#2a2a4a' },

  leagueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111428', borderRadius: 16,
    marginHorizontal: 16, marginVertical: 8,
    padding: 16, borderWidth: 1, borderColor: '#2a2a4a',
    width: '100%', alignSelf: 'center',
    paddingHorizontal: 20,
  },
  leagueEmoji: { fontSize: 40 },
  leagueInfo: { flex: 1, gap: 4 },
  leagueName: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  leagueSub: { color: '#666', fontSize: 11 },
  leagueBar: {
    height: 4, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden', marginTop: 2,
  },
  leagueBarFill: {
    height: '100%', backgroundColor: '#f1c40f', borderRadius: 2,
  },

  battleBtn: {
    marginHorizontal: 16, marginVertical: 12,
    width: '90%', borderRadius: 20,
    shadowColor: '#3a86ff', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  battleBtnInner: {
    backgroundColor: '#3a86ff', paddingVertical: 20,
    alignItems: 'center', borderRadius: 20,
    borderWidth: 1.5, borderColor: '#6ab0ff',
    flexDirection: 'row', justifyContent: 'center', gap: 10,
  },
  battleGlow: {
    position: 'absolute', bottom: -8, left: '15%', right: '15%',
    height: 20, backgroundColor: '#3a86ff', borderRadius: 10,
    opacity: 0.3,
  },
  battleIcon: { fontSize: 26 },
  battleText: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 4 },

  infoRow: {
    flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 4,
  },
  infoChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#0e0e22', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1a1a3a',
    justifyContent: 'center',
  },
  infoEmoji: { fontSize: 14 },
  infoText: { color: '#555', fontSize: 10, fontWeight: '700' },

  version: { color: '#222', fontSize: 10, marginTop: 20 },
});
