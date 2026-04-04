import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

interface Props {
  onStart: () => void;
}

export default function MenuScreen({ onStart }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.logo}>⚔️</Text>
        <Text style={styles.title}>Ancient Quests</Text>
        <Text style={styles.subtitle}>Battle Arena</Text>

        <View style={styles.descBox}>
          <Text style={styles.descTitle}>How to Play</Text>
          <Text style={styles.desc}>
            {'1. Tap a card at the bottom to select it\n'}
            {'2. Tap on your side of the arena to deploy\n'}
            {'3. Destroy the enemy\'s King Tower to win!\n'}
            {'4. Elixir regenerates over time — spend wisely'}
          </Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startText}>⚔️ Battle!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#3a86ff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  descBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  descTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  desc: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  startBtn: {
    backgroundColor: '#3a86ff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  startText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
});
