import { StatName } from '../models/character';

export const DIE_SIZES = [4, 6, 8, 10, 12, 20] as const;

export const STAT_COLORS: Record<StatName, string> = {
  STR: '#e74c3c',
  DEX: '#2ecc71',
  CON: '#f39c12',
  INT: '#3498db',
  WIS: '#9b59b6',
  CHA: '#e91e63',
};

export const FORCE_COLOR = '#00bcd4';
export const DETERMINATION_COLOR = '#ff9800';
export const D20_COLOR = '#ffffff';
