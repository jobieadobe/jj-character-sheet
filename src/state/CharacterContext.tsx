import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Character } from '../models/character';
import * as storage from '../services/nakama/storage';

interface CharacterState {
  myCharacter: Character | null;
  allCharacters: Character[]; // GM sees all
  npcs: Character[];
  loading: boolean;
}

type CharacterAction =
  | { type: 'SET_MY_CHARACTER'; character: Character | null }
  | { type: 'SET_ALL_CHARACTERS'; characters: Character[] }
  | { type: 'SET_NPCS'; npcs: Character[] }
  | { type: 'UPDATE_CHARACTER'; character: Character }
  | { type: 'SET_LOADING'; loading: boolean };

const initialState: CharacterState = {
  myCharacter: null,
  allCharacters: [],
  npcs: [],
  loading: false,
};

function reducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'SET_MY_CHARACTER':
      return { ...state, myCharacter: action.character };
    case 'SET_ALL_CHARACTERS':
      return { ...state, allCharacters: action.characters };
    case 'SET_NPCS':
      return { ...state, npcs: action.npcs };
    case 'UPDATE_CHARACTER': {
      const updated = action.character;
      const allChars = state.allCharacters.map((c) =>
        c.id === updated.id ? updated : c
      );
      const npcs = state.npcs.map((c) => (c.id === updated.id ? updated : c));
      const myChar =
        state.myCharacter?.id === updated.id ? updated : state.myCharacter;
      return { ...state, myCharacter: myChar, allCharacters: allChars, npcs };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

interface CharacterContextValue {
  state: CharacterState;
  dispatch: React.Dispatch<CharacterAction>;
  saveCharacter: (character: Character) => Promise<void>;
  loadMyCharacters: () => Promise<Character[]>;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const saveChar = useCallback(async (character: Character) => {
    await storage.saveCharacter(character);
    dispatch({ type: 'UPDATE_CHARACTER', character });
  }, []);

  const loadMyChars = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const chars = await storage.loadMyCharacters();
    dispatch({ type: 'SET_ALL_CHARACTERS', characters: chars });
    if (chars.length > 0 && !state.myCharacter) {
      dispatch({ type: 'SET_MY_CHARACTER', character: chars[0] });
    }
    dispatch({ type: 'SET_LOADING', loading: false });
    return chars;
  }, [state.myCharacter]);

  return (
    <CharacterContext.Provider value={{ state, dispatch, saveCharacter: saveChar, loadMyCharacters: loadMyChars }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used within CharacterProvider');
  return ctx;
}
