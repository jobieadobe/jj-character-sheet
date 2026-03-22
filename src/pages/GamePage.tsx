import React, { useState, useCallback, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel,
  IonBadge,
} from '@ionic/react';
import { settingsOutline, personOutline, listOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useNakama } from '../state/NakamaContext';
import { useGameSession } from '../state/GameSessionContext';
import { useCharacter } from '../state/CharacterContext';
import { useRollLog } from '../state/RollLogContext';
import { RollComponent } from '../models/dice';
import { RollLogEntry } from '../models/log';
import { StatName, createDefaultCharacter } from '../models/character';
import { isGmRole } from '../models/session';
import { sendMatchMessage } from '../services/nakama/match';
import { OpCode } from '../services/nakama/opcodes';
import { rollDiceFallback } from '../services/dice/dice-engine';
import { formatRollResult } from '../utils/format-roll';
import DiceCanvas from '../components/dice/DiceCanvas';
import RollLog from '../components/log/RollLog';
import CharacterSheetPage from './CharacterSheetPage';

const GamePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { state: nakamaState } = useNakama();
  const { state: sessionState } = useGameSession();
  const { state: charState, dispatch: charDispatch } = useCharacter();
  const { state: logState, addEntry } = useRollLog();

  const [activeTab, setActiveTab] = useState<'sheet' | 'log'>('sheet');
  const [diceVisible, setDiceVisible] = useState(false);

  const isGm = isGmRole(sessionState.myRole);
  const session = nakamaState.session;
  const username = session?.username || 'Unknown';

  // Create a default character if none exists
  useEffect(() => {
    if (!charState.myCharacter && session) {
      const defaultChar = createDefaultCharacter(session.user_id!, `${username}'s Character`);
      defaultChar.equipment.weapon = { name: 'Vibrosword', dice: [{ sides: 10 }] };
      defaultChar.equipment.armor = { name: 'Power Suit', dice: [{ sides: 8 }] };
      defaultChar.stats.STR = [{ sides: 8 }, { sides: 6 }];
      defaultChar.stats.DEX = [{ sides: 6 }];
      defaultChar.stats.CON = [{ sides: 10 }];
      defaultChar.stats.INT = [{ sides: 6 }];
      defaultChar.stats.WIS = [{ sides: 8 }];
      defaultChar.stats.CHA = [{ sides: 6 }, { sides: 4 }];
      defaultChar.energyMax = 30;
      defaultChar.energy = 30;
      defaultChar.forceDice = 2;
      defaultChar.determinationDice = 1;
      defaultChar.className = 'Stalwart';
      defaultChar.race = 'Whiphid';
      defaultChar.flaw = 'Indecision';
      defaultChar.speciesAbilities = 'Healing coma when incapacitated';
      defaultChar.strengths = ['Survival', 'Nature', 'Mechanics'];
      defaultChar.description = 'As a Stalwart, this character\'s focus on Constitution grants them unparalleled vitality.';
      defaultChar.passives = [
        'VIBROSHIELD (PASSIVE): When an enemy makes a melee attack against you they take damage equal to your SHIELD dice roll.',
        'BULWARK OF PROTECTION (PASSIVE): When an ally within CLOSE range is targeted by an attack, you can use your shield to intercept.',
        'TAUNT (BONUS): Choose one enemy, it must spend its next turn trying to attack you.',
      ];
      charDispatch({ type: 'SET_MY_CHARACTER', character: defaultChar });
    }
  }, [charState.myCharacter, session, username, charDispatch]);

  const character = charState.myCharacter;

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

  const handleStatClick = useCallback(
    (stat: StatName) => {
      if (!character) return;
      const dice = character.stats[stat];
      if (dice.length === 0) return;

      const results = rollDiceFallback(dice);
      const subtotal = results.reduce((sum, d) => sum + d.value, 0);
      const components: RollComponent[] = [
        { source: { type: 'stat', name: stat }, dice: results, subtotal },
      ];
      const formatted = formatRollResult(username, character.name, components, subtotal);
      handleRollComplete(components, subtotal, formatted);
    },
    [character, username, handleRollComplete]
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

  if (!character) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Loading character...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1a1a2e' } as any}>
          <IonTitle style={{ color: '#e94560', fontSize: '1rem' }}>
            {sessionState.session?.name || 'Game'} — Ep. {sessionState.session?.episodeNumber || 1}
          </IonTitle>
          <IonButtons slot="end">
            {isGm && (
              <IonButton routerLink={`/game/${matchId}/gm`}>
                <IonIcon icon={settingsOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
        <IonToolbar style={{ '--background': '#16213e' } as any}>
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

      <IonContent style={{ '--background': '#1a1a2e' } as any}>
        {activeTab === 'sheet' && (
          <CharacterSheetPage
            character={character}
            isGm={isGm}
            onStatClick={handleStatClick}
            onEnergyAdjust={handleEnergyAdjust}
            onRollComplete={handleRollComplete}
            onRollStart={() => setDiceVisible(true)}
            username={username}
            logEntries={logState.entries}
          />
        )}

        {activeTab === 'log' && (
          <RollLog entries={logState.entries} />
        )}
      </IonContent>

      <DiceCanvas visible={diceVisible} />
    </IonPage>
  );
};

export default GamePage;
