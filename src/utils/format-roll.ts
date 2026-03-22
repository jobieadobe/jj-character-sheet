import { RollComponent } from '../models/dice';
import { sourceLabel } from '../models/log';

export function formatRollResult(
  username: string,
  characterName: string,
  components: RollComponent[],
  total: number
): string {
  const parts = components.map((comp) => {
    const label = sourceLabel(comp.source);
    if (comp.dice.length === 1) {
      return `${label}(${comp.dice[0].value})`;
    }
    const values = comp.dice.map((d) => d.value).join('+');
    return `${label}(${values}=${comp.subtotal})`;
  });

  const displayName = characterName || username;
  return `${displayName} rolled ${parts.join(' + ')} = ${total}`;
}
