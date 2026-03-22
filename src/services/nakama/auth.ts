import { Session } from '@heroiclabs/nakama-js';
import { getClient, setSession, createSocket, getSocket } from './client';

export async function login(email: string, password: string): Promise<Session> {
  const client = getClient();
  const session = await client.authenticateEmail(email, password, false);
  setSession(session);
  return session;
}

export async function register(email: string, password: string, username: string): Promise<Session> {
  const client = getClient();
  const session = await client.authenticateEmail(email, password, true, username);
  setSession(session);
  return session;
}

export async function connectSocket(session: Session): Promise<void> {
  const socket = await createSocket();
  await socket.connect(session, true);
}

export async function restoreSession(): Promise<Session | null> {
  const token = localStorage.getItem('nakama_token');
  const refreshToken = localStorage.getItem('nakama_refresh_token');
  if (!token || !refreshToken) return null;

  const client = getClient();
  let session = Session.restore(token, refreshToken);

  if (session.isexpired(Date.now() / 1000)) {
    try {
      session = await client.sessionRefresh(session);
      setSession(session);
    } catch {
      setSession(null);
      return null;
    }
  } else {
    setSession(session);
  }

  return session;
}

export async function logout(): Promise<void> {
  const socket = getSocket();
  if (socket) {
    socket.disconnect(true);
  }
  setSession(null);
}
