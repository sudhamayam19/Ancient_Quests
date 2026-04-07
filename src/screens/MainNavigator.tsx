import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { CardId } from '../types';
import { PlayerProfile, RelicReward } from '../types/progression';
import HomeScreen   from './HomeScreen';
import CardsScreen  from './CardsScreen';
import ShopScreen   from './ShopScreen';
import ClubsScreen  from './ClubsScreen';

type Tab = 'home' | 'cards' | 'shop' | 'clubs';

interface TabDef {
  id: Tab;
  label: string;
  icon: string;
  activeColor: string;
}

const TABS: TabDef[] = [
  { id: 'home',  label: 'BATTLE', icon: '⚔️',  activeColor: '#3a86ff' },
  { id: 'cards', label: 'CARDS',  icon: '📦',  activeColor: '#f1c40f' },
  { id: 'shop',  label: 'SHOP',   icon: '🏪',  activeColor: '#2ecc71' },
  { id: 'clubs', label: 'CLUBS',  icon: '🏛',  activeColor: '#9b59b6' },
];

interface Props {
  deck: CardId[];
  onDeckChange: (deck: CardId[]) => void;
  profile: PlayerProfile;
  onProfileChange: (p: PlayerProfile) => void;
  onPlay: () => void;
  onRelicEarned: (reward: RelicReward) => void;
}

export default function MainNavigator({
  deck, onDeckChange, profile, onProfileChange, onPlay, onRelicEarned,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const activeTabDef = TABS.find(t => t.id === activeTab)!;

  function renderScreen() {
    switch (activeTab) {
      case 'home':  return <HomeScreen  profile={profile} onPlay={onPlay} />;
      case 'cards': return <CardsScreen deck={deck} onDeckChange={onDeckChange} profile={profile} onProfileChange={onProfileChange} />;
      case 'shop':  return <ShopScreen  profile={profile} onProfileChange={onProfileChange} onRelicEarned={onRelicEarned} />;
      case 'clubs': return <ClubsScreen profile={profile} />;
    }
  }

  return (
    <View style={styles.root}>
      {/* Screen content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom tab bar */}
      <SafeAreaView style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <View style={[styles.activePill, { backgroundColor: tab.activeColor + '22' }]} />
                )}

                <Text style={[styles.tabIcon, isActive && { transform: [{ scale: 1.15 }] }]}>
                  {tab.icon}
                </Text>
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? tab.activeColor : '#444' },
                ]}>
                  {tab.label}
                </Text>

                {/* Active underline dot */}
                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: tab.activeColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  content: { flex: 1 },

  tabBarSafe: { backgroundColor: '#080818' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#080818',
    borderTopWidth: 1,
    borderTopColor: '#14142a',
    paddingTop: 6,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, gap: 2, position: 'relative',
  },
  activePill: {
    position: 'absolute', top: -2, left: 6, right: 6,
    height: 44, borderRadius: 14,
  },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  activeDot: {
    width: 4, height: 4, borderRadius: 2, marginTop: 2,
  },
});
