import { DicePool } from './dice';

export type StatName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export const STAT_NAMES: StatName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const STAT_SKILLS: Record<StatName, string[]> = {
  STR: ['Athletics'],
  DEX: ['Acrobatics', 'Piloting', 'Sneaking'],
  CON: ['Survival', 'Nature', 'Mechanics'],
  INT: ['Investigation', 'Engineering', 'Lore', 'Technology'],
  WIS: ['Animals', 'Insight', 'Medicine', 'Perception'],
  CHA: ['Deception', 'Intimidation', 'Performance'],
};

export interface Stats {
  STR: DicePool;
  DEX: DicePool;
  CON: DicePool;
  INT: DicePool;
  WIS: DicePool;
  CHA: DicePool;
}

export interface EquipmentItem {
  name: string;
  dice: DicePool;
}

export interface Equipment {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  shield: EquipmentItem | null;
  spikedShield: boolean;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  className: string;
  race: string;
  flaw: string;
  speciesAbilities: string;
  description: string;
  strengths: string[];
  passives: string[];
  stats: Stats;
  equipment: Equipment;
  energy: number;
  energyMax: number;
  forceDice: number;        // count of d8s available this episode
  determinationDice: number; // count of d4s available
  xp: number;
  level: number;
  movementSpeed: DicePool;
  isNpc: boolean;
  createdBy: string;
}

export function createDefaultCharacter(userId: string, name: string): Character {
  const defaultPool: DicePool = [{ sides: 6 }];
  return {
    id: crypto.randomUUID(),
    userId,
    name,
    className: '',
    race: '',
    flaw: '',
    speciesAbilities: '',
    description: '',
    strengths: [],
    passives: [],
    stats: {
      STR: [...defaultPool],
      DEX: [...defaultPool],
      CON: [...defaultPool],
      INT: [...defaultPool],
      WIS: [...defaultPool],
      CHA: [...defaultPool],
    },
    equipment: {
      weapon: null,
      armor: null,
      shield: null,
      spikedShield: false,
    },
    energy: 20,
    energyMax: 20,
    forceDice: 1,
    determinationDice: 0,
    xp: 0,
    level: 1,
    movementSpeed: [{ sides: 6 }],
    isNpc: false,
    createdBy: userId,
  };
}
