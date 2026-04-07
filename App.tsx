import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import MenuScreen        from './src/screens/MenuScreen';
import LobbyScreen       from './src/screens/LobbyScreen';
import GameScreen        from './src/screens/GameScreen';
import RelicOpenScreen   from './src/screens/RelicOpenScreen';
import { loadDeck, saveDeck, loadProfile, saveProfile } from './src/utils/storage';
import { CardId } from './src/types';
import { PlayerProfile, RelicReward } from './src/types/progression';
import { applyBattleResult, openRelic } from './src/utils/progression';

type Screen = 'menu' | 'lobby' | 'game' | 'relic';

export default function App() {
  const [screen, setScreen]       = useState<Screen>('menu');
  const [deck, setDeck]           = useState<CardId[]>([]);
  const [profile, setProfile]     = useState<PlayerProfile | null>(null);
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

  function handleBattleEnd(
    won: boolean,
    crowns: number,
    destroyedEnemyKing: boolean
  ) {
    if (!profile) return;
    const updated = applyBattleResult(profile, won, crowns, destroyedEnemyKing);
    handleProfileChange(updated);

    if (updated.pendingRelic) {
      // Open the relic immediately
      const { reward, updatedProfile } = openRelic(updated, updated.pendingRelic);
      setRelicReward(reward);
      handleProfileChange(updatedProfile);
      setScreen('relic');
    } else {
      setScreen('lobby');
    }
  }

  function handleRelicClose() {
    setRelicReward(null);
    setScreen('lobby');
  }

  if (!profile) return null;

  return (
    <>
      <StatusBar style="light" />
      {screen === 'menu' && (
        <MenuScreen onStart={() => setScreen('lobby')} />
      )}
      {screen === 'lobby' && (
        <LobbyScreen
          deck={deck}
          onDeckChange={handleDeckChange}
          onPlay={() => setScreen('game')}
          profile={profile}
          onProfileChange={handleProfileChange}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          deck={deck}
          profile={profile}
          onBattleEnd={handleBattleEnd}
          onExit={() => setScreen('lobby')}
        />
      )}
      {screen === 'relic' && relicReward && (
        <RelicOpenScreen reward={relicReward} onClose={handleRelicClose} />
      )}
    </>
  );
}
