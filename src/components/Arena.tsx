import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { GameState, CardId, Position } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, RIVER_Y, CARD_POOL } from '../constants';
import TowerView    from './TowerView';
import UnitView     from './UnitView';
import SpellView    from './SpellView';
import BuildingView from './BuildingView';

interface Props {
  gameState: GameState;
  selectedCard: CardId | null;
  onDeploy: (pos: Position) => void;
  containerWidth: number;
  containerHeight: number;
}

export default function Arena({
  gameState,
  selectedCard,
  onDeploy,
  containerWidth,
  containerHeight,
}: Props) {
  const scaleX = containerWidth  / ARENA_WIDTH;
  const scaleY = containerHeight / ARENA_HEIGHT;
  const riverY = RIVER_Y * scaleY;

  const selectedDef = selectedCard ? CARD_POOL.find((c) => c.id === selectedCard) : null;
  // Spells can be placed anywhere; units/buildings only on your half
  const spellSelected = selectedDef?.category === 'spell';

  function handlePress(evt: any) {
    if (!selectedCard) return;
    const { locationX, locationY } = evt.nativeEvent;
    const arenaY = locationY / scaleY;
    // Enforce placement rules
    if (!spellSelected && arenaY < RIVER_Y) return;
    onDeploy({ x: locationX / scaleX, y: arenaY });
  }

  const playerCrowns = gameState.towers.filter((t) => t.team === 'enemy'  && !t.alive).length;
  const enemyCrowns  = gameState.towers.filter((t) => t.team === 'player' && !t.alive).length;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.arena, { width: containerWidth, height: containerHeight }]}>

        {/* ── Background ── */}
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.grassEnemy,  { height: riverY }]} />
          <View style={[styles.grassPlayer, { height: containerHeight - riverY, top: riverY }]} />
          <View style={[styles.river, { top: riverY - 18, height: 36 }]} />
          <View style={[styles.pathV, { left: containerWidth * 0.28 - 18, width: 36 }]} />
          <View style={[styles.pathV, { left: containerWidth * 0.72 - 18, width: 36 }]} />
        </View>

        {/* ── Crown rows ── */}
        <View style={[styles.crownRow, { top: 6 }]}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, opacity: i < enemyCrowns  ? 1 : 0.25 }}>👑</Text>
          ))}
        </View>
        <View style={[styles.crownRow, { bottom: 6 }]}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, opacity: i < playerCrowns ? 1 : 0.25 }}>👑</Text>
          ))}
        </View>

        {/* ── Entities (back → front) ── */}
        {gameState.spells.map((spell) => (
          <SpellView key={spell.id} spell={spell} scaleX={scaleX} scaleY={scaleY} />
        ))}

        {gameState.buildings.map((b) => (
          <BuildingView key={b.id} building={b} scaleX={scaleX} scaleY={scaleY} />
        ))}

        {gameState.towers.map((tower) => (
          <TowerView key={tower.id} tower={tower} scaleX={scaleX} scaleY={scaleY} />
        ))}

        {gameState.units.map((unit) => (
          <UnitView key={unit.id} unit={unit} scaleX={scaleX} scaleY={scaleY} />
        ))}

        {/* ── Placement hint ── */}
        {selectedCard && (
          <View
            style={[
              styles.dropHint,
              spellSelected
                ? { top: 0, height: containerHeight, borderTopWidth: 0, borderColor: '#9b59b6' }
                : { top: riverY + 4, height: containerHeight - riverY - 4 },
            ]}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  arena: {
    overflow: 'hidden',
    position: 'relative',
  },
  grassPlayer: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: '#4a7c59',
  },
  grassEnemy: {
    position: 'absolute', left: 0, right: 0, top: 0,
    backgroundColor: '#3d6b4f',
  },
  river: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: '#1a6faf',
  },
  pathV: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: 'rgba(180,140,100,0.35)',
  },
  crownRow: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, zIndex: 10,
  },
  dropHint: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: 'rgba(58,134,255,0.10)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(58,134,255,0.5)',
    borderColor: 'rgba(58,134,255,0.5)',
    zIndex: 1,
  } as any,
});
