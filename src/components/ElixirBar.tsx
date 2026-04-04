import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ELIXIR_MAX } from '../constants';

interface Props {
  elixir: number;
}

export default function ElixirBar({ elixir }: Props) {
  const whole = Math.floor(elixir);
  return (
    <View style={styles.container}>
      <Text style={styles.dropIcon}>💧</Text>
      <View style={styles.pips}>
        {Array.from({ length: ELIXIR_MAX }, (_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              {
                backgroundColor:
                  i < whole
                    ? '#9b59b6'
                    : i < elixir
                    ? 'rgba(155,89,182,0.45)'
                    : '#1a1a2e',
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.count}>{whole}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  dropIcon: {
    fontSize: 18,
  },
  pips: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  pip: {
    flex: 1,
    height: 14,
    borderRadius: 3,
  },
  count: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    minWidth: 22,
    textAlign: 'right',
  },
});
