import React, { useRef, useState } from 'react';
import {
  IonGrid, IonRow, IonCol, IonButton, IonIcon, IonInput,
} from '@ionic/react';
import { createOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Character, STAT_NAMES, StatName } from '../models/character';
import { DicePool } from '../models/dice';
import { RollComponent } from '../models/dice';
import { RollLogEntry } from '../models/log';
import StatBlock from '../components/character/StatBlock';
import EnergyBar from '../components/character/EnergyBar';
import SpecialDice from '../components/character/SpecialDice';
import EquipmentSlot from '../components/character/EquipmentSlot';
import DicePoolEditor from '../components/character/DicePoolEditor';
import RollBuilder, { RollBuilderHandle } from '../components/dice/RollBuilder';
import RollLog from '../components/log/RollLog';
import ThemePicker from '../components/settings/ThemePicker';
import { useTheme } from '../state/ThemeContext';
import { STAT_COLORS } from '../utils/constants';

interface CharacterSheetPageProps {
  character: Character;
  isGm: boolean;
  onEnergyAdjust: (delta: number) => void;
  onRollComplete: (components: RollComponent[], total: number, formatted: string) => void;
  onRollStart?: () => void;
  onSpikedShieldToggle?: (checked: boolean) => void;
  onCharacterUpdate?: (character: Character) => void;
  username: string;
  logEntries: RollLogEntry[];
}

