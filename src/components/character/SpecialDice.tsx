import React from 'react';
import { FORCE_COLOR, DETERMINATION_COLOR } from '../../utils/constants';

interface SpecialDiceProps {
  forceDice: number;
  determinationDice: number;
}

const SpecialDice: React.FC<SpecialDiceProps> = ({ forceDice, determinationDice }) => {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0' }}>
      <div style={{
        flex: 1,
        background: '#16213e',
        borderRadius: 8,
        padding: '10px 14px',
        borderLeft: `4px solid ${FORCE_COLOR}`,
      }}>
        <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Force Dice</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: FORCE_COLOR }}>
          {forceDice}d8
        </div>
      </div>
      <div style={{
        flex: 1,
        background: '#16213e',
        borderRadius: 8,
        padding: '10px 14px',
        borderLeft: `4px solid ${DETERMINATION_COLOR}`,
      }}>
        <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Determination</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: DETERMINATION_COLOR }}>
          {determinationDice}d4
        </div>
      </div>
    </div>
  );
};

export default SpecialDice;
