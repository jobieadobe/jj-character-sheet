import { Match, MatchData } from '@heroiclabs/nakama-js';
import { getSocket, getSession } from './client';

export async function createMatch(): Promise<Match> {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  return await socket.createMatch();
}

export async function joinMatch(matchId: string): Promise<Match> {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  return await socket.joinMatch(matchId);
}

export async function leaveMatch(matchId: string): Promise<void> {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  await socket.leaveMatch(matchId);
}

export function sendMatchMessage(matchId: string, opCode: number, data: unknown): void {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  socket.sendMatchState(matchId, opCode, JSON.stringify(data));
}

export function onMatchData(callback: (data: MatchData) => void): void {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  socket.onmatchdata = callback;
}

export function onMatchPresence(callback: (event: any) => void): void {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');
  socket.onmatchpresence = callback;
}
