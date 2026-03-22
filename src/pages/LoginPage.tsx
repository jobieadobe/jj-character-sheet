import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonSegment, IonSegmentButton, IonLabel,
  IonText, IonSpinner,
} from '@ionic/react';
import { useNakama } from '../state/NakamaContext';

const LoginPage: React.FC = () => {
  const { state, login, register } = useNakama();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setLocalError('Username is required');
          return;
        }
        await register(email, password, username);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ '--background': '#1a1a2e' } as any}>
        <div style={{ maxWidth: 400, margin: '60px auto' }}>
          <h1 style={{ textAlign: 'center', color: '#e94560', fontFamily: 'serif', fontSize: '2rem' }}>
            J&J Character Sheet
          </h1>
          <IonCard style={{ '--background': '#16213e' } as any}>
            <IonCardHeader>
              <IonSegment value={mode} onIonChange={(e) => setMode(e.detail.value as any)}>
                <IonSegmentButton value="login"><IonLabel>Login</IonLabel></IonSegmentButton>
                <IonSegmentButton value="register"><IonLabel>Register</IonLabel></IonSegmentButton>
              </IonSegment>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <IonInput
                    label="Username"
                    labelPlacement="floating"
                    type="text"
                    value={username}
                    onIonInput={(e) => setUsername(e.detail.value || '')}
                    style={{ marginBottom: 12 }}
                  />
                )}
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value || '')}
                  style={{ marginBottom: 12 }}
                />
                <IonInput
                  label="Password"
                  labelPlacement="floating"
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value || '')}
                  style={{ marginBottom: 16 }}
                />
                {(localError || state.error) && (
                  <IonText color="danger">
                    <p style={{ fontSize: '0.85rem' }}>{localError || state.error}</p>
                  </IonText>
                )}
                <IonButton expand="block" type="submit" disabled={state.loading}>
                  {state.loading ? <IonSpinner /> : mode === 'login' ? 'Login' : 'Register'}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
