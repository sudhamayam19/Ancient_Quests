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
import { PlayerProfile } from '../types/progression';
import { getCardLevel, statMultiplier } from '../utils/progression';

interface Props {
  deck: CardId[];
  profile: PlayerProfile;
  onBattleEnd: (won: boolean, crowns: number, destroyedEnemyKing: boolean) => void;
  onExit: () => void;
}

export default function GameScreen({ deck, profile, onBattleEnd, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const HEADER_H = 56;
  const FOOTER_H = 185;
  const arenaH   = height - HEADER_H - FOOTER_H;

  const [gameState, setGameState]   = useState<GameState>(() => buildInitialState(deck));
  const [selectedCard, setSelected] = useState<CardId | null>(null);
  const battleEndedRef = useRef(false);

  const stateRef  = useRef(gameState);
  stateRef.current = gameState;

  const lastTime  = useRef<number | null>(null);
  const aiState   = useRef<AIState>(makeAIState());
  const rafId     = useRef<number | null>(null);
  const nextCardQ = useRef<CardId>(getRandomCard());

  const tick = useCallback((now: number) => {
    try {
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
    } catch (e) {
      // Restart the loop even if a single frame throws
      console.warn('tick error', e);
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

    const cardLevel = getCardLevel(profile, selectedCard);
    const updatedHand = state.playerHand.filter((c) => c !== selectedCard);
    const newNext = getRandomCard([...updatedHand, state.nextCard]);
    nextCardQ.current = newNext;
    setGameState((prev) => deployCard(prev, selectedCard, pos, 'player', newNext, cardLevel));
    setSelected(null);
  }, [selectedCard, profile]);

  // Fire onBattleEnd once when game transitions to gameover
  const prevPhaseRef = useRef<string>('playing');
  useEffect(() => {
    if (gameState.phase === 'gameover' && prevPhaseRef.current === 'playing' && !battleEndedRef.current) {
      battleEndedRef.current = true;
      const won = gameState.winner === 'player';
      const crowns = gameState.towers.filter(t => t.team === 'enemy' && !t.alive).length;
      const destroyedKing = gameState.towers.some(t => t.team === 'enemy' && t.type === 'king' && !t.alive);
      onBattleEnd(won, crowns, destroyedKing);
    }
    prevPhaseRef.current = gameState.phase;
  }, [gameState.phase, gameState.winner, gameState.towers]);

  const handleRestart = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    lastTime.current = null;
    aiState.current  = makeAIState();
    battleEndedRef.current = false;
    const fresh = buildInitialState(deck);
    setGameState(fresh);
    setSelected(null);
    rafId.current = requestAnimationFrame(tick);
  }, [tick, deck]);

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
          <Text style={styles.playerLabel}>YOU</Text>
          <View style={styles.crownRow}>
            {[0,1,2].map((i) => (
              <Text key={i} style={[styles.crownIcon, i < playerCrowns && styles.crownActive]}>👑</Text>
            ))}
          </View>
        </View>

        <View style={[styles.timerBox, gameState.timeLeft <= 60 && styles.timerBoxUrgent]}>
          <Text style={[styles.timerText, gameState.timeLeft <= 60 && styles.timerTextUrgent]}>{timerStr}</Text>
          {gameState.timeLeft <= 60 && (
            <Text style={styles.overtimeLabel}>OVERTIME</Text>
          )}
        </View>

        <View style={[styles.headerSide, styles.headerRight]}>
          <Text style={styles.playerLabel}>AI</Text>
          <View style={styles.crownRow}>
            {[0,1,2].map((i) => (
              <Text key={i} style={[styles.crownIcon, i < enemyCrowns && styles.crownActive]}>👑</Text>
            ))}
          </View>
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
          <View style={[
            styles.resultCard,
            { borderColor: gameState.winner === 'player' ? '#f1c40f' : gameState.winner === 'enemy' ? '#e63946' : '#888' },
          ]}>
            <Text style={styles.resultEmoji}>
              {gameState.winner === 'player' ? '🏆' : gameState.winner === 'enemy' ? '💀' : '🤝'}
            </Text>
            <Text style={[
              styles.resultTitle,
              { color: gameState.winner === 'player' ? '#f1c40f' : gameState.winner === 'enemy' ? '#e63946' : '#aaa' },
            ]}>
              {gameState.winner === 'player' ? 'VICTORY!' : gameState.winner === 'enemy' ? 'DEFEAT' : 'DRAW'}
            </Text>
            <View style={styles.resultCrownsRow}>
              <View style={styles.resultCrowns}>
                <Text style={styles.resultCrownLabel}>YOU</Text>
                <Text style={styles.resultCrownNum}>{playerCrowns} 👑</Text>
              </View>
              <Text style={styles.resultVs}>VS</Text>
              <View style={styles.resultCrowns}>
                <Text style={styles.resultCrownLabel}>AI</Text>
                <Text style={styles.resultCrownNum}>{enemyCrowns} 👑</Text>
              </View>
            </View>
            <Text style={styles.resultSub}>
              {gameState.winner === 'player'
                ? 'The ancients bow to you!'
                : gameState.winner === 'enemy'
                ? 'The AI crushed your forces.'
                : 'An honourable stalemate.'}
            </Text>
            <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.85}>
              <Text style={styles.restartText}>⚔️  BATTLE AGAIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onExit} activeOpacity={0.85}>
              <Text style={styles.exitText}>← LOBBY</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  header: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14,
    backgroundColor: '#0e0e22', borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  headerSide: { alignItems: 'flex-start', gap: 3, flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  playerLabel: { color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  crownRow: { flexDirection: 'row', gap: 2 },
  crownIcon: { fontSize: 14, opacity: 0.2 },
  crownActive: { opacity: 1 },
  timerBox: {
    alignItems: 'center', backgroundColor: '#111428',
    paddingHorizontal: 16, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#3a86ff55',
  },
  timerBoxUrgent: { borderColor: '#e63946', backgroundColor: '#2a0a0a' },
  timerText: { color: '#fff', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerTextUrgent: { color: '#e63946' },
  overtimeLabel: { color: '#e63946', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  footer: {
    height: 185, backgroundColor: '#0a0a18',
    borderTopWidth: 2, borderTopColor: '#1a1a3a',
    paddingTop: 6, gap: 4,
  },
  handWrap: { flex: 1 },
  hintRow: {
    position: 'absolute', bottom: 6, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: '#3a86ff33',
  },
  hintText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: '#e63946', width: 26, height: 26,
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  resultCard: {
    backgroundColor: '#0e0e22', borderRadius: 24,
    padding: 32, alignItems: 'center', gap: 14,
    borderWidth: 2, minWidth: 280,
  },
  resultEmoji: { fontSize: 70 },
  resultTitle: { fontSize: 36, fontWeight: '900', letterSpacing: 3 },
  resultCrownsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
    backgroundColor: '#111428', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  resultCrowns: { alignItems: 'center', gap: 4 },
  resultCrownLabel: { color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  resultCrownNum: { color: '#fff', fontSize: 22, fontWeight: '900' },
  resultVs: { color: '#333', fontSize: 14, fontWeight: '900' },
  resultSub: { color: '#666', fontSize: 14, textAlign: 'center' },
  restartBtn: {
    marginTop: 4, backgroundColor: '#3a86ff',
    paddingHorizontal: 36, paddingVertical: 16, borderRadius: 16,
    shadowColor: '#3a86ff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
    borderWidth: 1, borderColor: '#6ab0ff',
  },
  restartText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  exitBtn: {
    backgroundColor: '#1a1a2e', paddingHorizontal: 28,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: '#333',
  },
  exitText: { color: '#666', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
