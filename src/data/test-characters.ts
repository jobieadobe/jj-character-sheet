import { Character, createDefaultCharacter } from '../models/character';

export function createTestCharacters(userId: string): Character[] {
  // Character 1: Stalwart Tank
  const tank = createDefaultCharacter(userId, 'Krox Ironhide');
  tank.className = 'Stalwart';
  tank.race = 'Whiphid';
  tank.flaw = 'Indecision';
  tank.speciesAbilities = 'Healing coma when incapacitated';
  tank.description = 'A hulking Whiphid who protects allies with an impenetrable wall of steel and fury.';
  tank.strengths = ['Survival', 'Nature', 'Mechanics'];
  tank.passives = [
    'VIBROSHIELD (PASSIVE): When an enemy makes a melee attack against you they take damage equal to your SHIELD dice roll.',
    'BULWARK OF PROTECTION (PASSIVE): When an ally within CLOSE range is targeted by an attack, you can use your shield to intercept.',
    'TAUNT (BONUS): Choose one enemy, it must spend its next turn trying to attack you.',
  ];
  tank.stats = {
    STR: [{ sides: 8 }, { sides: 6 }],
    DEX: [{ sides: 6 }],
    CON: [{ sides: 10 }],
    INT: [{ sides: 6 }],
    WIS: [{ sides: 8 }],
    CHA: [{ sides: 6 }, { sides: 4 }],
  };
  tank.equipment = {
    weapon: { name: 'Vibrosword', dice: [{ sides: 10 }] },
    armor: { name: 'Power Suit', dice: [{ sides: 8 }] },
    shield: { name: 'Vibroshield', dice: [{ sides: 4 }] },
    spikedShield: true,
  };
  tank.energyMax = 30;
  tank.energy = 30;
  tank.forceDice = 2;
  tank.determinationDice = 1;
  tank.movementSpeed = [{ sides: 6 }];

  // Character 2: Sniper / Ranged DPS
  const sniper = createDefaultCharacter(userId, 'Vex Shadowstrike');
  sniper.className = 'Sharpshooter';
  sniper.race = 'Chiss';
  sniper.flaw = 'Overconfidence';
  sniper.speciesAbilities = 'Infrared vision — can see in complete darkness';
  sniper.description = 'A cool-headed Chiss marksman who never misses — or so they claim.';
  sniper.strengths = ['Perception', 'Sneaking', 'Piloting'];
  sniper.passives = [
    'STEADY AIM (PASSIVE): +1d4 to ranged attacks when you haven\'t moved this turn.',
    'EVASIVE ROLL (BONUS): Move to CLOSE range and avoid one attack of opportunity.',
    'CALLED SHOT (ACTION): Sacrifice 1 Force die to target a weak point. If hit, roll weapon dice twice.',
  ];
  sniper.stats = {
    STR: [{ sides: 4 }],
    DEX: [{ sides: 10 }, { sides: 6 }],
    CON: [{ sides: 6 }],
    INT: [{ sides: 8 }],
    WIS: [{ sides: 8 }],
    CHA: [{ sides: 6 }],
  };
  sniper.equipment = {
    weapon: { name: 'Sniper Blaster', dice: [{ sides: 12 }] },
    armor: { name: 'Scout Armor', dice: [{ sides: 6 }] },
    shield: null,
    spikedShield: false,
  };
  sniper.energyMax = 20;
  sniper.energy = 20;
  sniper.forceDice = 1;
  sniper.determinationDice = 0;
  sniper.movementSpeed = [{ sides: 8 }];

  // Character 3: Force User / Support
  const mage = createDefaultCharacter(userId, 'Ashara Windsong');
  mage.className = 'Mystic';
  mage.race = 'Twi\'lek';
  mage.flaw = 'Compassion (won\'t leave allies behind)';
  mage.speciesAbilities = 'Pheromone influence — advantage on CHA checks vs humanoids';
  mage.description = 'A Twi\'lek Force-sensitive who channels the Living Force to heal and protect.';
  mage.strengths = ['Medicine', 'Insight', 'Performance'];
  mage.passives = [
    'FORCE HEAL (ACTION): Spend 1 Force die to restore 1d8 energy to an ally within CLOSE range.',
    'FORCE BARRIER (BONUS): Spend 1 Force die to grant an ally +1d8 to their next defense roll.',
    'EMPATHIC BOND (PASSIVE): You sense when allies within FAR range drop below half energy.',
  ];
  mage.stats = {
    STR: [{ sides: 4 }],
    DEX: [{ sides: 6 }],
    CON: [{ sides: 6 }],
    INT: [{ sides: 8 }],
    WIS: [{ sides: 10 }, { sides: 6 }],
    CHA: [{ sides: 10 }],
  };
  mage.equipment = {
    weapon: { name: 'Force Staff', dice: [{ sides: 6 }] },
    armor: { name: 'Mystic Robes', dice: [{ sides: 4 }] },
    shield: null,
    spikedShield: false,
  };
  mage.energyMax = 22;
  mage.energy = 22;
  mage.forceDice = 4;
  mage.determinationDice = 0;
  mage.movementSpeed = [{ sides: 6 }];

  // Character 4: Melee DPS / Rogue
  const rogue = createDefaultCharacter(userId, 'Rix Dagger');
  rogue.className = 'Scoundrel';
  rogue.race = 'Rodian';
  rogue.flaw = 'Greed (can\'t resist shiny things)';
  rogue.speciesAbilities = 'Thermal vision — can track warm-blooded creatures through walls';
  rogue.description = 'A fast-talking Rodian who fights dirty and always has an escape plan.';
  rogue.strengths = ['Deception', 'Sneaking', 'Acrobatics'];
  rogue.passives = [
    'SNEAK ATTACK (PASSIVE): When attacking an enemy that hasn\'t acted yet or is engaged with an ally, add +1d8 damage.',
    'DIRTY TRICK (BONUS): Blind, trip, or disarm a target within CLOSE range (WIS save to resist).',
    'SLIPPERY (PASSIVE): Attacks of opportunity against you have disadvantage.',
  ];
  rogue.stats = {
    STR: [{ sides: 6 }],
    DEX: [{ sides: 10 }, { sides: 8 }],
    CON: [{ sides: 6 }],
    INT: [{ sides: 6 }],
    WIS: [{ sides: 6 }],
    CHA: [{ sides: 8 }],
  };
  rogue.equipment = {
    weapon: { name: 'Vibroblade', dice: [{ sides: 8 }] },
    armor: { name: 'Stealth Suit', dice: [{ sides: 6 }] },
    shield: null,
    spikedShield: false,
  };
  rogue.energyMax = 18;
  rogue.energy = 18;
  rogue.forceDice = 1;
  rogue.determinationDice = 0;
  rogue.movementSpeed = [{ sides: 8 }, { sides: 4 }];

  return [tank, sniper, mage, rogue];
}
