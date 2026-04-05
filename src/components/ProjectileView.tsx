import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Projectile } from '../types';

interface Props {
  projectile: Projectile;
  scaleX: number;
  scaleY: number;
}

// Interpolate between two positions given progress 0..1
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ProjectileView({ projectile, scaleX, scaleY }: Props) {
  const sx = lerp(projectile.from.x, projectile.to.x, projectile.progress) * scaleX;
  const sy = lerp(projectile.from.y, projectile.to.y, projectile.progress) * scaleY;

  const teamColor = projectile.team === 'player' ? '#4a9eff' : '#ff4a4a';
  const glowColor = projectile.team === 'player' ? 'rgba(74,158,255,0.6)' : 'rgba(255,74,74,0.6)';

  const radius = 6 * Math.min(scaleX, scaleY);

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, { left: sx - radius * 4, top: sy - radius * 4 }]} pointerEvents="none">
      {/* Outer glow */}
      <View
        style={[
          styles.glow,
          {
            left: radius * 4 - radius * 2.5,
            top: radius * 4 - radius * 2.5,
            width: radius * 5,
            height: radius * 5,
            borderRadius: radius * 2.5,
            backgroundColor: glowColor,
          },
        ]}
      />
      {/* Core orb */}
      <View
        style={[
          styles.orb,
          {
            left: radius * 4 - radius,
            top: radius * 4 - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: projectile.color,
            borderColor: teamColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
  },
  orb: {
    position: 'absolute',
    borderWidth: 1.5,
  },
});
