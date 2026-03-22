import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput,
  IonList, IonItem, IonLabel, IonButtons, IonIcon,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useNakama } from '../state/NakamaContext';
import { useGameSession } from '../state/GameSessionContext';
import { createMatch, joinMatch } from '../services/nakama/match';
import { useHistory } from 'react-router-dom';

const LobbyPage: React.FC = () => {
  const { state: nakamaState, logout } = useNakama();
  const { dispatch } = useGameSession();
  const history = useHistory();
  const [joinId, setJoinId] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    try {
      const match = await createMatch();
      dispatch({
        type: 'SET_SESSION',
        session: {
          matchId: match.match_id,
          name: sessionName || 'New Session',
          episodeNumber: 1,
          episodeStatus: 'active',
          members: [
            {
              userId: nakamaState.session!.user_id!,
              username: nakamaState.session!.username!,
              role: 'gm',
              characterId: null,
            },
          ],
          createdBy: nakamaState.session!.user_id!,
        },
      });
      dispatch({ type: 'SET_MY_ROLE', role: 'gm' });
      history.push(`/game/${match.match_id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    try {
      const match = await joinMatch(joinId.trim());
      dispatch({
        type: 'SET_SESSION',
        session: {
          matchId: match.match_id,
          name: 'Joined Session',
          episodeNumber: 1,
          episodeStatus: 'active',
          members: [],
          createdBy: '',
        },
      });
      dispatch({ type: 'SET_MY_ROLE', role: 'player' });
      history.push(`/game/${match.match_id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1a1a2e' } as any}>
          <IonTitle style={{ color: '#e94560' }}>J&J Lobby</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={logout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#1a1a2e' } as any}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <IonCard style={{ '--background': '#16213e' } as any}>
            <IonCardHeader>
              <IonCardTitle>Create Game Session</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput
                label="Session Name"
                labelPlacement="floating"
                value={sessionName}
                onIonInput={(e) => setSessionName(e.detail.value || '')}
              />
              <IonButton expand="block" onClick={handleCreate} style={{ marginTop: 12 }}>
                Create as GM
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard style={{ '--background': '#16213e' } as any}>
            <IonCardHeader>
              <IonCardTitle>Join Game Session</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput
                label="Match ID"
                labelPlacement="floating"
                value={joinId}
                onIonInput={(e) => setJoinId(e.detail.value || '')}
              />
              <IonButton expand="block" onClick={handleJoin} style={{ marginTop: 12 }}>
                Join as Player
              </IonButton>
            </IonCardContent>
          </IonCard>

          {error && (
            <p style={{ color: '#e94560', textAlign: 'center' }}>{error}</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LobbyPage;
