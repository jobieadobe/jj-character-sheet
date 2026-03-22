import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameSession, SessionMember, PlayerRole } from '../models/session';
import { sendMatchMessage } from '../services/nakama/match';
import { OpCode } from '../services/nakama/opcodes';

interface GameSessionState {
  session: GameSession | null;
  myRole: PlayerRole;
  connected: boolean;
}

type GameSessionAction =
  | { type: 'SET_SESSION'; session: GameSession }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_MY_ROLE'; role: PlayerRole }
  | { type: 'UPDATE_MEMBERS'; members: SessionMember[] }
  | { type: 'SET_EPISODE'; number: number; status: GameSession['episodeStatus'] }
  | { type: 'SET_CONNECTED'; connected: boolean };

const initialState: GameSessionState = {
  session: null,
  myRole: 'player',
  connected: false,
};

function reducer(state: GameSessionState, action: GameSessionAction): GameSessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.session, connected: true };
    case 'CLEAR_SESSION':
      return { ...initialState };
    case 'SET_MY_ROLE':
      return { ...state, myRole: action.role };
    case 'UPDATE_MEMBERS':
      return state.session
        ? { ...state, session: { ...state.session, members: action.members } }
        : state;
    case 'SET_EPISODE':
      return state.session
        ? {
            ...state,
            session: {
              ...state.session,
              episodeNumber: action.number,
              episodeStatus: action.status,
            },
          }
        : state;
    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };
    default:
      return state;
  }
}

interface GameSessionContextValue {
  state: GameSessionState;
  dispatch: React.Dispatch<GameSessionAction>;
  startNewEpisode: () => void;
  startLevelUp: () => void;
  endLevelUp: () => void;
}

const GameSessionContext = createContext<GameSessionContextValue | null>(null);

export function GameSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startNewEpisode = useCallback(() => {
    if (!state.session) return;
    const newEp = state.session.episodeNumber + 1;
    dispatch({ type: 'SET_EPISODE', number: newEp, status: 'active' });
    sendMatchMessage(state.session.matchId, OpCode.NEW_EPISODE, {
      episodeNumber: newEp,
    });
  }, [state.session]);

  const startLevelUp = useCallback(() => {
    if (!state.session) return;
    dispatch({ type: 'SET_EPISODE', number: state.session.episodeNumber, status: 'leveling' });
    sendMatchMessage(state.session.matchId, OpCode.LEVEL_UP_START, {});
  }, [state.session]);

  const endLevelUp = useCallback(() => {
    if (!state.session) return;
    dispatch({ type: 'SET_EPISODE', number: state.session.episodeNumber, status: 'completed' });
    sendMatchMessage(state.session.matchId, OpCode.LEVEL_UP_END, {});
  }, [state.session]);

  return (
    <GameSessionContext.Provider value={{ state, dispatch, startNewEpisode, startLevelUp, endLevelUp }}>
      {children}
    </GameSessionContext.Provider>
  );
}

export function useGameSession(): GameSessionContextValue {
  const ctx = useContext(GameSessionContext);
  if (!ctx) throw new Error('useGameSession must be used within GameSessionProvider');
  return ctx;
}
