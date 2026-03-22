import React, { useEffect, useRef } from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { RollLogEntry } from '../../models/log';

interface RollLogProps {
  entries: RollLogEntry[];
}

const RollLog: React.FC<RollLogProps> = ({ entries }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
        No rolls yet. Build a roll and hit ROLL!
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100%', padding: '4px 0' }}>
      <IonList style={{ '--background': 'transparent' } as any}>
        {entries.map((entry) => (
          <IonItem
            key={entry.id}
            style={{
              '--background': entry.purpose === 'damage_applied' ? '#3d1414' : '#16213e',
              '--border-color': '#0f3460',
              fontSize: '0.85rem',
            } as any}
            lines="inset"
          >
            <IonLabel className="ion-text-wrap">
              <p style={{ color: '#aaa', fontSize: '0.7rem', margin: 0 }}>
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
              <p style={{
                color: entry.purpose === 'attack' ? '#e94560' :
                       entry.purpose === 'defense' ? '#2ecc71' :
                       entry.purpose === 'damage_applied' ? '#ff6b6b' : '#eee',
                margin: '2px 0',
                fontWeight: entry.purpose === 'damage_applied' ? 'bold' : 'normal',
              }}>
                {entry.formatted}
              </p>
              {entry.meta?.damageDealt !== undefined && (
                <p style={{ color: '#ff6b6b', fontWeight: 'bold', margin: 0 }}>
                  Damage dealt: {entry.meta.damageDealt} to {entry.meta.targetCharacterName}
                </p>
              )}
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
      <div ref={bottomRef} />
    </div>
  );
};

export default RollLog;
