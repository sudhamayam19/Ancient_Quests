import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import MenuScreen  from './src/screens/MenuScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen  from './src/screens/GameScreen';
import { loadDeck, saveDeck } from './src/utils/storage';
import { CardId } from './src/types';

type Screen = 'menu' | 'lobby' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [deck, setDeck]     = useState<CardId[]>([]);
  const [deckLoaded, setDeckLoaded] = useState(false);

  useEffect(() => {
    loadDeck().then((d) => {
      setDeck(d);
      setDeckLoaded(true);
    });
  }, []);

  function handleDeckChange(newDeck: CardId[]) {
    setDeck(newDeck);
    saveDeck(newDeck);
  }

  if (!deckLoaded) return null;

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
        />
      )}
      {screen === 'game' && <GameScreen />}
    </>
  );
}