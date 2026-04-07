import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardId } from '../types';
import { PlayerProfile } from '../types/progression';
import DeckScreen from './DeckScreen';
import CollectionScreen from './CollectionScreen';

type SubTab = 'deck' | 'collection';

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
  profile: PlayerProfile;
  onProfileChange: (p: PlayerProfile) => void;
}

export default function CardsScreen({ deck, onDeckChange, profile, onProfileChange }: Props) {
  const [sub, setSub] = useState<SubTab>('deck');

  const unlockedCount = profile.collection.filter(e => e.unlocked).length;
  const totalCount    = profile.collection.length;

  return (
    <View style={styles.root}>
      {/* Sub-tab header */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTab, sub === 'deck' && styles.subTabActive]}
          onPress={() => setSub('deck')}
        >
          <Text style={[styles.subTabText, sub === 'deck' && styles.subTabTextActive]}>
            MY DECK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, sub === 'collection' && styles.subTabActive]}
          onPress={() => setSub('collection')}
        >
          <View style={styles.subTabRow}>
            <Text style={[styles.subTabText, sub === 'collection' && styles.subTabTextActive]}>
              COLLECTION
            </Text>
            <View style={[styles.badge, sub === 'collection' && styles.badgeActive]}>
              <Text style={styles.badgeText}>{unlockedCount}/{totalCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {sub === 'deck' ? (
          <DeckScreen deck={deck} onDeckChange={onDeckChange} />
        ) : (
          <CollectionScreen profile={profile} onProfileChange={onProfileChange} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  subTabBar: {
    flexDirection: 'row', backgroundColor: '#0a0a18',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  subTab: {
    flex: 1, alignItems: 'center', paddingVertical: 13,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  subTabActive: { borderBottomColor: '#f1c40f' },
  subTabRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subTabText: { color: '#444', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  subTabTextActive: { color: '#fff' },
  badge: {
    backgroundColor: '#2a2a4a', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeActive: { backgroundColor: '#f1c40f22', borderWidth: 1, borderColor: '#f1c40f44' },
  badgeText: { color: '#888', fontSize: 9, fontWeight: '800' },
  content: { flex: 1 },
});
