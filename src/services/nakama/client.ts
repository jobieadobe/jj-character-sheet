import { Client, Session, Socket } from '@heroiclabs/nakama-js';

const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || 'localhost';
const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || '7350';
const NAKAMA_USE_SSL = import.meta.env.VITE_NAKAMA_SSL === 'true';
const NAKAMA_KEY = import.meta.env.VITE_NAKAMA_KEY || 'defaultkey';

let clientInstance: Client | null = null;
let sessionInstance: Session | null = null;
let socketInstance: Socket | null = null;

export function getClient(): Client {
  if (!clientInstance) {
    clientInstance = new Client(NAKAMA_KEY, NAKAMA_HOST, NAKAMA_PORT, NAKAMA_USE_SSL);
  }
  return clientInstance;
}

export function getSession(): Session | null {
  return sessionInstance;
}

export function setSession(session: Session | null): void {
  sessionInstance = session;
  if (session) {
    localStorage.setItem('nakama_token', session.token);
    localStorage.setItem('nakama_refresh_token', session.refresh_token);
  } else {
    localStorage.removeItem('nakama_token');
    localStorage.removeItem('nakama_refresh_token');
  }
}

export function getSocket(): Socket | null {
  return socketInstance;
}

export function setSocket(socket: Socket | null): void {
  socketInstance = socket;
}

export async function createSocket(): Promise<Socket> {
  const client = getClient();
  const socket = client.createSocket(NAKAMA_USE_SSL, false);
  setSocket(socket);
  return socket;
}
