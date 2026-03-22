import React from 'react';
import { DicePool } from '../../models/dice';
import { StatName, STAT_SKILLS } from '../../models/character';
import { STAT_COLORS } from '../../utils/constants';

interface StatBlockProps {
  name: StatName;
  dice: DicePool;
  onClick: () => void;
}

const StatBlock: React.FC<StatBlockProps> = ({ name, dice, onClick }) => {
  const color = STAT_COLORS[name];
  const skills = STAT_SKILLS[name];
  const diceLabel = dice.map((d) => `d${d.sides}`).join(' + ');

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        margin: '4px 0',
        background: '#16213e',
        borderLeft: `4px solid ${color}`,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a2744')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#16213e')}
    >
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color }}>
          {name}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
          {skills.join(', ')}
        </div>
      </div>
      <div style={{
        background: '#0f3460',
        padding: '6px 12px',
        borderRadius: 6,
        color: '#eee',
        fontWeight: 'bold',
        fontSize: '0.95rem',
      }}>
        {diceLabel || 'None'}
      </div>
    </div>
  );
};

export default StatBlock;
