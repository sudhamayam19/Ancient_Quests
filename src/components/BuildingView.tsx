import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Building } from '../types';
import { BUILDING_RADIUS, CARD_POOL } from '../constants';
import { getBuildingSprite } from '../constants/sprites';

interface Props {
  building: Building;
  scaleX: number;
  scaleY: number;
}

const DECAY_DPS = 18;

export default function BuildingView({ building, scaleX, scaleY }: Props) {
  const scale = Math.min(scaleX, scaleY);
  const r     = BUILDING_RADIUS * scale;
  const cx    = building.position.x * scaleX;
  const cy    = building.position.y * scaleY;
  const hpPct = building.hp / building.maxHp;

  const isPlayer  = building.team === 'player';
  const cardDef   = CARD_POOL.find((c) => c.id === building.type) as any;
  const color     = cardDef?.color ?? '#888';
  const emoji     = cardDef?.emoji ?? '🏗️';
  const sprite    = getBuildingSprite(building.type);
  const isInferno = building.type === 'inferno_trap';

  const hpColor    = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
  const spriteSize = Math.max(64, r * 3.8);

  // Inferno flame pulse animation
  const flamePulse = useRef(new Animated.Value(0.6)).current;
  const flameScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isInferno) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, { toValue: 1,   duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flamePulse, { toValue: 0.5, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.15, duration: 350, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 0.9,  duration: 350, useNativeDriver: true }),
      ])
    ).start();
  }, [isInferno]);

  return (
    <View
      style={[
        styles.building,
        sprite ? {
          left:            cx - spriteSize / 2,
          top:             cy - spriteSize * 0.75,
          width:           spriteSize,
          height:          spriteSize,
          borderRadius:    0,
          backgroundColor: 'transparent',
          borderWidth:     0,
        } : {
          left:            cx - r,
          top:             cy - r,
          width:           r * 2,
          height:          r * 2,
          borderRadius:    6 * scale,
          backgroundColor: color + '28',
          borderColor:     isPlayer ? color : '#e63946',
          borderWidth:     2.5,
        },
      ]}
    >
      {/* Inferno flame glow rings */}
      {isInferno && (
        <>
          <Animated.View style={[
            styles.flameRing,
            {
              width:  spriteSize * 1.3,
              height: spriteSize * 1.3,
              borderRadius: spriteSize * 0.65,
              top: -spriteSize * 0.15,
              left: -spriteSize * 0.15,
              opacity: flamePulse,
              transform: [{ scale: flameScale }],
            },
          ]} />
          <Animated.View style={[
            styles.flameRingInner,
            {
              width:  spriteSize * 0.9,
              height: spriteSize * 0.9,
              borderRadius: spriteSize * 0.45,
              top: spriteSize * 0.05,
              left: spriteSize * 0.05,
              opacity: flamePulse,
            },
          ]} />
        </>
      )}

      {sprite ? (
        <Image source={sprite} style={{ width: spriteSize, height: spriteSize, resizeMode: 'contain' }} />
      ) : (
        <Text style={[styles.emoji, { fontSize: r * 0.9 }]}>{emoji}</Text>
      )}

      {/* HP bar */}
      <View style={[styles.hpWrap, { width: spriteSize * 0.9, left: spriteSize * 0.05 }]}>
        <View style={[styles.hpFill, { width: `${Math.max(0, hpPct * 100)}%`, backgroundColor: hpColor }]} />
      </View>

      {/* Range ring */}
      {building.attackRange > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.rangeRing,
            {
              width:        building.attackRange * scaleX * 2,
              height:       building.attackRange * scaleY * 2,
              borderRadius: building.attackRange * Math.min(scaleX, scaleY),
              left:         -(building.attackRange * scaleX - spriteSize / 2),
              top:          -(building.attackRange * scaleY - spriteSize * 0.75 + r),
              borderColor:  isInferno ? '#e74c3c' : color,
              opacity:      isInferno ? 0.25 : 0.12,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  building: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: { textAlign: 'center' },
  flameRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#ff4500',
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 3,
  },
  flameRingInner: {
    position: 'absolute',
    backgroundColor: 'rgba(255,100,0,0.12)',
    borderWidth: 2,
    borderColor: '#ff8c00',
  },
  hpWrap: {
    position: 'absolute',
    bottom: -9,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpFill: { height: '100%', borderRadius: 3 },
  rangeRing: {
    position: 'absolute',
    borderWidth: 1,
  } as any,
});
