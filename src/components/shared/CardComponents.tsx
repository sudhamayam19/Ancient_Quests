import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardDef, CardId } from '../../types';

interface Props {
  card: CardDef;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  selected?: boolean;
  inDeck?: boolean;
}

// Cost badge colors
const COST_COLORS: Record<number, string> = {
  1: '#27ae60', 2: '#2980b9', 3: '#8e44ad',
  4: '#e67e22', 5: '#e74c3c', 6: '#c0392b',
};

export function CardEmoji({ card, size = 'md' }: { card: CardDef; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 44 : size === 'md' ? 60 : 80;
  const fontSize = dim * 0.55;
  const borderR = size === 'sm' ? 8 : size === 'md' ? 10 : 14;

  return (
    <View
      style={[
        styles.cardCircle,
        {
          width: dim,
          height: dim,
          borderRadius: borderR,
          backgroundColor: card.color + 'cc',
          borderColor: card.color,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize }]}>{card.emoji}</Text>
      {/* Cost pip */}
      <View style={[styles.costBadge, { backgroundColor: COST_COLORS[card.cost] ?? '#555' }]}>
        <Text style={styles.costText}>{card.cost}</Text>
      </View>
    </View>
  );
}

interface CardRowProps {
  card: CardDef;
  onPress?: () => void;
  selected?: boolean;
  inDeck?: boolean;
  rightSlot?: React.ReactNode;
}

export function CardRow({ card, onPress, selected, inDeck, rightSlot }: CardRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.cardRow,
        selected && styles.cardRowSelected,
        inDeck && styles.cardRowInDeck,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <CardEmoji card={card} size="sm" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardCategory}>{card.category.toUpperCase()}</Text>
      </View>
      {rightSlot ?? <View style={{ flex: 1 }} />}
    </TouchableOpacity>
  );
}

// Stat pills for card detail view
export function StatPill({ label, value, color = '#3a86ff' }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={[styles.statPill, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  costBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  costText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 10,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardRowSelected: {
    borderColor: '#3a86ff',
    backgroundColor: '#1a2a4e',
  },
  cardRowInDeck: {
    backgroundColor: '#1a2a3e',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardCategory: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statPill: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    gap: 2,
    minWidth: 60,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
