import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Building } from '../types';
import { BUILDING_RADIUS, CARD_POOL } from '../constants';

interface Props {
  building: Building;
  scaleX: number;
  scaleY: number;
}

// Decay damage per second applied to buildings with a finite decayTime
const DECAY_DPS = 18;

export default function BuildingView({ building, scaleX, scaleY }: Props) {
  const scale = Math.min(scaleX, scaleY);
  const r     = BUILDING_RADIUS * scale;
  const cx    = building.position.x * scaleX;
  const cy    = building.position.y * scaleY;
  const hpPct = building.hp / building.maxHp;

  const isPlayer = building.team === 'player';
  const cardDef  = CARD_POOL.find((c) => c.id === building.type) as any;
  const color    = cardDef?.color  ?? '#888';
  const emoji    = cardDef?.emoji  ?? '🏗️';

  const hpColor = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';

  return (
    <View
      style={[
        styles.building,
        {
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
      <Text style={[styles.emoji, { fontSize: r * 0.9 }]}>{emoji}</Text>

      {/* HP bar — doubles as the decay indicator since decay is real HP damage */}
      <View style={[styles.hpWrap, { width: r * 2.2, left: -r * 0.1 }]}>
        <View
          style={[
            styles.hpFill,
            {
              width: `${Math.max(0, hpPct * 100)}%`,
              backgroundColor: hpColor,
            },
          ]}
        />
      </View>

      {/* Range indicator */}
      {building.attackRange > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.rangeRing,
            {
              width:        building.attackRange * scaleX * 2,
              height:       building.attackRange * scaleY * 2,
              borderRadius: building.attackRange * Math.min(scaleX, scaleY),
              left:         -(building.attackRange * scaleX - r),
              top:          -(building.attackRange * scaleY - r),
              borderColor:  color,
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
  emoji: {
    textAlign: 'center',
  },
  hpWrap: {
    position: 'absolute',
    bottom: -9,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 3,
  },
  rangeRing: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.12,
  } as any,
});
