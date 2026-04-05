import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Tower } from '../types';
import { TOWER_RADIUS } from '../constants';

interface Props {
  tower: Tower;
  scaleX: number;
  scaleY: number;
}

// Number of HP pip segments per tower
const KING_PIPS     = 8;
const PRINCESS_PIPS = 6;

export default function TowerView({ tower, scaleX, scaleY }: Props) {
  const x = tower.position.x * scaleX;
  const y = tower.position.y * scaleY;
  const r = TOWER_RADIUS * Math.min(scaleX, scaleY);
  const hpPct = tower.hp / tower.maxHp;

  const isPlayer = tower.team === 'player';
  const isKing   = tower.type === 'king';
  const totalPips = isKing ? KING_PIPS : PRINCESS_PIPS;
  const activePips = Math.ceil(hpPct * totalPips);

  const bgColor = isPlayer
    ? isKing ? '#1a1a2e' : '#16213e'
    : isKing ? '#4a0000' : '#6b0000';

  const borderColor = isPlayer ? '#3a86ff' : '#e63946';

  // Attack pulse animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!tower.alive) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
  }, [tower.alive ? 1 : 0]);

  const hpColor = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';

  return (
    <Animated.View
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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Inner glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: r * 2 - 4,
            height: r * 2 - 4,
            borderRadius: r - 2,
            borderColor: isPlayer ? 'rgba(58,134,255,0.3)' : 'rgba(230,57,70,0.3)',
          },
        ]}
      />
      <Text style={[styles.emoji, { fontSize: r * 0.85 }]}>
        {isKing ? '👑' : '🏰'}
      </Text>

      {/* HP pip row — one pip per segment */}
      {tower.alive && (
        <View style={[styles.pipRow, { width: r * 2.4 }]}>
          {Array.from({ length: totalPips }, (_, i) => (
            <View
              key={i}
              style={[
                styles.pip,
                {
                  backgroundColor: i < activePips ? hpColor : 'rgba(255,255,255,0.12)',
                  width: (r * 2.4 - (totalPips - 1) * 2) / totalPips,
                  height: 4,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tower: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  emoji: {
    textAlign: 'center',
  },
  pipRow: {
    position: 'absolute',
    bottom: -12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    paddingHorizontal: 1,
  },
  pip: {
    borderRadius: 2,
  },
});
