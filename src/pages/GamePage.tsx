import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonIcon,
  IonSegment, IonSegmentButton, IonLabel,
  IonBadge, IonSelect, IonSelectOption,
} from '@ionic/react';
import { settingsOutline, personOutline, listOutline } from 'ionicons/icons';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { useNakama } from '../state/NakamaContext';
import { useGameSession } from '../state/GameSessionContext';
import { useTheme } from '../state/ThemeContext';
import { useCharacter } from '../state/CharacterContext';
import { useRollLog } from '../state/RollLogContext';
import { Character } from '../models/character';
import { RollComponent } from '../models/dice';
import { RollLogEntry } from '../models/log';
import { isGmRole } from '../models/session';
import { sendMatchMessage } from '../services/nakama/match';
import { OpCode } from '../services/nakama/opcodes';
import { createTestCharacters } from '../data/test-characters';
import DiceCanvas from '../components/dice/DiceCanvas';
import RollLog from '../components/log/RollLog';
import CharacterSheetPage from './CharacterSheetPage';

const GamePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { state: nakamaState } = useNakama();
  const { state: sessionState } = useGameSession();
  const { state: charState, dispatch: charDispatch } = useCharacter();
  const { state: logState, addEntry } = useRollLog();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'sheet' | 'log'>('sheet');
  const [diceVisible, setDiceVisible] = useState(false);
  const history = useHistory();

  const session = nakamaState.session;

  const isGm = isGmRole(sessionState.myRole)
    || sessionState.session?.createdBy === session?.user_id
    || (sessionState.session?.members || []).some((m) => m.userId === session?.user_id && isGmRole(m.role));

  // Load test characters if none exist
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && charState.allCharacters.length === 0 && session) {
      initialized.current = true;
      const testChars = createTestCharacters(session.user_id!);
      testChars.forEach((c) => {
        charDispatch({ type: 'ADD_CHARACTER', character: c });
      });
      charDispatch({ type: 'SET_MY_CHARACTER', character: testChars[0] });
    }
  }, [charState.allCharacters.length, session, charDispatch]);

  // Auth guard — after all hooks, redirect if session lost
  if (!session) return <Redirect to="/login" />;

  const username = session.username || 'Unknown';
  const character = charState.myCharacter;

  const allAvailable = [...charState.allCharacters, ...charState.npcs];

  const handleCharacterSwitch = (charId: string) => {
    const found = allAvailable.find((c) => c.id === charId);
    if (found) {
      charDispatch({ type: 'SET_MY_CHARACTER', character: found });
    }
  };

  const handleRollComplete = useCallback(
    (components: RollComponent[], total: number, formatted: string) => {
      setDiceVisible(true);
      setTimeout(() => setDiceVisible(false), 5000);

      const entry: RollLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: session?.user_id || '',
        username,
        characterName: character?.name || username,
        components,
        total,
        formatted,
        purpose: 'general',
      };

      addEntry(entry);

      if (matchId) {
        try {
          sendMatchMessage(matchId, OpCode.ROLL_RESULT, entry);
        } catch {
          // Not in a match, local only
        }
      }
    },
    [session, username, character, matchId, addEntry]
  );

  const handleSpikedShieldToggle = useCallback(
    (checked: boolean) => {
      if (!character) return;
      const updated = {
        ...character,
        equipment: { ...character.equipment, spikedShield: checked },
      };
      charDispatch({ type: 'UPDATE_CHARACTER', character: updated });
    },
    [character, charDispatch]
  );

  const handleCharacterUpdate = useCallback(
    (updated: Character) => {
      charDispatch({ type: 'UPDATE_CHARACTER', character: updated });
      if (matchId) {
        try {
          sendMatchMessage(matchId, OpCode.ENERGY_CHANGED, {
            characterId: updated.id,
            energy: updated.energy,
          });
        } catch {}
      }
    },
    [charDispatch, matchId]
  );

  const handleEnergyAdjust = useCallback(
    (delta: number) => {
      if (!character) return;
      const newEnergy = Math.max(0, Math.min(character.energyMax, character.energy + delta));
      const updated = { ...character, energy: newEnergy };
      charDispatch({ type: 'UPDATE_CHARACTER', character: updated });
      if (matchId) {
        try {
          sendMatchMessage(matchId, OpCode.ENERGY_CHANGED, {
            characterId: character.id,
            energy: newEnergy,
          });
        } catch {}
      }
    },
    [character, charDispatch, matchId]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': theme.background } as any}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
            <span style={{ color: theme.primary, fontSize: '1rem', fontWeight: 600 }}>
              {sessionState.session?.name || 'Game'} — Ep. {sessionState.session?.episodeNumber || 1}
            </span>
            <IonIcon
              icon={settingsOutline}
              onClick={() => history.push(`/game/${matchId}/gm`)}
              style={{
                fontSize: '1.4rem',
                color: theme.textMuted,
                cursor: 'pointer',
                padding: 6,
              }}
            />
          </div>
        </IonToolbar>

        {/* Character switcher */}
        {character && allAvailable.length > 1 && (
          <IonToolbar style={{ '--background': theme.surfaceDeep, '--min-height': '40px' } as any}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Active:
              </span>
              <IonSelect
                value={character.id}
                onIonChange={(e) => handleCharacterSwitch(e.detail.value)}
                interface="popover"
                style={{ '--color': theme.primary, '--placeholder-color': theme.textMuted, fontSize: '0.9rem', maxWidth: '100%' } as any}
              >
                {charState.allCharacters.filter((c) => !c.isNpc).map((c) => (
                  <IonSelectOption key={c.id} value={c.id}>
                    {c.name} ({c.race} {c.className})
                  </IonSelectOption>
                ))}
                {charState.npcs.length > 0 && charState.allCharacters.filter((c) => !c.isNpc).length > 0 && (
                  <IonSelectOption disabled value="">— NPCs —</IonSelectOption>
                )}
                {charState.npcs.map((c) => (
                  <IonSelectOption key={c.id} value={c.id}>
                    [NPC] {c.name} {c.race || c.className ? `(${[c.race, c.className].filter(Boolean).join(' ')})` : ''}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </IonToolbar>
        )}

        <IonToolbar style={{ '--background': theme.surface } as any}>
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as any)}>
            <IonSegmentButton value="sheet">
              <IonIcon icon={personOutline} />
              <IonLabel>Character</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="log">
              <IonIcon icon={listOutline} />
              <IonLabel>Full Log</IonLabel>
              {logState.entries.length > 0 && (
                <IonBadge color="danger" style={{ marginLeft: 4 }}>
                  {logState.entries.length}
                </IonBadge>
              )}
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'transparent' } as any}>
        {!character ? (
          <div className="ion-padding" style={{ textAlign: 'center', color: theme.textMuted }}>
            <p>Loading character...</p>
          </div>
        ) : (
          <>
            {activeTab === 'sheet' && (
              <CharacterSheetPage
                character={character}
                isGm={isGm}
                onEnergyAdjust={handleEnergyAdjust}
                onRollComplete={handleRollComplete}
                onRollStart={() => setDiceVisible(true)}
                onSpikedShieldToggle={handleSpikedShieldToggle}
                onCharacterUpdate={handleCharacterUpdate}
                username={username}
                logEntries={logState.entries}
              />
            )}
            {activeTab === 'log' && (
              <RollLog entries={logState.entries} />
            )}
          </>
        )}
      </IonContent>

      <DiceCanvas visible={diceVisible} />
    </IonPage>
  );
};

export default GamePage;
