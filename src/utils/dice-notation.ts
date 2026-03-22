import { Die, DicePool, QueuedGroup, RollSource, RollComponent, DieResult } from '../models/dice';

export function buildRollRequest(groups: QueuedGroup[]): Die[] {
  const flat: Die[] = [];
  for (const group of groups) {
    for (const die of group.dice) {
      flat.push(die);
    }
  }
  return flat;
}

export function assignGroups(sources: { source: RollSource; dice: Die[] }[]): QueuedGroup[] {
  let index = 0;
  return sources.map((s) => {
    const group: QueuedGroup = {
      source: s.source,
      dice: s.dice,
      startIndex: index,
    };
    index += s.dice.length;
    return group;
  });
}

export function mapResultsToComponents(
  groups: QueuedGroup[],
  flatResults: DieResult[]
): RollComponent[] {
  return groups.map((group) => {
    const dice = flatResults.slice(group.startIndex, group.startIndex + group.dice.length);
    const subtotal = dice.reduce((sum, d) => sum + d.value, 0);
    return {
      source: group.source,
      dice,
      subtotal,
    };
  });
}
