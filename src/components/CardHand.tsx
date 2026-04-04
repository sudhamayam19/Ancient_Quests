import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { UnitType } from '../types';
import { CARD_POOL } from '../constants';

interface Props {
  hand: UnitType[];
  nextCard: UnitType;
  elixir: number;
  selectedCard: UnitType | null;
  onSelectCard: (card: UnitType) => void;
}

export default function CardHand({
  hand,
  nextCard,
  elixir,
  selectedCard,
  onSelectCard,
}: Props) {
  const nextDef = CARD_POOL.find((c) => c.id === nextCard);

  return (
    <View style={styles.container}>
      {/* Next card preview */}
      <View style={styles.nextWrap}>
        <Text style={styles.nextLabel}>Next</Text>
        <View style={[styles.nextCard, { borderColor: nextDef?.color ?? '#888' }]}>
          <Text style={styles.nextEmoji}>{nextDef?.emoji ?? '?'}</Text>
        </View>
      </View>

      {/* Hand */}
      <View style={styles.hand}>
        {hand.map((cardId, i) => {
          const def = CARD_POOL.find((c) => c.id === cardId);
          if (!def) return null;
          const canPlay = elixir >= def.cost;
          const isSelected = selectedCard === cardId;

          return (
            <TouchableOpacity
              key={`${cardId}-${i}`}
              onPress={() => canPlay && onSelectCard(cardId)}
              activeOpacity={canPlay ? 0.7 : 1}
              style={[
                styles.card,
                {
                  borderColor: isSelected ? '#fff' : def.color,
                  backgroundColor: isSelected ? def.color : '#1a1a2e',
                  opacity: canPlay ? 1 : 0.45,
                  transform: isSelected ? [{ scale: 1.1 }] : [],
                },
              ]}
            >
              <Text style={styles.cardEmoji}>{def.emoji}</Text>
              <Text style={styles.cardName}>{def.name}</Text>
              <View
                style={[
                  styles.costBadge,
                  { backgroundColor: canPlay ? '#9b59b6' : '#555' },
                ]}
              >
                <Text style={styles.costText}>{def.cost}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  nextWrap: {
    alignItems: 'center',
    gap: 2,
  },
  nextLabel: {
    color: '#aaa',
    fontSize: 9,
    fontWeight: '600',
  },
  nextCard: {
    width: 44,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextEmoji: {
    fontSize: 22,
  },
  hand: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  card: {
    flex: 1,
    height: 72,
    borderRadius: 10,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardName: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  costBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});
