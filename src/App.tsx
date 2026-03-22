import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { NakamaProvider, useNakama } from './state/NakamaContext';
import { GameSessionProvider } from './state/GameSessionContext';
import { CharacterProvider } from './state/CharacterContext';
import { RollLogProvider } from './state/RollLogContext';

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

// Route guard: redirects to login if not authenticated
const PrivateRoute: React.FC<{ component: React.FC<any>; path: string; exact?: boolean }> = ({
  component: Component,
  ...rest
}) => {
  const { state } = useNakama();
  return (
    <Route
      {...rest}
      render={(props) =>
        state.session ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

// Route guard: redirects to lobby if already authenticated
const PublicRoute: React.FC<{ component: React.FC<any>; path: string; exact?: boolean }> = ({
  component: Component,
  ...rest
}) => {
  const { state } = useNakama();
  return (
    <Route
      {...rest}
      render={(props) =>
        !state.session ? <Component {...props} /> : <Redirect to="/lobby" />
      }
    />
  );
};

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

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <PublicRoute path="/login" component={LoginPage} exact />
        <PrivateRoute path="/lobby" component={LobbyPage} exact />
        <PrivateRoute path="/game/:matchId" component={GamePage} exact />
        <PrivateRoute path="/game/:matchId/gm" component={GmPanelPage} exact />
        <Route exact path="/">
          <Redirect to={state.session ? '/lobby' : '/login'} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <NakamaProvider>
      <GameSessionProvider>
        <CharacterProvider>
          <RollLogProvider>
            <AppRoutes />
          </RollLogProvider>
        </CharacterProvider>
      </GameSessionProvider>
    </NakamaProvider>
  </IonApp>
);

export default App;
