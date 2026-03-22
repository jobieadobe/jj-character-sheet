export interface CombatResult {
  attackTotal: number;
  defenseTotal: number;
  damage: number;
}

export function resolveCombat(attackTotal: number, defenseTotal: number): CombatResult {
  const damage = Math.max(0, attackTotal - defenseTotal);
  return {
    attackTotal,
    defenseTotal,
    damage,
  };
}
