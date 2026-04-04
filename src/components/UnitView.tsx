import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
};

export default function UnitView({ unit, scaleX, scaleY }: Props) {
  const x = unit.position.x * scaleX;
  const y = unit.position.y * scaleY;
  const r = UNIT_RADIUS * Math.min(scaleX, scaleY);
  const hpPct = unit.hp / unit.maxHp;
  const isPlayer = unit.team === 'player';
  const cardDef = CARD_POOL.find((c) => c.id === unit.type);
  const color = cardDef?.color ?? '#888';

  return (
    <View
      style={[
        styles.unit,
        {
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
          borderColor: isPlayer ? '#3a86ff' : '#e63946',
          borderWidth: 2,
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
              backgroundColor: isPlayer ? '#3a86ff' : '#e63946',
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
