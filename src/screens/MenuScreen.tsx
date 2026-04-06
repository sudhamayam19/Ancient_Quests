import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Image,
} from 'react-native';

const kiaraSprite = require('../../assets/sprites/princess_archer.png');

interface Props {
  onStart: () => void;
}

export default function MenuScreen({ onStart }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      {/* Background glow blobs */}
      <View style={styles.glowBlue} />
      <View style={styles.glowPurple} />

      <View style={styles.center}>
        {/* Hero sprite */}
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />
          <Image source={kiaraSprite} style={styles.heroSprite} resizeMode="contain" />
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>ANCIENT</Text>
          <Text style={styles.titleAccent}>QUESTS</Text>
          <Text style={styles.subtitle}>CARD BATTLE ARENA</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>8</Text>
            <Text style={styles.statLbl}>Units</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLbl}>Spells</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLbl}>Buildings</Text>
          </View>
        </View>

        {/* Battle button */}
        <TouchableOpacity style={styles.battleBtn} onPress={onStart} activeOpacity={0.85}>
          <View style={styles.battleBtnInner}>
            <Text style={styles.battleText}>⚔️  BATTLE</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07071a',
  },
  glowBlue: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: '#3a86ff18',
    top: -60, left: -80,
  },
  glowPurple: {
    position: 'absolute',
    width: 250, height: 250,
    borderRadius: 125,
    backgroundColor: '#9b59b618',
    bottom: 80, right: -60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  heroWrap: {
    width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#3a86ff22',
  },
  heroSprite: {
    width: 170, height: 170,
  },
  titleWrap: { alignItems: 'center', gap: 2 },
  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 6,
  },
  titleAccent: {
    color: '#f1c40f',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: -10,
  },
  subtitle: {
    color: '#3a86ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#111428',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  statBadge: { alignItems: 'center', gap: 2 },
  statNum: { color: '#f1c40f', fontSize: 22, fontWeight: '900' },
  statLbl: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#2a2a4a', alignSelf: 'stretch' },
  battleBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3a86ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  battleBtnInner: {
    backgroundColor: '#3a86ff',
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#6ab0ff',
  },
  battleText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  version: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
  },
});
