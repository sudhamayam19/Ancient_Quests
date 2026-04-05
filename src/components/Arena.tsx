import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, LayoutRectangle } from 'react-native';
import { GameState, CardId, Position } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, RIVER_Y, CARD_POOL } from '../constants';
import TowerView    from './TowerView';
import UnitView     from './UnitView';
import SpellView    from './SpellView';
import BuildingView from './BuildingView';
import ProjectileView from './ProjectileView';

interface Props {
  gameState: GameState;
  selectedCard: CardId | null;
  onDeploy: (pos: Position) => void;
  containerWidth: number;
  containerHeight: number;
}

// Stone color palette for arena elements
const STONE_DARK  = '#4a3f35';
const STONE_MID   = '#6b5c4c';
const STONE_LIGHT = '#8a7a68';
const STONE_FLAT  = '#5c4f42';
const RIVER_MAIN  = '#1a5f9a';
const RIVER_DARK  = '#0e3d66';
const RIVER_LIGHT = '#2980b9';

export default function Arena({
  gameState,
  selectedCard,
  onDeploy,
  containerWidth,
  containerHeight,
}: Props) {
  const scaleX = containerWidth  / ARENA_WIDTH;
  const scaleY = containerHeight / ARENA_HEIGHT;
  const riverY  = RIVER_Y * scaleY;

  const selectedDef  = selectedCard ? CARD_POOL.find((c) => c.id === selectedCard) : null;
  const spellSelected = selectedDef?.category === 'spell';

  // Capture arena's screen offset so we can convert page-absolute taps → arena coords
  const layoutRef = useRef<LayoutRectangle | null>(null);

  const onLayout = useCallback((e: any) => {
    layoutRef.current = e.nativeEvent.layout;
  }, []);

  const responderHandlers = {
    onStartShouldSetResponder: () => !!selectedCard,
    onResponderGrant: (e: any) => {
      // Use pageX/Y (screen-absolute) so deployment works regardless of flex layout nesting
      const { pageX, pageY } = e.nativeEvent;
      const layout = layoutRef.current;
      if (!layout) return;

      const arenaX = pageX - layout.x;
      const arenaY = pageY - layout.y;

      // Convert from pixel coords → arena logical coords
      const posX = arenaX / scaleX;
      const posY = arenaY / scaleY;

      if (!spellSelected && posY < RIVER_Y) return;
      onDeploy({ x: posX, y: posY });
    },
  };

  const playerCrowns = gameState.towers.filter((t) => t.team === 'enemy'  && !t.alive).length;
  const enemyCrowns  = gameState.towers.filter((t) => t.team === 'player' && !t.alive).length;

  return (
    <View
      style={[styles.arena, { width: containerWidth, height: containerHeight }]}
      onLayout={onLayout}
      {...responderHandlers}
    >
      {/* ── Arena floor layers (bottom → top) ────────────────────────────── */}

      {/* Enemy territory — darker desert sand */}
      <View style={[styles.grassEnemy, { height: riverY }]} />

      {/* Subtle enemy sand patches */}
      <View style={[styles.enemySandPatch, { top: 0,       left: containerWidth * 0.05,  width: containerWidth * 0.25, height: riverY * 0.4 }]} />
      <View style={[styles.enemySandPatch, { top: riverY * 0.5, left: containerWidth * 0.6,  width: containerWidth * 0.3,  height: riverY * 0.35 }]} />
      <View style={[styles.enemySandPatch, { top: riverY * 0.2, left: containerWidth * 0.38, width: containerWidth * 0.2,  height: riverY * 0.25 }]} />

      {/* Player territory — rich dark grass */}
      <View style={[styles.grassPlayer, { height: containerHeight - riverY, top: riverY }]} />

      {/* Subtle grass variation patches on player side */}
      <View style={[styles.playerGrassPatch, { bottom: 0,        left: containerWidth * 0.1,  width: containerWidth * 0.3,  height: (containerHeight - riverY) * 0.3 }]} />
      <View style={[styles.playerGrassPatch, { bottom: 0,        left: containerWidth * 0.55, width: containerWidth * 0.35, height: (containerHeight - riverY) * 0.25 }]} />

      {/* ── Stone border walls ─────────────────────────────────────────────── */}

      {/* Top wall */}
      <View style={[styles.wallTop, { height: 10 }]} />
      <View style={[styles.wallInnerTop, { top: 10, height: 4 }]} />

      {/* Bottom wall */}
      <View style={[styles.wallBottom, { height: 10, top: containerHeight - 10 }]} />
      <View style={[styles.wallInnerBottom, { height: 4, top: containerHeight - 14 }]} />

      {/* Left wall */}
      <View style={[styles.wallSideLeft, { width: 10 }]} />
      <View style={[styles.wallInnerLeft, { left: 10, width: 4 }]} />

      {/* Right wall */}
      <View style={[styles.wallSideRight, { width: 10, left: containerWidth - 10 }]} />
      <View style={[styles.wallInnerRight, { left: containerWidth - 14, width: 4 }]} />

      {/* ── River ─────────────────────────────────────────────────────────── */}
      <View style={[styles.river, { top: riverY - 22 }]} />
      {/* River highlight (top edge) */}
      <View style={[styles.riverHighlight, { top: riverY - 22, height: 5 }]} />
      {/* River shadow (bottom edge) */}
      <View style={[styles.riverShadow, { top: riverY + 13, height: 7 }]} />
      {/* River ripple lines */}
      <View style={[styles.riverRipple, { top: riverY - 14, left: containerWidth * 0.2 }]} />
      <View style={[styles.riverRipple, { top: riverY + 2,  left: containerWidth * 0.55 }]} />
      <View style={[styles.riverRipple, { top: riverY - 10, left: containerWidth * 0.75 }]} />

      {/* ── Vertical stone paths (lanes) ──────────────────────────────────── */}
      {/* Left lane */}
      <View style={[styles.pathStone, { left: containerWidth * 0.28 - 22, width: 44 }]} />
      <View style={[styles.pathStoneHighlight, { left: containerWidth * 0.28 - 22, width: 44 }]} />
      <View style={[styles.pathStoneDark,   { left: containerWidth * 0.28 - 22, width: 44 }]} />

      {/* Right lane */}
      <View style={[styles.pathStone, { left: containerWidth * 0.72 - 22, width: 44 }]} />
      <View style={[styles.pathStoneHighlight, { left: containerWidth * 0.72 - 22, width: 44 }]} />
      <View style={[styles.pathStoneDark,   { left: containerWidth * 0.72 - 22, width: 44 }]} />

      {/* Center dashed line */}
      <View style={[styles.centerLine, { top: riverY - 1 }]} />

      {/* ── Tower platform circles ─────────────────────────────────────────── */}
      {/* Enemy towers */}
      <View style={[styles.platform, {
        left: containerWidth / 2 - 32,
        top: ARENA_HEIGHT * 0.12 * scaleY - 32,
        width: 64, height: 64
      }]} />
      <View style={[styles.platform, {
        left: containerWidth * 0.28 - 32,
        top: ARENA_HEIGHT * 0.24 * scaleY - 32,
        width: 64, height: 64
      }]} />
      <View style={[styles.platform, {
        left: containerWidth * 0.72 - 32,
        top: ARENA_HEIGHT * 0.24 * scaleY - 32,
        width: 64, height: 64
      }]} />
      {/* Player towers */}
      <View style={[styles.platform, {
        left: containerWidth / 2 - 32,
        top: ARENA_HEIGHT * 0.88 * scaleY - 32,
        width: 64, height: 64
      }]} />
      <View style={[styles.platform, {
        left: containerWidth * 0.28 - 32,
        top: ARENA_HEIGHT * 0.76 * scaleY - 32,
        width: 64, height: 64
      }]} />
      <View style={[styles.platform, {
        left: containerWidth * 0.72 - 32,
        top: ARENA_HEIGHT * 0.76 * scaleY - 32,
        width: 64, height: 64
      }]} />

      {/* ── Decorative hieroglyph border (top & bottom edges) ──────────────── */}
      <View style={[styles.hieroglyphBorder, { top: 11 }]} pointerEvents="none">
        <Text style={styles.hieroglyphText}>𓏞𓂀𓏤𓃭𓆣𓇋𓏏𓊹𓋹𓌀𓁹𓃀𓅃𓇳𓄿𓆓𓈖𓂋𓅱𓃗𓄤</Text>
      </View>
      <View style={[styles.hieroglyphBorder, { bottom: 11 }]} pointerEvents="none">
        <Text style={styles.hieroglyphText}>𓏞𓂀𓏤𓃭𓆣𓇋𓏏𓊹𓋹𓌀𓁹𓃀𓅃𓇳𓄿𓆓𓈖𓂋𓅱𓃗𓄤</Text>
      </View>

      {/* ── Crown rows ────────────────────────────────────────────────────── */}
      <View style={[styles.crownRow, { top: 28 }]} pointerEvents="none">
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={{ fontSize: 13, opacity: i < enemyCrowns  ? 1 : 0.2 }}>👑</Text>
        ))}
      </View>
      <View style={[styles.crownRow, { bottom: 28 }]} pointerEvents="none">
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={{ fontSize: 13, opacity: i < playerCrowns ? 1 : 0.2 }}>👑</Text>
        ))}
      </View>

      {/* ── Ambient vignette overlay ──────────────────────────────────────── */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* ── Entities (back → front), all non-interactive ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {gameState.spells.map((spell) => (
          <SpellView key={spell.id} spell={spell} scaleX={scaleX} scaleY={scaleY} />
        ))}
        {gameState.buildings.map((b) => (
          <BuildingView key={b.id} building={b} scaleX={scaleX} scaleY={scaleY} />
        ))}
        {gameState.towers.map((tower) => (
          <TowerView key={tower.id} tower={tower} scaleX={scaleX} scaleY={scaleY} />
        ))}
        {gameState.units.map((unit) => (
          <UnitView key={unit.id} unit={unit} scaleX={scaleX} scaleY={scaleY} />
        ))}
        {gameState.projectiles.map((proj) => (
          <ProjectileView key={proj.id} projectile={proj} scaleX={scaleX} scaleY={scaleY} />
        ))}
      </View>

      {/* ── Drop-zone highlight ── */}
      {selectedCard && (
        <View
          pointerEvents="none"
          style={[
            styles.dropHint,
            spellSelected
              ? { top: 0, height: containerHeight, borderTopWidth: 0, borderColor: '#9b59b6', backgroundColor: 'rgba(155,89,182,0.08)' }
              : { top: riverY + 4, height: containerHeight - riverY - 4 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3d6b4f',
  },

  // ── Territory colors ──────────────────────────────────────────────────────
  grassPlayer: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: '#3a6040',
  },
  grassEnemy: {
    position: 'absolute', left: 0, right: 0, top: 0,
    backgroundColor: '#c4a265',
  },
  enemySandPatch: {
    position: 'absolute',
    backgroundColor: 'rgba(180,140,80,0.18)',
    borderRadius: 40,
  },
  playerGrassPatch: {
    position: 'absolute',
    backgroundColor: 'rgba(30,80,45,0.3)',
    borderRadius: 50,
  },

  // ── Stone walls ──────────────────────────────────────────────────────────
  wallTop: {
    position: 'absolute', left: 0, right: 0, top: 0,
    backgroundColor: STONE_DARK,
  },
  wallBottom: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: STONE_DARK,
  },
  wallInnerTop: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: STONE_LIGHT,
  },
  wallInnerBottom: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: STONE_LIGHT,
  },
  wallSideLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: STONE_DARK,
  },
  wallSideRight: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: STONE_DARK,
  },
  wallInnerLeft: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: STONE_LIGHT,
  },
  wallInnerRight: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: STONE_LIGHT,
  },

  // ── River ────────────────────────────────────────────────────────────────
  river: {
    position: 'absolute', left: 0, right: 0,
    height: 36,
    backgroundColor: RIVER_MAIN,
  },
  riverHighlight: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: RIVER_LIGHT,
    opacity: 0.5,
  },
  riverShadow: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: RIVER_DARK,
  },
  riverRipple: {
    position: 'absolute',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(100,180,255,0.3)',
    borderRadius: 2,
  },

  // ── Stone paths ──────────────────────────────────────────────────────────
  pathStone: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: STONE_FLAT,
  },
  pathStoneHighlight: {
    position: 'absolute', top: 0, height: 6,
    backgroundColor: STONE_LIGHT,
    opacity: 0.4,
  },
  pathStoneDark: {
    position: 'absolute', bottom: 0, height: 4,
    backgroundColor: STONE_DARK,
    opacity: 0.5,
  },

  // ── Center line ─────────────────────────────────────────────────────────
  centerLine: {
    position: 'absolute', left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(180,160,120,0.2)',
  },

  // ── Tower platforms ──────────────────────────────────────────────────────
  platform: {
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: STONE_FLAT,
    borderWidth: 3,
    borderColor: STONE_DARK,
    opacity: 0.55,
  },

  // ── Hieroglyph border ────────────────────────────────────────────────────
  hieroglyphBorder: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center',
  },
  hieroglyphText: {
    fontSize: 8,
    color: 'rgba(180,160,120,0.35)',
    letterSpacing: 2,
  },

  // ── Crown row ────────────────────────────────────────────────────────────
  crownRow: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, zIndex: 10,
  },

  // ── Ambient vignette ─────────────────────────────────────────────────────
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // Subtle corner darkening
    borderWidth: 20,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 4,
  },

  // ── Drop hint ────────────────────────────────────────────────────────────
  dropHint: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: 'rgba(58,134,255,0.10)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(58,134,255,0.5)',
    borderColor: 'rgba(58,134,255,0.5)',
    zIndex: 20,
  } as any,
});
