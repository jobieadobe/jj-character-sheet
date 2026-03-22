import React from 'react';
import {
  IonGrid, IonRow, IonCol,
} from '@ionic/react';
import { Character, STAT_NAMES, StatName } from '../models/character';
import { RollComponent } from '../models/dice';
import { RollLogEntry } from '../models/log';
import StatBlock from '../components/character/StatBlock';
import EnergyBar from '../components/character/EnergyBar';
import SpecialDice from '../components/character/SpecialDice';
import EquipmentSlot from '../components/character/EquipmentSlot';
import RollBuilder from '../components/dice/RollBuilder';
import RollLog from '../components/log/RollLog';

interface CharacterSheetPageProps {
  character: Character;
  isGm: boolean;
  onStatClick: (stat: StatName) => void;
  onEnergyAdjust: (delta: number) => void;
  onRollComplete: (components: RollComponent[], total: number, formatted: string) => void;
  onRollStart?: () => void;
  username: string;
  logEntries: RollLogEntry[];
}

const CharacterSheetPage: React.FC<CharacterSheetPageProps> = ({
  character,
  isGm,
  onStatClick,
  onEnergyAdjust,
  onRollComplete,
  onRollStart,
  username,
  logEntries,
}) => {
  return (
    <div style={{ padding: '0 8px' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '12px 0 4px',
        borderBottom: '3px solid #e94560',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>
          {character.race} {character.className}
        </div>
        <h2 style={{ margin: '4px 0', fontSize: '1.6rem', color: '#e94560', fontFamily: 'serif' }}>
          {character.name}
        </h2>
        {character.strengths.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
            Strengths: {character.strengths.join(', ')}
          </div>
        )}
      </div>

      <IonGrid>
        <IonRow>
          {/* Left column - Description, passives, roll builder, log */}
          <IonCol size="12" sizeMd="5">
            {character.description && (
              <div style={{
                background: '#16213e',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                fontSize: '0.8rem',
                color: '#ccc',
                lineHeight: 1.5,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {character.description}
              </div>
            )}

            {character.passives.map((passive, i) => (
              <div key={i} style={{
                background: '#16213e',
                borderRadius: 6,
                padding: '6px 10px',
                marginBottom: 4,
                fontSize: '0.8rem',
                color: '#eee',
              }}>
                {passive}
              </div>
            ))}

            {character.flaw && (
              <div style={{ fontSize: '0.8rem', color: '#e94560', marginTop: 8 }}>
                <strong>Flaw:</strong> {character.flaw}
              </div>
            )}
            {character.speciesAbilities && (
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4, marginBottom: 12 }}>
                <strong>Species Abilities:</strong> {character.speciesAbilities}
              </div>
            )}

            {/* Roll Builder */}
            <div style={{
              background: '#0d1b36',
              borderRadius: 8,
              padding: '8px',
              marginTop: 8,
              border: '1px solid #0f3460',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 4 }}>
                Dice Roller
              </div>
              <RollBuilder
                character={character}
                onRollComplete={onRollComplete}
                onRollStart={onRollStart}
                username={username}
              />
            </div>

            {/* Recent Rolls */}
            <div style={{
              marginTop: 8,
              background: '#0d1b36',
              borderRadius: 8,
              border: '1px solid #0f3460',
              maxHeight: 250,
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', padding: '8px 12px 0' }}>
                Recent Rolls
              </div>
              <RollLog entries={logEntries.slice(-10)} />
            </div>
          </IonCol>

          {/* Right column - Stats & Equipment */}
          <IonCol size="12" sizeMd="7">
            {/* Equipment */}
            <div style={{ marginBottom: 12 }}>
              <EquipmentSlot label="Weapon" item={character.equipment.weapon} color="#e67e22" />
              <EquipmentSlot label="Armor" item={character.equipment.armor} color="#7f8c8d" />
              <EquipmentSlot label="Shield" item={character.equipment.shield} color="#2c3e50" />
            </div>

            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 2 }}>
              Movement Speed: {character.movementSpeed}
            </div>

            {/* Stats */}
            {STAT_NAMES.map((stat) => (
              <StatBlock
                key={stat}
                name={stat}
                dice={character.stats[stat]}
                onClick={() => onStatClick(stat)}
              />
            ))}

            {/* Energy & Special Dice */}
            <div style={{ marginTop: 12 }}>
              <EnergyBar
                current={character.energy}
                max={character.energyMax}
                canEdit={isGm}
                onAdjust={onEnergyAdjust}
              />
              <SpecialDice
                forceDice={character.forceDice}
                determinationDice={character.determinationDice}
              />
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default CharacterSheetPage;
