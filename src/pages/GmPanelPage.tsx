import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonIcon,
  IonSegment, IonSegmentButton, IonLabel, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput,
  IonList, IonItem, IonCheckbox, IonAlert, IonBadge,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useGameSession } from '../state/GameSessionContext';
import { useCharacter } from '../state/CharacterContext';
import { useRollLog } from '../state/RollLogContext';
import { useNakama } from '../state/NakamaContext';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { sendMatchMessage } from '../services/nakama/match';
import { OpCode } from '../services/nakama/opcodes';
import { Character, createDefaultCharacter } from '../models/character';
import { SessionMember } from '../models/session';
import EnergyBar from '../components/character/EnergyBar';

const GmPanelPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { state: sessionState, dispatch: sessionDispatch, startNewEpisode, startLevelUp, endLevelUp } = useGameSession();
  const { state: charState, dispatch: charDispatch } = useCharacter();
  const { state: nakamaState } = useNakama();
  const { clearLog, exportLog } = useRollLog();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'manage' | 'players' | 'npcs' | 'episode'>('manage');
  const [showNewEpConfirm, setShowNewEpConfirm] = useState(false);

  // NPC creator state
  const [npcName, setNpcName] = useState('');
  const [npcRace, setNpcRace] = useState('');
  const [npcClass, setNpcClass] = useState('');

  if (!nakamaState.session) return <Redirect to="/login" />;

  const session = nakamaState.session;
  const members = sessionState.session?.members || [];

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

  const handleToggleCoGm = (userId: string, isCoGm: boolean) => {
    const updatedMembers = members.map((m) => {
      if (m.userId === userId) {
        return { ...m, role: isCoGm ? 'co-gm' as const : 'player' as const };
      }
      return m;
    });
    sessionDispatch({ type: 'UPDATE_MEMBERS', members: updatedMembers });
  };

  const handleToggleCharacterAssignment = (userId: string, characterId: string, assigned: boolean) => {
    // For now, store assignments in the member's characterId field
    // In the future this could be a many-to-many relationship
    const updatedMembers = members.map((m) => {
      if (m.userId === userId) {
        return { ...m, characterId: assigned ? characterId : null };
      }
      return m;
    });
    sessionDispatch({ type: 'UPDATE_MEMBERS', members: updatedMembers });
  };

  const handleCreateNpc = () => {
    if (!npcName.trim() || !session) return;
    const npc = createDefaultCharacter(session.user_id!, npcName.trim());
    npc.isNpc = true;
    npc.race = npcRace.trim();
    npc.className = npcClass.trim();
    charDispatch({ type: 'ADD_CHARACTER', character: npc });
    setNpcName('');
    setNpcRace('');
    setNpcClass('');
  };

  const characters = charState.myCharacter ? [charState.myCharacter, ...charState.allCharacters] : charState.allCharacters;
  const uniqueChars = Array.from(new Map(characters.map((c) => [c.id, c])).values());
  const playerChars = uniqueChars.filter((c) => !c.isNpc);
  const npcs = charState.npcs;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1a1a2e' } as any}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <IonIcon
              icon={arrowBackOutline}
              onClick={() => history.push(`/game/${matchId}`)}
              style={{ fontSize: '1.4rem', color: '#e94560', cursor: 'pointer', padding: 6, marginRight: 8 }}
            />
            <span style={{ color: '#e94560', fontSize: '1rem', fontWeight: 600 }}>GM Panel</span>
          </div>
        </IonToolbar>
        <IonToolbar style={{ '--background': '#16213e' } as any}>
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as any)}>
            <IonSegmentButton value="manage"><IonLabel>Manage</IonLabel></IonSegmentButton>
            <IonSegmentButton value="players"><IonLabel>Players</IonLabel></IonSegmentButton>
            <IonSegmentButton value="npcs"><IonLabel>NPCs</IonLabel></IonSegmentButton>
            <IonSegmentButton value="episode"><IonLabel>Episode</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#1a1a2e' } as any}>
        {/* ── Manage Tab: Player→Character assignments & Co-GM ── */}
        {activeTab === 'manage' && (
          <div>
            <IonCard style={{ '--background': '#16213e' } as any}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.1rem' }}>Player Management</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {members.length === 0 ? (
                  <p style={{ color: '#888' }}>No players have joined yet. Share the match ID for players to join.</p>
                ) : (
                  members.map((member) => {
                    const isCurrentUser = member.userId === session?.user_id;
                    const isCreator = sessionState.session?.createdBy === member.userId;
                    return (
                      <div
                        key={member.userId}
                        style={{
                          background: '#0d1b36',
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 8,
                          border: isCurrentUser ? '1px solid #e94560' : '1px solid #0f3460',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <span style={{ color: '#eee', fontWeight: 'bold', fontSize: '1rem' }}>
                              {member.username}
                            </span>
                            {isCurrentUser && (
                              <IonBadge color="primary" style={{ marginLeft: 8, fontSize: '0.65rem' }}>You</IonBadge>
                            )}
                            {isCreator && (
                              <IonBadge color="danger" style={{ marginLeft: 4, fontSize: '0.65rem' }}>GM</IonBadge>
                            )}
                          </div>
                          {!isCreator && (
                            <IonCheckbox
                              checked={member.role === 'co-gm'}
                              onIonChange={(e) => handleToggleCoGm(member.userId, e.detail.checked)}
                              labelPlacement="start"
                              style={{ '--size': '18px' } as any}
                            >
                              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Co-GM</span>
                            </IonCheckbox>
                          )}
                        </div>

                        {/* Character assignment checkboxes */}
                        <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                          Assigned Characters
                        </div>
                        {playerChars.length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem' }}>No characters available</p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {playerChars.map((c) => (
                              <IonCheckbox
                                key={c.id}
                                checked={member.characterId === c.id}
                                onIonChange={(e) => handleToggleCharacterAssignment(member.userId, c.id, e.detail.checked)}
                                labelPlacement="end"
                                style={{ '--size': '16px', fontSize: '0.8rem', marginRight: 12 } as any}
                              >
                                <span style={{ color: '#ccc' }}>{c.name}</span>
                                <span style={{ color: '#888', fontSize: '0.7rem', marginLeft: 4 }}>
                                  ({c.race} {c.className})
                                </span>
                              </IonCheckbox>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </IonCardContent>
            </IonCard>

            {/* Available Characters summary */}
            <IonCard style={{ '--background': '#16213e' } as any}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.1rem' }}>
                  Available Characters ({playerChars.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {playerChars.map((c) => (
                  <div key={c.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid #0f3460',
                  }}>
                    <div>
                      <span style={{ color: '#eee', fontWeight: 'bold' }}>{c.name}</span>
                      <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: 8 }}>
                        {c.race} {c.className}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                      Lv.{c.level} | {c.energy}/{c.energyMax} HP
                    </div>
                  </div>
                ))}
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* ── Players Tab: Energy & Determination ── */}
        {activeTab === 'players' && (
          <div>
            {playerChars.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No player characters loaded</p>
            ) : (
              playerChars.map((char) => (
                <IonCard key={char.id} style={{ '--background': '#16213e' } as any}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1.1rem' }}>
                      {char.name}
                      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 8 }}>
                        {char.race} {char.className}
                      </span>
                    </IonCardTitle>
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

        {/* ── NPCs Tab ── */}
        {activeTab === 'npcs' && (
          <div>
            {/* NPC Creator */}
            <IonCard style={{ '--background': '#16213e' } as any}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.1rem' }}>Create NPC</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonInput
                  label="Name"
                  labelPlacement="floating"
                  value={npcName}
                  onIonInput={(e) => setNpcName(e.detail.value || '')}
                  style={{ marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <IonInput
                    label="Species"
                    labelPlacement="floating"
                    value={npcRace}
                    onIonInput={(e) => setNpcRace(e.detail.value || '')}
                  />
                  <IonInput
                    label="Class"
                    labelPlacement="floating"
                    value={npcClass}
                    onIonInput={(e) => setNpcClass(e.detail.value || '')}
                  />
                </div>
                <IonButton
                  expand="block"
                  onClick={handleCreateNpc}
                  disabled={!npcName.trim()}
                  style={{ marginTop: 12 }}
                  color="tertiary"
                >
                  Create NPC
                </IonButton>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>
                  Creates an NPC with default d6 stats. Edit stats from the Players tab after creation.
                </p>
              </IonCardContent>
            </IonCard>

            {/* NPC List */}
            {npcs.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', marginTop: 16 }}>No NPCs created yet</p>
            ) : (
              npcs.map((npc) => (
                <IonCard key={npc.id} style={{ '--background': '#16213e' } as any}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1.1rem' }}>
                      {npc.name}
                      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 8 }}>
                        {npc.race} {npc.className}
                      </span>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <EnergyBar
                      current={npc.energy}
                      max={npc.energyMax}
                      canEdit={true}
                      onAdjust={(delta) => handleEnergyAdjust(npc.id, delta)}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4 }}>
                      Stats: {Object.entries(npc.stats).map(([k, v]) =>
                        `${k}: ${v.map((d: any) => `d${d.sides}`).join('+')}`
                      ).join(' | ')}
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

        {/* ── Episode Tab ── */}
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
      </IonContent>
    </IonPage>
  );
};

export default GmPanelPage;
