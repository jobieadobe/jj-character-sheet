import React from 'react';
import { EquipmentItem } from '../../models/character';

interface EquipmentSlotProps {
  label: string;
  item: EquipmentItem | null;
  color: string;
  onClick?: () => void;
  spikedShield?: boolean;
  onSpikedShieldToggle?: (checked: boolean) => void;
  showSpikedShieldToggle?: boolean;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ label, item, color, onClick, spikedShield, onSpikedShieldToggle, showSpikedShieldToggle }) => {
  const diceLabel = item ? item.dice.map((d) => `d${d.sides}`).join(' + ') : 'None';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#16213ecc',
        borderRadius: 6,
        padding: '8px 12px',
        borderLeft: `4px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontWeight: 'bold', color: '#eee', fontSize: '1rem' }}>
            {item ? item.name : 'Empty'}
          </div>
          {item && (
            <div style={{ color, fontSize: '0.85rem', fontWeight: 'bold' }}>{diceLabel}</div>
          )}
        </div>
        {showSpikedShieldToggle && item && (
          <label
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.75rem', color: '#ccc' }}
          >
            <input
              type="checkbox"
              checked={spikedShield || false}
              onChange={(e) => onSpikedShieldToggle?.(e.target.checked)}
              style={{ accentColor: '#e94560', width: 16, height: 16 }}
            />
            Spiked
          </label>
        )}
      </div>
    </div>
  );
};

export default EquipmentSlot;
