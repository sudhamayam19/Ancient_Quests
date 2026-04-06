import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Unit } from '../types';
import { CARD_POOL, UNIT_RADIUS } from '../constants';

interface Props {
  unit: Unit;
  scaleX: number;
  scaleY: number;
}

const UNIT_EMOJIS: Record<string, string> = {
  pharaoh_guard:  '𓂀',
  sand_wraith:    '🌪',
  stone_colossus: '🗿',
  oracle:         '🔮',
  berserker:      '🪓',
  blade_dancer:   '🌙',
  shaman:         '🦴',
  princess_archer:'🏹',
};

function getUnitSuper(type: string) {
  const card = CARD_POOL.find((c) => c.id === type);
  return (card?.category === 'unit' && (card as any).super) ? (card as any).super : null;
}

const SUPER_ICONS: Record<string, string> = {
  heal_ally:       '💚',
  shield:          '🛡️',
  rage:            '😤',
  chain_lightning: '⚡',
  summon_minion:   '👤',
  piercing_arrow:  '🏹',
};

export default function UnitView({ unit, scaleX, scaleY }: Props) {
  const r = UNIT_RADIUS * Math.min(scaleX, scaleY);
  const hpPct = unit.hp / unit.maxHp;
  const isPlayer = unit.team === 'player';
  const cardDef = CARD_POOL.find((c) => c.id === unit.type);
  const color = cardDef?.color ?? '#888';

  const superDef = getUnitSuper(unit.type);
  const superPct = superDef ? Math.min(1, unit.superMeter / superDef.chargeTime) : 0;
  const superFull = superDef ? unit.superMeter >= superDef.chargeTime : false;

  // Visual position ref
  const visualXRef = useRef(unit.position.x * scaleX);
  const visualYRef = useRef(unit.position.y * scaleY);

  // Scale pulse on attack
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Opacity for death fade
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Super bar pulse animation
  const superPulseAnim = useRef(new Animated.Value(1)).current;

  // HP bar color
  const hpColor = isPlayer ? '#3a86ff' : '#e63946';

  // Sync position ref when unit moves
  useEffect(() => {
    visualXRef.current = unit.position.x * scaleX;
    visualYRef.current = unit.position.y * scaleY;
  }, [unit.position.x, unit.position.y, scaleX, scaleY]);

  // Attack pulse
  const lastAttackRef = useRef(unit.lastAttackTime);
  useEffect(() => {
    if (unit.lastAttackTime !== lastAttackRef.current) {
      lastAttackRef.current = unit.lastAttackTime;
      const isRanged = unit.attackRange > 45;
      if (!isRanged) {
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.35, duration: 60, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1,    duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
    }
  }, [unit.lastAttackTime]);

  // Death fade
  const hpRef = useRef(unit.hp);
  useEffect(() => {
    if (unit.hp < hpRef.current && unit.hp / unit.maxHp < 0.3) {
      Animated.timing(opacityAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }).start();
    }
    hpRef.current = unit.hp;
  }, [unit.hp]);

  // Super bar pulse when full
  const superFullRef = useRef(false);
  useEffect(() => {
    if (superFull && !superFullRef.current) {
      // Just became full — pulse animation
      superFullRef.current = true;
      Animated.loop(
        Animated.sequence([
          Animated.timing(superPulseAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
          Animated.timing(superPulseAnim, { toValue: 1,    duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else if (!superFull) {
      superFullRef.current = false;
      superPulseAnim.stopAnimation();
      superPulseAnim.setValue(1);
    }
  }, [superFull]);

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

      {/* HP bar */}
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

      {/* Super meter bar */}
      {superDef && (
        <Animated.View
          style={[
            styles.superBarWrap,
            { width: r * 2.4, left: -r * 0.2, transform: [{ scale: superPulseAnim }] },
          ]}
        >
          {/* Icon */}
          <View style={[styles.superIcon, { backgroundColor: superFull ? '#f1c40f' : '#333' }]}>
            <Text style={styles.superIconText}>
              {SUPER_ICONS[superDef.type] ?? '⭐'}
            </Text>
          </View>
          {/* Bar track */}
          <View style={styles.superTrack}>
            <View
              style={[
                styles.superFill,
                {
                  width: `${Math.max(0, superPct * 100)}%`,
                  backgroundColor: superFull ? '#f1c40f' : '#9b59b6',
                },
              ]}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  unit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
  superBarWrap: {
    position: 'absolute',
    bottom: -22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 14,
  },
  superIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superIconText: {
    fontSize: 8,
  },
  superTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  superFill: {
    height: '100%',
    borderRadius: 3,
  },
});