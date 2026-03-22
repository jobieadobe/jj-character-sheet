import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Session } from '@heroiclabs/nakama-js';
import * as auth from '../services/nakama/auth';

interface NakamaState {
  session: Session | null;
  loading: boolean;
  error: string | null;
}

type NakamaAction =
  | { type: 'SET_SESSION'; session: Session | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

const initialState: NakamaState = {
  session: null,
  loading: true,
  error: null,
};

function reducer(state: NakamaState, action: NakamaAction): NakamaState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.session, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

interface NakamaContextValue {
  state: NakamaState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const NakamaContext = createContext<NakamaContextValue | null>(null);

export function NakamaProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    auth.restoreSession()
      .then(async (session) => {
        if (session) {
          await auth.connectSocket(session);
        }
        dispatch({ type: 'SET_SESSION', session });
      })
      .catch(() => {
        dispatch({ type: 'SET_SESSION', session: null });
      });
  }, []);

  const loginFn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const session = await auth.login(email, password);
      await auth.connectSocket(session);
      dispatch({ type: 'SET_SESSION', session });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err?.message || err?.statusText || 'Login failed. Check your credentials.';
      dispatch({ type: 'SET_ERROR', error: msg });
      throw err;
    }
  };

  const registerFn = async (email: string, password: string, username: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const session = await auth.register(email, password, username);
      await auth.connectSocket(session);
      dispatch({ type: 'SET_SESSION', session });
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Registration failed.';
      if (err?.status === 409) {
        msg = 'An account with that email already exists.';
      } else if (err?.message) {
        msg = err.message;
      }
      dispatch({ type: 'SET_ERROR', error: msg });
      throw err;
    }
  };

  const logoutFn = async () => {
    await auth.logout();
    dispatch({ type: 'SET_SESSION', session: null });
  };

  return (
    <NakamaContext.Provider value={{ state, login: loginFn, register: registerFn, logout: logoutFn }}>
      {children}
    </NakamaContext.Provider>
  );
}

export function useNakama(): NakamaContextValue {
  const ctx = useContext(NakamaContext);
  if (!ctx) throw new Error('useNakama must be used within NakamaProvider');
  return ctx;
}
