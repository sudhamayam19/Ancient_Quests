import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Projectile } from '../types';

interface Props {
  projectile: Projectile;
  scaleX: number;
  scaleY: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getAngle(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

export default function ProjectileView({ projectile, scaleX, scaleY }: Props) {
  if (projectile.isPiercingArrow) {
    return <PiercingArrowView projectile={projectile} scaleX={scaleX} scaleY={scaleY} />;
  }
  return <NormalProjectile projectile={projectile} scaleX={scaleX} scaleY={scaleY} />;
}

function NormalProjectile({ projectile, scaleX, scaleY }: Props) {
  const sx = lerp(projectile.from.x, projectile.to.x, projectile.progress) * scaleX;
  const sy = lerp(projectile.from.y, projectile.to.y, projectile.progress) * scaleY;
  const teamColor = projectile.team === 'player' ? '#4a9eff' : '#ff4a4a';
  const glowColor = projectile.team === 'player' ? 'rgba(74,158,255,0.6)' : 'rgba(255,74,74,0.6)';
  const radius = 6 * Math.min(scaleX, scaleY);

  return (
    <View style={[styles.container, { left: sx - radius * 4, top: sy - radius * 4 }]} pointerEvents="none">
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

function PiercingArrowView({ projectile, scaleX, scaleY }: Props) {
  const fromX = projectile.from.x * scaleX;
  const fromY = projectile.from.y * scaleY;
  const toX   = projectile.to.x * scaleX;
  const toY   = projectile.to.y * scaleY;
  const angle  = getAngle(projectile.from, projectile.to);

  // Current head position along the path
  const headX = lerp(fromX, toX, projectile.progress);
  const headY = lerp(fromY, toY, projectile.progress);

  // Trail length scales with arena height
  const trailLen = 50 * Math.min(scaleX, scaleY);
  const arrowLen  = 30 * Math.min(scaleX, scaleY);

  const teamColor = projectile.team === 'player' ? '#4a9eff' : '#ff4a4a';

  // Trail fades behind the head
  const opacity = 0.3 + projectile.progress * 0.7;

  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="none">
      {/* Trail — long neon green line */}
      <View
        style={{
          position: 'absolute',
          left: headX - trailLen,
          top: headY - 3,
          width: trailLen,
          height: 6,
          backgroundColor: '#39ff14',
          opacity: opacity * 0.6,
          borderRadius: 3,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'right center',
        }}
      />

      {/* Bright core trail */}
      <View
        style={{
          position: 'absolute',
          left: headX - trailLen * 0.6,
          top: headY - 1.5,
          width: trailLen * 0.6,
          height: 3,
          backgroundColor: '#adff2f',
          opacity: opacity,
          borderRadius: 2,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'right center',
        }}
      />

      {/* Arrowhead — glowing triangle */}
      <View
        style={{
          position: 'absolute',
          left: headX - arrowLen / 2,
          top: headY - arrowLen / 2,
          width: arrowLen,
          height: arrowLen,
          backgroundColor: '#39ff14',
          opacity,
          borderRadius: 2,
          transform: [{ rotate: `${angle}deg` }],
          shadowColor: '#39ff14',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 12,
        }}
      />

      {/* Arrowhead inner bright point */}
      <View
        style={{
          position: 'absolute',
          left: headX - arrowLen * 0.3,
          top: headY - arrowLen * 0.25,
          width: arrowLen * 0.6,
          height: arrowLen * 0.5,
          backgroundColor: '#ffff00',
          opacity: opacity * 0.9,
          borderRadius: 1,
          transform: [{ rotate: `${angle}deg` }],
        }}
      />

      {/* Impact flash at the front */}
      <View
        style={{
          position: 'absolute',
          left: headX - 10,
          top: headY - 10,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'rgba(57,255,20,0.3)',
          opacity: opacity * 0.5,
        }}
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