const CharacterSheetPage: React.FC<CharacterSheetPageProps> = ({
  character,
  isGm,
  onEnergyAdjust,
  onRollComplete,
  onRollStart,
  onSpikedShieldToggle,
  onCharacterUpdate,
  username,
  logEntries,
}) => {
  const rollBuilderRef = useRef<RollBuilderHandle>(null);
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);

  const handleStatClick = (stat: StatName) => {
    if (editing) return;
    rollBuilderRef.current?.addStat(stat);
  };

  const update = (partial: Partial<Character>) => {
    onCharacterUpdate?.({ ...character, ...partial });
  };

  const updateStat = (stat: StatName, pool: DicePool) => {
    update({ stats: { ...character.stats, [stat]: pool } });
  };

  const updateEquipmentName = (slot: 'weapon' | 'armor' | 'shield', name: string) => {
    const existing = character.equipment[slot];
    if (!existing && !name.trim()) return;
    update({
      equipment: {
        ...character.equipment,
        [slot]: name.trim() ? { name: name.trim(), dice: existing?.dice || [{ sides: 6 }] } : null,
      },
    });
  };

  const updateEquipmentDice = (slot: 'weapon' | 'armor' | 'shield', pool: DicePool) => {
    const existing = character.equipment[slot];
    if (!existing) return;
    update({
      equipment: {
        ...character.equipment,
        [slot]: { ...existing, dice: pool },
      },
    });
  };

  const inputStyle: React.CSSProperties = {
    background: '#0a0a1a',
    border: '1px solid #333',
    borderRadius: 4,
    color: theme.text,
    padding: '4px 8px',
    fontSize: '0.85rem',
    width: '100%',
  };

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '12px 0 4px',
        borderBottom: `3px solid ${theme.primary}`,
        marginBottom: 12,
        position: 'relative',
      }}>
        {/* Edit toggle */}
        {onCharacterUpdate && (
          <IonButton
            size="small"
            fill={editing ? 'solid' : 'outline'}
            color={editing ? 'success' : 'medium'}
            onClick={() => setEditing(!editing)}
            style={{ position: 'absolute', right: 0, top: 8 }}
          >
            <IonIcon icon={editing ? checkmarkCircleOutline : createOutline} slot="start" />
            {editing ? 'Done' : 'Edit'}
          </IonButton>
        )}

        {editing ? (
          <>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
              <input
                value={character.race}
                onChange={(e) => update({ race: e.target.value })}
                placeholder="Species"
                style={{ ...inputStyle, width: 120, textAlign: 'center' }}
              />
              <input
                value={character.className}
                onChange={(e) => update({ className: e.target.value })}
                placeholder="Class"
                style={{ ...inputStyle, width: 120, textAlign: 'center' }}
              />
            </div>
            <input
              value={character.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Character Name"
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: theme.primary }}
            />
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase' }}>
              {character.race} {character.className}
            </div>
            <h2 style={{ margin: '4px 0', fontSize: '1.6rem', color: theme.primary, fontFamily: 'serif' }}>
              {character.name}
            </h2>
            {character.strengths.length > 0 && (
              <div style={{ fontSize: '0.7rem', color: theme.textMuted }}>
                Strengths: {character.strengths.join(', ')}
              </div>
            )}
          </>
        )}
      </div>

      <IonGrid>
        <IonRow>
          {/* Left column */}
          <IonCol size="12" sizeMd="5">
            {character.description && !editing && (
              <div style={{
                background: theme.surface + 'cc',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                fontSize: '0.8rem',
                color: theme.text,
                lineHeight: 1.5,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {character.description}
              </div>
            )}

            {editing && (
              <div style={{ marginBottom: 8 }}>
                <textarea
                  value={character.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Description..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            )}

            {!editing && character.passives.map((passive, i) => (
              <div key={i} style={{
                background: theme.surface + 'cc',
                borderRadius: 6,
                padding: '6px 10px',
                marginBottom: 4,
                fontSize: '0.8rem',
                color: theme.text,
              }}>
                {passive}
              </div>
            ))}

            {!editing && character.flaw && (
              <div style={{ fontSize: '0.8rem', color: theme.primary, marginTop: 8 }}>
                <strong>Flaw:</strong> {character.flaw}
              </div>
            )}
            {!editing && character.speciesAbilities && (
              <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginTop: 4, marginBottom: 12 }}>
                <strong>Species Abilities:</strong> {character.speciesAbilities}
              </div>
            )}

            {editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <input
                  value={character.flaw}
                  onChange={(e) => update({ flaw: e.target.value })}
                  placeholder="Flaw"
                  style={inputStyle}
                />
                <input
                  value={character.speciesAbilities}
                  onChange={(e) => update({ speciesAbilities: e.target.value })}
                  placeholder="Species Abilities"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Roll Builder */}
            {!editing && (
              <>
                <div style={{
                  background: theme.surfaceDeep + 'cc',
                  borderRadius: 8,
                  padding: '8px',
                  marginTop: 8,
                  border: `1px solid ${theme.border}`,
                }}>
                  <div style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 4, paddingLeft: 4 }}>
                    Dice Roller
                  </div>
                  <RollBuilder
                    ref={rollBuilderRef}
                    character={character}
                    onRollComplete={onRollComplete}
                    onRollStart={onRollStart}
                    username={username}
                  />
                </div>

                <div style={{
                  marginTop: 8,
                  background: theme.surfaceDeep + 'cc',
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  maxHeight: 250,
                  overflowY: 'auto',
                }}>
                  <div style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', padding: '8px 12px 0' }}>
                    Recent Rolls
                  </div>
                  <RollLog entries={logEntries.slice(-10)} />
                </div>
              </>
            )}

            {/* Theme Picker */}
            <div style={{ marginTop: 12 }}>
              <ThemePicker />
            </div>
          </IonCol>

          {/* Right column - Stats & Equipment */}
          <IonCol size="12" sizeMd="7">
            {/* Equipment */}
            <div style={{ marginBottom: 12 }}>
              {editing ? (
                <>
                  {(['weapon', 'armor', 'shield'] as const).map((slot) => {
                    const item = character.equipment[slot];
                    const colors: Record<string, string> = { weapon: '#e67e22', armor: '#7f8c8d', shield: '#2c3e50' };
                    return (
                      <div key={slot} style={{
                        background: '#16213ecc',
                        borderRadius: 6,
                        padding: '8px 12px',
                        borderLeft: `4px solid ${colors[slot]}`,
                        marginBottom: 6,
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                          {slot}
                        </div>
                        <input
                          value={item?.name || ''}
                          onChange={(e) => updateEquipmentName(slot, e.target.value)}
                          placeholder={`${slot} name (empty = none)`}
                          style={{ ...inputStyle, marginBottom: 4 }}
                        />
                        {item && (
                          <DicePoolEditor
                            pool={item.dice}
                            onChange={(pool) => updateEquipmentDice(slot, pool)}
                            color={colors[slot]}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <EquipmentSlot label="Weapon" item={character.equipment.weapon} color="#e67e22" />
                  <EquipmentSlot label="Armor" item={character.equipment.armor} color="#7f8c8d" />
                  <EquipmentSlot
                    label="Shield"
                    item={character.equipment.shield}
                    color="#2c3e50"
                    spikedShield={character.equipment.spikedShield}
                    onSpikedShieldToggle={onSpikedShieldToggle}
                    showSpikedShieldToggle={!!character.equipment.shield}
                  />
                </>
              )}
            </div>

            {/* Movement */}
            {editing ? (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.7rem', color: '#1abc9c', marginBottom: 4 }}>Movement Speed</div>
                <DicePoolEditor
                  pool={character.movementSpeed}
                  onChange={(pool) => update({ movementSpeed: pool })}
                  color="#1abc9c"
                />
              </div>
            ) : (
              <div style={{ fontSize: '0.7rem', color: '#1abc9c', marginBottom: 2 }}>
                Movement Speed: {character.movementSpeed.map((d) => `d${d.sides}`).join(' + ')}
              </div>
            )}

            {/* Stats */}
            {STAT_NAMES.map((stat) => (
              editing ? (
                <div key={stat} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  margin: '4px 0',
                  background: '#16213ecc',
                  borderLeft: `4px solid ${STAT_COLORS[stat]}`,
                  borderRadius: 6,
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: STAT_COLORS[stat], width: 40 }}>
                    {stat}
                  </div>
                  <DicePoolEditor
                    pool={character.stats[stat]}
                    onChange={(pool) => updateStat(stat, pool)}
                    color={STAT_COLORS[stat]}
                  />
                </div>
              ) : (
                <StatBlock
                  key={stat}
                  name={stat}
                  dice={character.stats[stat]}
                  onClick={() => handleStatClick(stat)}
                />
              )
            ))}

            {/* Energy & Special Dice */}
            <div style={{ marginTop: 12 }}>
              <EnergyBar
                current={character.energy}
                max={character.energyMax}
                canEdit={isGm}
                onAdjust={onEnergyAdjust}
              />
              {editing ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <label style={{ fontSize: '0.8rem', color: theme.textMuted }}>
                    Max HP:
                    <input
                      type="number"
                      value={character.energyMax}
                      onChange={(e) => {
                        const max = parseInt(e.target.value) || 1;
                        update({ energyMax: max, energy: Math.min(character.energy, max) });
                      }}
                      style={{ ...inputStyle, width: 60, marginLeft: 4 }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#00bcd4' }}>
                    Force d8s:
                    <input
                      type="number"
                      value={character.forceDice}
                      onChange={(e) => update({ forceDice: parseInt(e.target.value) || 0 })}
                      style={{ ...inputStyle, width: 50, marginLeft: 4 }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#ff9800' }}>
                    Det d4s:
                    <input
                      type="number"
                      value={character.determinationDice}
                      onChange={(e) => update({ determinationDice: parseInt(e.target.value) || 0 })}
                      style={{ ...inputStyle, width: 50, marginLeft: 4 }}
                    />
                  </label>
                </div>
              ) : (
                <SpecialDice
                  forceDice={character.forceDice}
                  determinationDice={character.determinationDice}
                />
              )}
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default CharacterSheetPage;
