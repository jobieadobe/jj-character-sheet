import React, { useState, useCallback } from 'react';
import { IonButton, IonChip, IonLabel, IonIcon, IonBadge } from '@ionic/react';
import { diceOutline, closeCircle } from 'ionicons/icons';
import { Die, QueuedGroup, RollSource, RollComponent, DieResult } from '../../models/dice';
import { Character, StatName, STAT_NAMES } from '../../models/character';
import { assignGroups } from '../../utils/dice-notation';
import { mapResultsToComponents } from '../../utils/dice-notation';
import { formatRollResult } from '../../utils/format-roll';
import { rollDice, rollDiceFallback, isDiceReady, clearDice } from '../../services/dice/dice-engine';
import { STAT_COLORS, FORCE_COLOR, DETERMINATION_COLOR, D20_COLOR } from '../../utils/constants';

interface RollBuilderProps {
  character: Character;
  onRollComplete: (components: RollComponent[], total: number, formatted: string) => void;
  onRollStart?: () => void;
  username: string;
}

interface QueueItem {
  source: RollSource;
  dice: Die[];
  label: string;
  color: string;
}

const RollBuilder: React.FC<RollBuilderProps> = ({ character, onRollComplete, onRollStart, username }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [rolling, setRolling] = useState(false);
  const [showAttackType, setShowAttackType] = useState(false);

  const addToQueue = useCallback((item: QueueItem) => {
    setQueue((prev) => [...prev, item]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const addD20 = () => {
    addToQueue({
      source: { type: 'd20' },
      dice: [{ sides: 20 }],
      label: 'd20',
      color: D20_COLOR,
    });
  };

  const addStat = (name: StatName) => {
    const dice = character.stats[name];
    if (dice.length === 0) return;
    const diceLabel = dice.map((d) => `d${d.sides}`).join('+');
    addToQueue({
      source: { type: 'stat', name },
      dice: [...dice],
      label: `${name} (${diceLabel})`,
      color: STAT_COLORS[name],
    });
  };

  const addForce = () => {
    if (character.forceDice <= 0) return;
    // Add one force die at a time
    const currentForceCount = queue.filter((q) => q.source.type === 'force').length;
    if (currentForceCount >= character.forceDice) return;
    addToQueue({
      source: { type: 'force' },
      dice: [{ sides: 8 }],
      label: 'Force (d8)',
      color: FORCE_COLOR,
    });
  };

  const addDetermination = () => {
    if (character.determinationDice <= 0) return;
    const currentDetCount = queue.filter((q) => q.source.type === 'determination').length;
    if (currentDetCount >= character.determinationDice) return;
    addToQueue({
      source: { type: 'determination' },
      dice: [{ sides: 4 }],
      label: 'Determination (d4)',
      color: DETERMINATION_COLOR,
    });
  };

  const addWeapon = () => {
    if (!character.equipment.weapon) return;
    const dice = character.equipment.weapon.dice;
    const diceLabel = dice.map((d) => `d${d.sides}`).join('+');
    addToQueue({
      source: { type: 'weapon' },
      dice: [...dice],
      label: `${character.equipment.weapon.name} (${diceLabel})`,
      color: '#e67e22',
    });
  };

  const addArmor = () => {
    if (!character.equipment.armor) return;
    const dice = character.equipment.armor.dice;
    const diceLabel = dice.map((d) => `d${d.sides}`).join('+');
    addToQueue({
      source: { type: 'armor' },
      dice: [...dice],
      label: `${character.equipment.armor.name} (${diceLabel})`,
      color: '#7f8c8d',
    });
  };

  const addShield = () => {
    if (!character.equipment.shield) return;
    const dice = character.equipment.shield.dice;
    const diceLabel = dice.map((d) => `d${d.sides}`).join('+');
    addToQueue({
      source: { type: 'shield' },
      dice: [...dice],
      label: `${character.equipment.shield.name} (${diceLabel})`,
      color: '#2c3e50',
    });
  };

  const handleRoll = async () => {
    if (queue.length === 0 || rolling) return;
    setRolling(true);

    try {
      const groups = assignGroups(queue.map((q) => ({ source: q.source, dice: q.dice })));
      const flatDice = groups.flatMap((g) => g.dice);

      let results: DieResult[];
      if (isDiceReady()) {
        clearDice();
        onRollStart?.();
        results = await rollDice(flatDice);
      } else {
        results = rollDiceFallback(flatDice);
      }

      const components = mapResultsToComponents(groups, results);
      const total = components.reduce((sum, c) => sum + c.subtotal, 0);
      const formatted = formatRollResult(username, character.name, components, total);

      onRollComplete(components, total, formatted);
      clearQueue();
    } catch (err) {
      console.error('Roll failed:', err);
      // Fallback roll
      const groups = assignGroups(queue.map((q) => ({ source: q.source, dice: q.dice })));
      const flatDice = groups.flatMap((g) => g.dice);
      const results = rollDiceFallback(flatDice);
      const components = mapResultsToComponents(groups, results);
      const total = components.reduce((sum, c) => sum + c.subtotal, 0);
      const formatted = formatRollResult(username, character.name, components, total);
      onRollComplete(components, total, formatted);
      clearQueue();
    } finally {
      setRolling(false);
    }
  };

  const attackMelee = () => {
    const items: QueueItem[] = [];
    const strDice = character.stats.STR;
    if (strDice.length > 0) {
      items.push({
        source: { type: 'stat', name: 'STR' },
        dice: [...strDice],
        label: `STR (${strDice.map((d) => `d${d.sides}`).join('+')})`,
        color: STAT_COLORS.STR,
      });
    }
    if (character.equipment.weapon) {
      const wpn = character.equipment.weapon;
      items.push({
        source: { type: 'weapon' },
        dice: [...wpn.dice],
        label: `${wpn.name} (${wpn.dice.map((d) => `d${d.sides}`).join('+')})`,
        color: '#e67e22',
      });
    }
    setQueue(items);
    setShowAttackType(false);
  };

  const attackRanged = () => {
    const items: QueueItem[] = [];
    const dexDice = character.stats.DEX;
    if (dexDice.length > 0) {
      items.push({
        source: { type: 'stat', name: 'DEX' },
        dice: [...dexDice],
        label: `DEX (${dexDice.map((d) => `d${d.sides}`).join('+')})`,
        color: STAT_COLORS.DEX,
      });
    }
    if (character.equipment.weapon) {
      const wpn = character.equipment.weapon;
      items.push({
        source: { type: 'weapon' },
        dice: [...wpn.dice],
        label: `${wpn.name} (${wpn.dice.map((d) => `d${d.sides}`).join('+')})`,
        color: '#e67e22',
      });
    }
    setQueue(items);
    setShowAttackType(false);
  };

  const defense = () => {
    const items: QueueItem[] = [];
    const conDice = character.stats.CON;
    if (conDice.length > 0) {
      items.push({
        source: { type: 'stat', name: 'CON' },
        dice: [...conDice],
        label: `CON (${conDice.map((d) => `d${d.sides}`).join('+')})`,
        color: STAT_COLORS.CON,
      });
    }
    if (character.equipment.armor) {
      const arm = character.equipment.armor;
      items.push({
        source: { type: 'armor' },
        dice: [...arm.dice],
        label: `${arm.name} (${arm.dice.map((d) => `d${d.sides}`).join('+')})`,
        color: '#7f8c8d',
      });
    }
    if (character.equipment.shield) {
      const shd = character.equipment.shield;
      items.push({
        source: { type: 'shield' },
        dice: [...shd.dice],
        label: `${shd.name} (${shd.dice.map((d) => `d${d.sides}`).join('+')})`,
        color: '#2c3e50',
      });
    }
    setQueue(items);
  };

  const forceUsed = queue.filter((q) => q.source.type === 'force').length;
  const detUsed = queue.filter((q) => q.source.type === 'determination').length;

  return (
    <div style={{ padding: '8px' }}>
      {/* Quick action buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, position: 'relative' }}>
        <IonButton
          size="small"
          onClick={() => setShowAttackType(!showAttackType)}
          style={{ '--background': '#c0392b', flex: 1 } as any}
        >
          Attack
        </IonButton>
        <IonButton
          size="small"
          onClick={defense}
          style={{ '--background': '#27ae60', flex: 1 } as any}
        >
          Defense
        </IonButton>
      </div>

      {/* Attack type selection */}
      {showAttackType && (
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 8,
          background: '#2c1010',
          borderRadius: 8,
          padding: 8,
          border: '1px solid #c0392b',
        }}>
          <IonButton
            size="small"
            expand="block"
            onClick={attackMelee}
            style={{ flex: 1, '--background': '#e74c3c' } as any}
          >
            Melee (STR)
          </IonButton>
          <IonButton
            size="small"
            expand="block"
            onClick={attackRanged}
            style={{ flex: 1, '--background': '#2ecc71' } as any}
          >
            Ranged / Finesse (DEX)
          </IonButton>
        </div>
      )}

      {/* Dice selection buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <IonChip
          onClick={addD20}
          style={{ '--background': '#333', '--color': '#fff', cursor: 'pointer' } as any}
        >
          <IonIcon icon={diceOutline} />
          <IonLabel>d20</IonLabel>
        </IonChip>

        {STAT_NAMES.map((stat) => (
          <IonChip
            key={stat}
            onClick={() => addStat(stat)}
            style={{
              '--background': STAT_COLORS[stat],
              '--color': '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            } as any}
          >
            <IonLabel>{stat}</IonLabel>
          </IonChip>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {character.equipment.weapon && (
          <IonChip onClick={addWeapon} style={{ '--background': '#e67e22', '--color': '#fff', cursor: 'pointer' } as any}>
            <IonLabel>{character.equipment.weapon.name}</IonLabel>
          </IonChip>
        )}
        {character.equipment.armor && (
          <IonChip onClick={addArmor} style={{ '--background': '#7f8c8d', '--color': '#fff', cursor: 'pointer' } as any}>
            <IonLabel>{character.equipment.armor.name}</IonLabel>
          </IonChip>
        )}
        {character.equipment.shield && (
          <IonChip onClick={addShield} style={{ '--background': '#2c3e50', '--color': '#fff', cursor: 'pointer' } as any}>
            <IonLabel>{character.equipment.shield.name}</IonLabel>
          </IonChip>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <IonChip
          onClick={addForce}
          disabled={forceUsed >= character.forceDice}
          style={{ '--background': FORCE_COLOR, '--color': '#fff', cursor: 'pointer' } as any}
        >
          <IonLabel>Force d8</IonLabel>
          <IonBadge color="light">{character.forceDice - forceUsed}</IonBadge>
        </IonChip>
        <IonChip
          onClick={addDetermination}
          disabled={detUsed >= character.determinationDice}
          style={{ '--background': DETERMINATION_COLOR, '--color': '#fff', cursor: 'pointer' } as any}
        >
          <IonLabel>Determination d4</IonLabel>
          <IonBadge color="light">{character.determinationDice - detUsed}</IonBadge>
        </IonChip>
      </div>

      {/* Queue display */}
      {queue.length > 0 && (
        <div style={{
          background: '#0f3460',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 8,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 4,
        }}>
          {queue.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#aaa', margin: '0 2px' }}>+</span>}
              <IonChip
                onClick={() => removeFromQueue(i)}
                style={{ '--background': item.color, '--color': '#fff', cursor: 'pointer' } as any}
              >
                <IonLabel>{item.label}</IonLabel>
                <IonIcon icon={closeCircle} />
              </IonChip>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Roll and Clear buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <IonButton
          expand="block"
          onClick={handleRoll}
          disabled={queue.length === 0 || rolling}
          style={{ flex: 1, '--background': '#e94560' } as any}
          size="large"
        >
          {rolling ? 'Rolling...' : 'ROLL'}
        </IonButton>
        {queue.length > 0 && (
          <IonButton fill="outline" onClick={clearQueue} color="medium">
            Clear
          </IonButton>
        )}
      </div>
    </div>
  );
};

export default RollBuilder;
