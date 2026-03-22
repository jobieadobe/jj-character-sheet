import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { addOutline, removeOutline } from 'ionicons/icons';

interface EnergyBarProps {
  current: number;
  max: number;
  canEdit: boolean;
  onAdjust: (delta: number) => void;
}

const EnergyBar: React.FC<EnergyBarProps> = ({ current, max, canEdit, onAdjust }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = percentage > 50 ? '#2ecc71' : percentage > 25 ? '#f39c12' : '#e74c3c';

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#eee' }}>
          ENERGY
        </span>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: barColor }}>
          {current} / {max}
        </span>
      </div>
      <div style={{
        background: '#0f3460',
        borderRadius: 8,
        height: 20,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          background: barColor,
          height: '100%',
          width: `${percentage}%`,
          borderRadius: 8,
          transition: 'width 0.5s, background 0.5s',
        }} />
      </div>
      {canEdit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'center' }}>
          <IonButton size="small" fill="outline" color="danger" onClick={() => onAdjust(-5)}>-5</IonButton>
          <IonButton size="small" fill="outline" color="danger" onClick={() => onAdjust(-1)}>
            <IonIcon icon={removeOutline} />
          </IonButton>
          <IonButton size="small" fill="outline" color="success" onClick={() => onAdjust(1)}>
            <IonIcon icon={addOutline} />
          </IonButton>
          <IonButton size="small" fill="outline" color="success" onClick={() => onAdjust(5)}>+5</IonButton>
        </div>
      )}
    </div>
  );
};

export default EnergyBar;
