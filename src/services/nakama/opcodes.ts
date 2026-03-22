export const OpCode = {
  // Roll log
  ROLL_RESULT: 1,

  // Combat
  COMBAT_ATTACK: 10,
  COMBAT_DEFENSE: 11,
  COMBAT_DAMAGE: 12,

  // Character sync
  CHAR_UPDATED: 20,
  ENERGY_CHANGED: 21,

  // Episode
  NEW_EPISODE: 30,
  LEVEL_UP_START: 31,
  LEVEL_UP_END: 32,

  // GM actions
  AWARD_DETERMINATION: 40,
  AWARD_FORCE: 41,

  // Session management
  MEMBER_ROLES: 50,
  SESSION_STATE: 51,
} as const;

export type OpCodeType = (typeof OpCode)[keyof typeof OpCode];
