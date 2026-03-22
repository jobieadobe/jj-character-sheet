import React from 'react';
import { EquipmentItem } from '../../models/character';

interface EquipmentSlotProps {
  label: string;
  item: EquipmentItem | null;
  color: string;
  onClick?: () => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ label, item, color, onClick }) => {
  const diceLabel = item ? item.dice.map((d) => `d${d.sides}`).join(' + ') : 'None';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#16213e',
        borderRadius: 6,
        padding: '8px 12px',
        borderLeft: `4px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: 6,
      }}
    >
      <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 'bold', color: '#eee', fontSize: '1rem' }}>
        {item ? item.name : 'Empty'}
      </div>
      {item && (
        <div style={{ color, fontSize: '0.85rem', fontWeight: 'bold' }}>{diceLabel}</div>
      )}
    </div>
  );
};

export default EquipmentSlot;
