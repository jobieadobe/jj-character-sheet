import React from 'react';
import { IonIcon } from '@ionic/react';
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { DicePool, Die } from '../../models/dice';

const SIDES_OPTIONS: Die['sides'][] = [4, 6, 8, 10, 12, 20];

interface DicePoolEditorProps {
  pool: DicePool;
  onChange: (pool: DicePool) => void;
  color?: string;
}

const DicePoolEditor: React.FC<DicePoolEditorProps> = ({ pool, onChange, color = '#e94560' }) => {
  const addDie = (sides: Die['sides']) => {
    onChange([...pool, { sides }]);
  };

  const removeDie = (index: number) => {
    onChange(pool.filter((_, i) => i !== index));
  };

  const changeDie = (index: number, sides: Die['sides']) => {
    const next = [...pool];
    next[index] = { sides };
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
      {pool.map((die, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          background: '#0a0a1a',
          borderRadius: 4,
          padding: '2px 4px',
          gap: 2,
        }}>
          <select
            value={die.sides}
            onChange={(e) => changeDie(i, parseInt(e.target.value) as Die['sides'])}
            style={{
              background: 'transparent',
              color,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {SIDES_OPTIONS.map((s) => (
              <option key={s} value={s} style={{ background: '#1a1a2e' }}>d{s}</option>
            ))}
          </select>
          <IonIcon
            icon={removeCircleOutline}
            onClick={() => removeDie(i)}
            style={{ color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}
          />
          {i < pool.length - 1 && <span style={{ color: '#666', margin: '0 2px' }}>+</span>}
        </div>
      ))}
      <IonIcon
        icon={addCircleOutline}
        onClick={() => addDie(6)}
        style={{ color, fontSize: '1.2rem', cursor: 'pointer' }}
      />
    </div>
  );
};

export default DicePoolEditor;
