import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tower } from '../types';
import { TOWER_RADIUS } from '../constants';

interface Props {
  tower: Tower;
  scaleX: number;
  scaleY: number;
}

export default function TowerView({ tower, scaleX, scaleY }: Props) {
  const x = tower.position.x * scaleX;
  const y = tower.position.y * scaleY;
  const r = TOWER_RADIUS * Math.min(scaleX, scaleY);
  const hpPct = tower.hp / tower.maxHp;

  const isPlayer = tower.team === 'player';
  const isKing = tower.type === 'king';

  const bgColor = isPlayer
    ? isKing
      ? '#1a1a2e'
      : '#16213e'
    : isKing
    ? '#4a0000'
    : '#6b0000';

  const borderColor = isPlayer ? '#3a86ff' : '#e63946';

  return (
    <View
      style={[
        styles.tower,
        {
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isKing ? 3 : 2,
          opacity: tower.alive ? 1 : 0.25,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: r * 0.85 }]}>
        {isKing ? '👑' : '🏰'}
      </Text>

      {tower.alive && (
        <View style={[styles.hpBarWrap, { width: r * 2.2, left: -r * 0.1 }]}>
          <View
            style={[
              styles.hpBarFill,
              {
                width: `${Math.max(0, hpPct * 100)}%`,
                backgroundColor: hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c',
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tower: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  hpBarWrap: {
    position: 'absolute',
    bottom: -10,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
