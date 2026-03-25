import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { NakamaProvider, useNakama } from './state/NakamaContext';
import { GameSessionProvider } from './state/GameSessionContext';
import { CharacterProvider } from './state/CharacterContext';
import { RollLogProvider } from './state/RollLogContext';
import { ThemeProvider } from './state/ThemeContext';
import StarfieldBackground from './components/background/StarfieldBackground';

import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import GmPanelPage from './pages/GmPanelPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode */
import '@ionic/react/css/palettes/dark.always.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact({
  mode: 'md',
});

const AppRoutes: React.FC = () => {
  const { state } = useNakama();

  if (state.loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#1a1a2e', color: '#e94560',
        fontSize: '1.2rem',
      }}>
        Loading...
      </div>
    );
  }

  // Use component prop (not render prop) for all routes — IonRouterOutlet
  // tracks pages by component identity, and render props create new closures
  // on every re-render which corrupts Ionic's page stack during navigation.
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" component={LoginPage} exact />
        <Route path="/lobby" component={LobbyPage} exact />
        <Route path="/game/:matchId" component={GamePage} exact />
        <Route path="/game/:matchId/gm" component={GmPanelPage} exact />
        <Route exact path="/">
          <Redirect to={state.session ? '/lobby' : '/login'} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <StarfieldBackground />
      <NakamaProvider>
        <GameSessionProvider>
          <CharacterProvider>
            <RollLogProvider>
              <AppRoutes />
            </RollLogProvider>
          </CharacterProvider>
        </GameSessionProvider>
      </NakamaProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
