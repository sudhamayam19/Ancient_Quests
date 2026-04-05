import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Unit } from '../types';
import { CARD_POOL, UNIT_RADIUS } from '../constants';

interface Props {
  unit: Unit;
  scaleX: number;
  scaleY: number;
  // If provided, this overrides unit.position for smooth visual interpolation
  visualX?: number;
  visualY?: number;
}

const UNIT_EMOJIS: Record<string, string> = {
  pharaoh_guard:  '𓂀',
  sand_wraith:    '🌪',
  stone_colossus: '🗿',
  oracle:         '🔮',
  berserker:      '🪓',
  blade_dancer:   '🌙',
  shaman:         '🦴',
};

// Lerp helper
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function UnitView({ unit, scaleX, scaleY }: Props) {
  const r = UNIT_RADIUS * Math.min(scaleX, scaleY);
  const hpPct = unit.hp / unit.maxHp;
  const isPlayer = unit.team === 'player';
  const cardDef = CARD_POOL.find((c) => c.id === unit.type);
  const color = cardDef?.color ?? '#888';

  // Visual position (smoothly interpolated, separate from game position)
  const visualXRef = useRef(unit.position.x * scaleX);
  const visualYRef = useRef(unit.position.y * scaleY);

  // Scale pulse on attack
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Opacity for death fade
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // HP bar color
  const hpColor = isPlayer ? '#3a86ff' : '#e63946';

  // Sync position ref when unit moves
  useEffect(() => {
    visualXRef.current = unit.position.x * scaleX;
    visualYRef.current = unit.position.y * scaleY;
  }, [unit.position.x, unit.position.y, scaleX, scaleY]);

  // Attack pulse: trigger scale bump when lastAttackTime is recent
  const lastAttackRef = useRef(unit.lastAttackTime);
  useEffect(() => {
    if (unit.lastAttackTime !== lastAttackRef.current) {
      lastAttackRef.current = unit.lastAttackTime;
      // Only pulse for melee (ranged units don't show this - they have projectiles)
      const isRanged = (unit as any).attackRange > 45;
      if (!isRanged) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.35,
            duration: 60,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 140,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [unit.lastAttackTime]);

  // Death fade: trigger when unit is low HP
  const hpRef = useRef(unit.hp);
  useEffect(() => {
    if (unit.hp < hpRef.current && unit.hp / unit.maxHp < 0.3) {
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    hpRef.current = unit.hp;
  }, [unit.hp]);

  const vx = visualXRef.current;
  const vy = visualYRef.current;

  return (
    <Animated.View
      style={[
        styles.unit,
        {
          left: vx - r,
          top: vy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
          borderColor: isPlayer ? '#3a86ff' : '#e63946',
          borderWidth: 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: r * 0.9 }]}>
        {UNIT_EMOJIS[unit.type] ?? '❓'}
      </Text>

      <View style={[styles.hpBarWrap, { width: r * 2.2, left: -r * 0.1 }]}>
        <View
          style={[
            styles.hpBarFill,
            {
              width: `${Math.max(0, hpPct * 100)}%`,
              backgroundColor: hpColor,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  unit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  emoji: {
    textAlign: 'center',
  },
  hpBarWrap: {
    position: 'absolute',
    bottom: -8,
    height: 4,
    backgroundColor: '#111',
    borderRadius: 2,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
