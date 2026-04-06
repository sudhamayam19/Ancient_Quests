import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CardId } from '../types';
import { CARD_POOL, RARITY_COLOR } from '../constants';
import { getUnitSprite, getBuildingSprite } from '../constants/sprites';

interface Props {
  hand: CardId[];
  nextCard: CardId;
  elixir: number;
  selectedCard: CardId | null;
  onSelectCard: (card: CardId) => void;
}

function getSprite(cardId: string) {
  const card = CARD_POOL.find((c) => c.id === cardId);
  if (!card) return null;
  if (card.category === 'unit')     return getUnitSprite(cardId);
  if (card.category === 'building') return getBuildingSprite(cardId);
  return null;
}

export default function CardHand({ hand, nextCard, elixir, selectedCard, onSelectCard }: Props) {
  const nextDef = CARD_POOL.find((c) => c.id === nextCard);
  const nextSprite = getSprite(nextCard);

  return (
    <View style={styles.container}>
      {/* Next card */}
      <View style={styles.nextWrap}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <View style={[styles.nextCard, { borderColor: nextDef?.color ?? '#888' }]}>
          {nextSprite ? (
            <Image source={nextSprite} style={styles.nextSprite} resizeMode="contain" />
          ) : (
            <Text style={styles.nextEmoji}>{nextDef?.emoji ?? '?'}</Text>
          )}
        </View>
      </View>

      {/* Hand */}
      <View style={styles.hand}>
        {hand.map((cardId, i) => {
          const def = CARD_POOL.find((c) => c.id === cardId);
          if (!def) return null;
          const canPlay    = elixir >= def.cost;
          const isSelected = selectedCard === cardId;
          const sprite     = getSprite(cardId);
          const rarityColor = RARITY_COLOR[def.rarity] ?? '#888';

          return (
            <TouchableOpacity
              key={`${cardId}-${i}`}
              onPress={() => canPlay && onSelectCard(cardId)}
              activeOpacity={canPlay ? 0.75 : 1}
              style={[
                styles.card,
                { borderColor: isSelected ? '#fff' : rarityColor },
                isSelected && styles.cardSelected,
                !canPlay && styles.cardDisabled,
              ]}
            >
              {/* Rarity strip */}
              <View style={[styles.rarityStrip, { backgroundColor: rarityColor }]} />

              {/* Art */}
              <View style={[styles.cardArt, { backgroundColor: def.color + '18' }]}>
                {sprite ? (
                  <Image source={sprite} style={styles.cardSprite} resizeMode="contain" />
                ) : (
                  <Text style={styles.cardEmoji}>{def.emoji}</Text>
                )}
              </View>

              {/* Name */}
              <Text style={styles.cardName} numberOfLines={1}>{def.name}</Text>

              {/* Cost badge */}
              <View style={[styles.costBadge, { backgroundColor: canPlay ? '#8e44ad' : '#333' }]}>
                <Text style={styles.costText}>{def.cost}</Text>
              </View>

              {/* Can't afford overlay */}
              {!canPlay && <View style={styles.lockedOverlay} />}
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
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 6,
  },
  nextWrap: { alignItems: 'center', gap: 3 },
  nextLabel: { color: '#555', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  nextCard: {
    width: 46, height: 56, borderRadius: 10,
    borderWidth: 1.5, backgroundColor: '#111428',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  nextSprite: { width: 44, height: 50 },
  nextEmoji: { fontSize: 22 },

  hand: { flex: 1, flexDirection: 'row', gap: 5, alignItems: 'flex-end' },

  card: {
    flex: 1,
    height: 92,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#111428',
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: {
    transform: [{ translateY: -10 }],
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
  },
  cardDisabled: {
    borderColor: '#333',
  },
  rarityStrip: { height: 3, width: '100%' },
  cardArt: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSprite: { width: 56, height: 56 },
  cardEmoji: { fontSize: 26 },
  cardName: {
    color: '#ccc',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  costBadge: {
    position: 'absolute',
    bottom: 18,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff4',
  },
  costText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
