import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spell } from '../types';
import { CARD_POOL } from '../constants';

interface Props {
  spell: Spell;
  scaleX: number;
  scaleY: number;
}

const SPELL_COLORS: Record<string, string> = {
  sandstorm:       '#e67e22',
  pharaohs_wrath:  '#f1c40f',
  desert_tempest:  '#9b59b6',
};

export default function SpellView({ spell, scaleX, scaleY }: Props) {
  const scale = Math.min(scaleX, scaleY);
  const cx = spell.position.x * scaleX;
  const cy = spell.position.y * scaleY;
  const r  = spell.radius * scale;

  const progress  = spell.elapsed / spell.duration;          // 0 → 1
  const opacity   = Math.max(0.12, 0.75 * (1 - progress));  // fades out
  const innerR    = r * (0.3 + 0.7 * progress);             // expands inward

  const color  = SPELL_COLORS[spell.type] ?? '#fff';
  const cardDef = CARD_POOL.find((c) => c.id === spell.type);
  const emoji  = cardDef?.emoji ?? '✨';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          left:         cx - r,
          top:          cy - r,
          width:        r * 2,
          height:       r * 2,
          borderRadius: r,
          borderColor:  color,
          opacity,
        },
      ]}
    >
      {/* Inner pulse ring */}
      <View
        style={[
          styles.innerRing,
          {
            width:        innerR * 2,
            height:       innerR * 2,
            borderRadius: innerR,
            borderColor:  color,
          },
        ]}
      />
      <Text style={[styles.emoji, { fontSize: r * 0.55 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    opacity: 0.5,
  },
  emoji: {
    textAlign: 'center',
  },
});
