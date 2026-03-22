import { RollComponent, RollSource } from './dice';

export interface RollLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  characterName: string;
  components: RollComponent[];
  total: number;
  formatted: string;
  purpose?: 'attack' | 'defense' | 'check' | 'damage_applied' | 'general';
  meta?: {
    attackRollId?: string;
    damageDealt?: number;
    targetCharacterId?: string;
    targetCharacterName?: string;
  };
}

export function sourceLabel(source: RollSource): string {
  switch (source.type) {
    case 'd20': return 'd20';
    case 'stat': return source.name;
    case 'force': return 'Force';
    case 'determination': return 'Determination';
    case 'weapon': return 'Weapon';
    case 'armor': return 'Armor';
    case 'shield': return 'Shield';
  }
}
