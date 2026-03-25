import { RollComponent } from '../models/dice';
import { sourceLabel } from '../models/log';

export function formatRollResult(
  username: string,
  characterName: string,
  components: RollComponent[],
  total: number,
  race?: string,
  className?: string
): string {
  const parts = components.map((comp) => {
    const label = sourceLabel(comp.source);
    if (comp.dice.length === 1) {
      return `${label}(${comp.dice[0].value})`;
    }
    const values = comp.dice.map((d) => d.value).join('+');
    return `${label}(${values}=${comp.subtotal})`;
  });

  let displayName = characterName || username;
  const details: string[] = [];
  if (race) details.push(race);
  if (className) details.push(className);
  if (details.length > 0) {
    displayName += ` (${details.join(' ')})`;
  }

  return `${displayName} rolled ${parts.join(' + ')} = ${total}`;
}
