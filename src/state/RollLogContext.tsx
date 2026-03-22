import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { RollLogEntry } from '../models/log';

interface RollLogState {
  entries: RollLogEntry[];
}

type RollLogAction =
  | { type: 'ADD_ENTRY'; entry: RollLogEntry }
  | { type: 'CLEAR_LOG' }
  | { type: 'SET_LOG'; entries: RollLogEntry[] };

const initialState: RollLogState = {
  entries: [],
};

function reducer(state: RollLogState, action: RollLogAction): RollLogState {
  switch (action.type) {
    case 'ADD_ENTRY':
      return { entries: [...state.entries, action.entry] };
    case 'CLEAR_LOG':
      return { entries: [] };
    case 'SET_LOG':
      return { entries: action.entries };
    default:
      return state;
  }
}

interface RollLogContextValue {
  state: RollLogState;
  addEntry: (entry: RollLogEntry) => void;
  clearLog: () => void;
  exportLog: () => string;
}

const RollLogContext = createContext<RollLogContextValue | null>(null);

export function RollLogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addEntry = useCallback((entry: RollLogEntry) => {
    dispatch({ type: 'ADD_ENTRY', entry });
  }, []);

  const clearLog = useCallback(() => {
    dispatch({ type: 'CLEAR_LOG' });
  }, []);

  const exportLog = useCallback(() => {
    return state.entries.map((e) => `[${e.timestamp}] ${e.formatted}`).join('\n');
  }, [state.entries]);

  return (
    <RollLogContext.Provider value={{ state, addEntry, clearLog, exportLog }}>
      {children}
    </RollLogContext.Provider>
  );
}

export function useRollLog(): RollLogContextValue {
  const ctx = useContext(RollLogContext);
  if (!ctx) throw new Error('useRollLog must be used within RollLogProvider');
  return ctx;
}
