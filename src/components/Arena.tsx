import React, { useRef } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { GameState, UnitType, Position } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, RIVER_Y } from '../constants';
import TowerView from './TowerView';
import UnitView from './UnitView';

interface Props {
  gameState: GameState;
  selectedCard: UnitType | null;
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
  const scaleX = containerWidth / ARENA_WIDTH;
  const scaleY = containerHeight / ARENA_HEIGHT;

  const riverY = RIVER_Y * scaleY;

  function handlePress(evt: any) {
    if (!selectedCard) return;
    const { locationX, locationY } = evt.nativeEvent;
    // Only allow player to place on their side (bottom half)
    const arenaY = locationY / scaleY;
    if (arenaY < RIVER_Y) return; // can't place in enemy half
    onDeploy({ x: locationX / scaleX, y: arenaY });
  }

  const playerCrowns = gameState.towers.filter(
    (t) => t.team === 'enemy' && !t.alive
  ).length;
  const enemyCrowns = gameState.towers.filter(
    (t) => t.team === 'player' && !t.alive
  ).length;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.arena, { width: containerWidth, height: containerHeight }]}>
        {/* Grass background */}
        <View style={StyleSheet.absoluteFill}>
          {/* Player side */}
          <View
            style={[
              styles.grass,
              styles.grassPlayer,
              { height: containerHeight - riverY, top: riverY },
            ]}
          />
          {/* Enemy side */}
          <View
            style={[
              styles.grass,
              styles.grassEnemy,
              { height: riverY, top: 0 },
            ]}
          />
          {/* River */}
          <View
            style={[
              styles.river,
              {
                top: riverY - 18,
                height: 36,
              },
            ]}
          />
          {/* Path lines */}
          <View
            style={[
              styles.pathV,
              { left: containerWidth * 0.28 - 18, width: 36 },
            ]}
          />
          <View
            style={[
              styles.pathV,
              { left: containerWidth * 0.72 - 18, width: 36 },
            ]}
          />
        </View>

        {/* Crown counters */}
        <View style={[styles.crownRow, { top: 6 }]}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, opacity: i < enemyCrowns ? 1 : 0.25 }}>
              👑
            </Text>
          ))}
        </View>
        <View style={[styles.crownRow, { bottom: 6 }]}>
          {Array.from({ length: 3 }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, opacity: i < playerCrowns ? 1 : 0.25 }}>
              👑
            </Text>
          ))}
        </View>

        {/* Towers */}
        {gameState.towers.map((tower) => (
          <TowerView
            key={tower.id}
            tower={tower}
            scaleX={scaleX}
            scaleY={scaleY}
          />
        ))}

        {/* Units */}
        {gameState.units.map((unit) => (
          <UnitView
            key={unit.id}
            unit={unit}
            scaleX={scaleX}
            scaleY={scaleY}
          />
        ))}

        {/* Drop zone hint */}
        {selectedCard && (
          <View
            style={[
              styles.dropHint,
              {
                top: riverY + 4,
                height: containerHeight - riverY - 4,
              },
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
  grass: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  grassPlayer: {
    backgroundColor: '#4a7c59',
  },
  grassEnemy: {
    backgroundColor: '#3d6b4f',
  },
  river: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1a6faf',
  },
  pathV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(180,140,100,0.35)',
  },
  crownRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  dropHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(58,134,255,0.12)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(58,134,255,0.5)',
    zIndex: 1,
    pointerEvents: 'none',
  } as any,
});
