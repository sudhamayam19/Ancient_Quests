const UNIT_SPRITES: Record<string, any> = {
  shaman:          require('../../assets/sprites/shaman.png'),
  blade_dancer:    require('../../assets/sprites/blade_dancer.png'),
  berserker:       require('../../assets/sprites/berserker.png'),
  oracle:          require('../../assets/sprites/oracle.png'),
  stone_colossus:  require('../../assets/sprites/stone_colossus.png'),
  sand_wraith:     require('../../assets/sprites/sand_wraith.png'),
  pharaoh_guard:   require('../../assets/sprites/pharaoh_guard.png'),
  princess_archer: require('../../assets/sprites/princess_archer.png'),
};

const BUILDING_SPRITES: Record<string, any> = {
  burial_chamber: require('../../assets/sprites/burial_chamber.png'),
  obelisk:        require('../../assets/sprites/obelisk.png'),
  inferno_trap:   require('../../assets/sprites/inferno_trap.png'),
};

export function getUnitSprite(type: string): any | null {
  return UNIT_SPRITES[type] ?? null;
}

export function getBuildingSprite(type: string): any | null {
  return BUILDING_SPRITES[type] ?? null;
}
