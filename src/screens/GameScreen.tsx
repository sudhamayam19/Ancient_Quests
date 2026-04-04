import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { GameState, CardId, Position } from '../types';
import {
  buildInitialState, stepGame, deployCard,
  getRandomCard, enemyAI, makeAIState, AIState,
} from '../game/engine';
import { CARD_POOL } from '../constants';
import Arena    from '../components/Arena';
import CardHand from '../components/CardHand';
import ElixirBar from '../components/ElixirBar';

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const HEADER_H = 56;
  const FOOTER_H = 160;
  const arenaH   = height - HEADER_H - FOOTER_H;

  const [gameState, setGameState]   = useState<GameState>(() => buildInitialState());
  const [selectedCard, setSelected] = useState<CardId | null>(null);

  const stateRef  = useRef(gameState);
  stateRef.current = gameState;

  const lastTime  = useRef<number | null>(null);
  const aiState   = useRef<AIState>(makeAIState());
  const rafId     = useRef<number | null>(null);
  const nextCardQ = useRef<CardId>(getRandomCard());

  const tick = useCallback((now: number) => {
    if (lastTime.current === null) lastTime.current = now;
    const dt = Math.min((now - lastTime.current) / 1000, 0.1);
    lastTime.current = now;

    let state = stateRef.current;
    if (state.phase === 'playing') {
      state = stepGame(state, dt, now);
      const { state: s2, ai: newAI } = enemyAI(state, aiState.current, now);
      state     = s2;
      aiState.current = newAI;
      setGameState(state);
    }

    if (state.phase === 'playing') {
      rafId.current = requestAnimationFrame(tick);
    }
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current !== null) cancelAnimationFrame(rafId.current); };
  }, [tick]);

  const handleSelectCard = useCallback((card: CardId) => {
    setSelected((prev) => (prev === card ? null : card));
  }, []);

  const handleDeploy = useCallback((pos: Position) => {
    if (!selectedCard) return;
    const def = CARD_POOL.find((c) => c.id === selectedCard);
    if (!def) return;
    const state = stateRef.current;
    if (state.playerElixir < def.cost) return;

    const newNext = getRandomCard();
    nextCardQ.current = newNext;
    setGameState((prev) => deployCard(prev, selectedCard, pos, 'player', newNext));
    setSelected(null);
  }, [selectedCard]);

  const handleRestart = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    lastTime.current = null;
    aiState.current  = makeAIState();
    const fresh = buildInitialState();
    setGameState(fresh);
    setSelected(null);
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  // Timer display
  const mins    = Math.floor(gameState.timeLeft / 60);
  const secs    = Math.floor(gameState.timeLeft % 60);
  const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const playerCrowns = gameState.towers.filter((t) => t.team === 'enemy'  && !t.alive).length;
  const enemyCrowns  = gameState.towers.filter((t) => t.team === 'player' && !t.alive).length;

  const selectedDef = selectedCard ? CARD_POOL.find((c) => c.id === selectedCard) : null;

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Text style={styles.playerLabel}>👤 You</Text>
          <Text style={styles.crowns}>
            {'👑'.repeat(playerCrowns)}{'⬛'.repeat(3 - playerCrowns)}
          </Text>
        </View>

        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{timerStr}</Text>
          {gameState.timeLeft <= 60 && (
            <Text style={styles.overtimeLabel}>⚡ Overtime</Text>
          )}
        </View>

        <View style={[styles.headerSide, styles.headerRight]}>
          <Text style={styles.playerLabel}>🤖 AI</Text>
          <Text style={styles.crowns}>
            {'👑'.repeat(enemyCrowns)}{'⬛'.repeat(3 - enemyCrowns)}
          </Text>
        </View>
      </View>

      {/* ── Arena ── */}
      <Arena
        gameState={gameState}
        selectedCard={selectedCard}
        onDeploy={handleDeploy}
        containerWidth={width}
        containerHeight={arenaH}
      />

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <ElixirBar elixir={gameState.playerElixir} />
        <View style={styles.handWrap}>
          <CardHand
            hand={gameState.playerHand}
            nextCard={gameState.nextCard}
            elixir={gameState.playerElixir}
            selectedCard={selectedCard}
            onSelectCard={handleSelectCard}
          />
        </View>

        {/* Selected card hint */}
        {selectedCard && (
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>
              {selectedDef?.category === 'spell'
                ? '✨ Tap anywhere to cast'
                : selectedDef?.category === 'building'
                ? '🏗 Tap your side to place'
                : '⚔️ Tap your side to deploy'}
            </Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Game Over ── */}
      {gameState.phase === 'gameover' && (
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {gameState.winner === 'player' ? '🏆' : gameState.winner === 'enemy' ? '💀' : '🤝'}
            </Text>
            <Text style={styles.resultTitle}>
              {gameState.winner === 'player' ? 'Victory!' : gameState.winner === 'enemy' ? 'Defeat' : 'Draw'}
            </Text>
            <Text style={styles.resultSub}>
              {gameState.winner === 'player'
                ? 'The ancients bow to you!'
                : gameState.winner === 'enemy'
                ? 'The AI crushed your forces.'
                : 'An honourable stalemate.'}
            </Text>
            <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
              <Text style={styles.restartText}>⚔️ Battle Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },
  header: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 12,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222',
  },
  headerSide: { alignItems: 'flex-start', gap: 2, flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  playerLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  crowns: { fontSize: 13, letterSpacing: 2 },
  timerBox: {
    alignItems: 'center', backgroundColor: '#1a1a2e',
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#3a86ff',
  },
  timerText: { color: '#fff', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  overtimeLabel: { color: '#f39c12', fontSize: 9, fontWeight: '700' },
  footer: {
    height: 160, backgroundColor: '#111',
    borderTopWidth: 1, borderTopColor: '#222',
    paddingTop: 8, gap: 6,
  },
  handWrap: { flex: 1 },
  hintRow: {
    position: 'absolute', bottom: 6, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  hintText: { color: '#ccc', fontSize: 11, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: '#e63946', width: 24, height: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  resultCard: {
    backgroundColor: '#1a1a2e', borderRadius: 20,
    padding: 32, alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#3a86ff', minWidth: 260,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: { color: '#fff', fontSize: 32, fontWeight: '900' },
  resultSub:   { color: '#aaa', fontSize: 15, textAlign: 'center' },
  restartBtn:  {
    marginTop: 8, backgroundColor: '#3a86ff',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  restartText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
