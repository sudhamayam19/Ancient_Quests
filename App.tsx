import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';

type Screen = 'menu' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <>
      <StatusBar style="light" />
      {screen === 'menu' ? (
        <MenuScreen onStart={() => setScreen('game')} />
      ) : (
        <GameScreen />
      )}
    </>
  );
}
