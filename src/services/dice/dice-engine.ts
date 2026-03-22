import DiceBox from '@3d-dice/dice-box';
import { Die, DieResult } from '../../models/dice';

let diceBox: any = null;
let isReady = false;
let initPromise: Promise<void> | null = null;

export async function initDiceEngine(selector = '#dice-canvas'): Promise<void> {
  if (isReady) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      diceBox = new DiceBox(selector, {
        assetPath: '/assets/dice-box/',
        theme: 'default',
        scale: 15,
        gravity: 1,
        mass: 1,
        friction: 0.8,
        restitution: 0.5,
        linearDamping: 0.5,
        angularDamping: 0.4,
        settleTimeout: 5000,
      });
      await diceBox.init();
      isReady = true;
      console.log('Dice engine initialized successfully');
    } catch (err) {
      console.error('Failed to initialize dice engine:', err);
      isReady = false;
      initPromise = null;
    }
  })();

  return initPromise;
}

function fixDieValue(value: number, sides: number): number {
  // d10s can return 0 meaning 10, d20s shouldn't but handle it anyway
  if (value === 0) return sides;
  return value;
}

export async function rollDice(dice: Die[]): Promise<DieResult[]> {
  if (!diceBox || !isReady) {
    throw new Error('Dice engine not initialized');
  }

  // dice-box accepts an array of notation strings like ['1d20', '1d8', '1d6']
  const notation = dice.map((d) => `1d${d.sides}`);

  try {
    // roll() returns a promise with results
    const results = await diceBox.roll(notation);

    const mapped: DieResult[] = results.map((r: any) => ({
      sides: r.sides,
      value: fixDieValue(r.value, r.sides),
    }));
    return mapped;
  } catch (err) {
    console.error('3D roll failed, using fallback:', err);
    return rollDiceFallback(dice);
  }
}

export function clearDice(): void {
  if (diceBox && isReady) {
    diceBox.clear();
  }
}

export function isDiceReady(): boolean {
  return isReady;
}

// Fallback random roller for when 3D is not available
export function rollDiceFallback(dice: Die[]): DieResult[] {
  return dice.map((d) => ({
    sides: d.sides,
    value: Math.floor(Math.random() * d.sides) + 1,
  }));
}
