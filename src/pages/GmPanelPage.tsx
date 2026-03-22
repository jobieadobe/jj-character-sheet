import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonSegment, IonSegmentButton, IonLabel, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput,
  IonList, IonItem, IonSelect, IonSelectOption, IonAlert,
} from '@ionic/react';
import { useGameSession } from '../state/GameSessionContext';
import { useCharacter } from '../state/CharacterContext';
import { useRollLog } from '../state/RollLogContext';
import { useParams } from 'react-router-dom';
import { sendMatchMessage } from '../services/nakama/match';
import { OpCode } from '../services/nakama/opcodes';
import EnergyBar from '../components/character/EnergyBar';

const GmPanelPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { state: sessionState, startNewEpisode, startLevelUp, endLevelUp } = useGameSession();
  const { state: charState, dispatch: charDispatch } = useCharacter();
  const { clearLog, exportLog } = useRollLog();
  const [activeTab, setActiveTab] = useState<'players' | 'npcs' | 'episode'>('episode');
  const [showNewEpConfirm, setShowNewEpConfirm] = useState(false);

  const handleAwardDetermination = (characterId: string, amount: number) => {
    const allChars = [...charState.allCharacters, ...charState.npcs];
    const char = allChars.find((c) => c.id === characterId);
    if (!char) return;

    const updated = { ...char, determinationDice: char.determinationDice + amount };
    charDispatch({ type: 'UPDATE_CHARACTER', character: updated });

    if (matchId) {
      try {
        sendMatchMessage(matchId, OpCode.AWARD_DETERMINATION, {
          characterId,
          amount,
          newTotal: updated.determinationDice,
        });
      } catch {}
    }
  };

  const handleEnergyAdjust = (characterId: string, delta: number) => {
    const allChars = [...charState.allCharacters, ...charState.npcs];
    const char = allChars.find((c) => c.id === characterId);
    if (!char) return;

    const newEnergy = Math.max(0, Math.min(char.energyMax, char.energy + delta));
    const updated = { ...char, energy: newEnergy };
    charDispatch({ type: 'UPDATE_CHARACTER', character: updated });

    if (matchId) {
      try {
        sendMatchMessage(matchId, OpCode.ENERGY_CHANGED, {
          characterId,
          energy: newEnergy,
        });
      } catch {}
    }
  };

  const handleNewEpisode = () => {
    startNewEpisode();
    clearLog();
    setShowNewEpConfirm(false);
  };

  const handleExportLog = () => {
    const text = exportLog();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roll-log-ep${sessionState.session?.episodeNumber || 0}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const characters = charState.myCharacter ? [charState.myCharacter, ...charState.allCharacters] : charState.allCharacters;
  // Deduplicate by id
  const uniqueChars = Array.from(new Map(characters.map((c) => [c.id, c])).values());
  const playerChars = uniqueChars.filter((c) => !c.isNpc);
  const npcs = charState.npcs;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1a1a2e' } as any}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/game/${matchId}`} />
          </IonButtons>
          <IonTitle style={{ color: '#e94560' }}>GM Panel</IonTitle>
        </IonToolbar>
        <IonToolbar style={{ '--background': '#16213e' } as any}>
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as any)}>
            <IonSegmentButton value="players"><IonLabel>Players</IonLabel></IonSegmentButton>
            <IonSegmentButton value="npcs"><IonLabel>NPCs</IonLabel></IonSegmentButton>
            <IonSegmentButton value="episode"><IonLabel>Episode</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#1a1a2e' } as any}>
        {activeTab === 'episode' && (
          <div>
            <IonCard style={{ '--background': '#16213e' } as any}>
              <IonCardHeader>
                <IonCardTitle>Episode {sessionState.session?.episodeNumber || 1}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ color: '#aaa' }}>
                  Status: <strong>{sessionState.session?.episodeStatus || 'active'}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <IonButton
                    expand="block"
                    color="warning"
                    onClick={() => setShowNewEpConfirm(true)}
                  >
                    New Episode
                  </IonButton>
                  <IonButton
                    expand="block"
                    color="tertiary"
                    onClick={startLevelUp}
                    disabled={sessionState.session?.episodeStatus === 'leveling'}
                  >
                    Begin Level Up Phase
                  </IonButton>
                  {sessionState.session?.episodeStatus === 'leveling' && (
                    <IonButton expand="block" color="success" onClick={endLevelUp}>
                      End Level Up Phase
                    </IonButton>
                  )}
                  <IonButton expand="block" fill="outline" color="medium" onClick={handleExportLog}>
                    Export Roll Log
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

            <IonAlert
              isOpen={showNewEpConfirm}
              onDidDismiss={() => setShowNewEpConfirm(false)}
              header="New Episode"
              message="This will clear all determination and force dice, then grant new force dice equal to the episode number. The roll log will also be cleared. Continue?"
              buttons={[
                { text: 'Cancel', role: 'cancel' },
                { text: 'Start New Episode', handler: handleNewEpisode },
              ]}
            />
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            {playerChars.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No player characters loaded</p>
            ) : (
              playerChars.map((char) => (
                <IonCard key={char.id} style={{ '--background': '#16213e' } as any}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1.1rem' }}>{char.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <EnergyBar
                      current={char.energy}
                      max={char.energyMax}
                      canEdit={true}
                      onAdjust={(delta) => handleEnergyAdjust(char.id, delta)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <IonButton
                        size="small"
                        color="warning"
                        onClick={() => handleAwardDetermination(char.id, 1)}
                      >
                        +1 Determination
                      </IonButton>
                      <span style={{ color: '#ff9800', alignSelf: 'center' }}>
                        Current: {char.determinationDice}d4
                      </span>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'npcs' && (
          <div>
            <p style={{ color: '#666', textAlign: 'center' }}>
              NPC management coming soon. For now, create NPCs via the character creation flow.
            </p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GmPanelPage;
