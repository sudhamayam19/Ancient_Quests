import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import MainNavigator   from './src/screens/MainNavigator';
import GameScreen      from './src/screens/GameScreen';
import RelicOpenScreen from './src/screens/RelicOpenScreen';
import { loadDeck, saveDeck, loadProfile, saveProfile } from './src/utils/storage';
import { CardId } from './src/types';
import { PlayerProfile, RelicReward } from './src/types/progression';
import { applyBattleResult, openRelic } from './src/utils/progression';

type Screen = 'main' | 'game' | 'relic';

export default function App() {
  const [screen, setScreen]           = useState<Screen>('main');
  const [deck, setDeck]               = useState<CardId[]>([]);
  const [profile, setProfile]         = useState<PlayerProfile | null>(null);
  const [relicReward, setRelicReward] = useState<RelicReward | null>(null);

  useEffect(() => {
    Promise.all([loadDeck(), loadProfile()]).then(([d, p]) => {
      setDeck(d);
      setProfile(p);
    });
  }, []);

  function handleDeckChange(newDeck: CardId[]) {
    setDeck(newDeck);
    saveDeck(newDeck);
  }

  function handleProfileChange(newProfile: PlayerProfile) {
    setProfile(newProfile);
    saveProfile(newProfile);
  }

  function handleBattleEnd(won: boolean, crowns: number, destroyedEnemyKing: boolean) {
    if (!profile) return;
    const updated = applyBattleResult(profile, won, crowns, destroyedEnemyKing);
    handleProfileChange(updated);

    if (updated.pendingRelic) {
      const { reward, updatedProfile } = openRelic(updated, updated.pendingRelic);
      setRelicReward(reward);
      handleProfileChange(updatedProfile);
      setScreen('relic');
    } else {
      setScreen('main');
    }
  }

  function handleRelicEarned(reward: RelicReward) {
    setRelicReward(reward);
    setScreen('relic');
  }

  function handleRelicClose() {
    setRelicReward(null);
    setScreen('main');
  }

  if (!profile) return null;

  return (
    <>
      <StatusBar style="light" />

      {screen === 'main' && (
        <MainNavigator
          deck={deck}
          onDeckChange={handleDeckChange}
          profile={profile}
          onProfileChange={handleProfileChange}
          onPlay={() => setScreen('game')}
          onRelicEarned={handleRelicEarned}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          deck={deck}
          profile={profile}
          onBattleEnd={handleBattleEnd}
          onExit={() => setScreen('main')}
        />
      )}

      {screen === 'relic' && relicReward && (
        <RelicOpenScreen reward={relicReward} onClose={handleRelicClose} />
      )}
    </>
  );
}
