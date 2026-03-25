export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface Die {
  sides: 4 | 6 | 8 | 10 | 12 | 20;
}

export type DicePool = Die[];

export interface DieResult {
  sides: number;
  value: number;
}

export interface RollResult {
  dice: DieResult[];
  total: number;
}

export type RollSourceType = 'stat' | 'd20' | 'force' | 'determination' | 'weapon' | 'armor' | 'shield' | 'movement';

export type RollSource =
  | { type: 'stat'; name: string }
  | { type: 'd20' }
  | { type: 'force' }
  | { type: 'determination' }
  | { type: 'weapon' }
  | { type: 'armor' }
  | { type: 'shield' }
  | { type: 'movement' };

export interface QueuedGroup {
  source: RollSource;
  dice: Die[];
  startIndex: number;
}

export interface RollComponent {
  source: RollSource;
  dice: DieResult[];
  subtotal: number;
}

export interface RollRequest {
  groups: QueuedGroup[];
  flatDice: Die[];
}
