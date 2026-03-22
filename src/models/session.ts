export type PlayerRole = 'gm' | 'co-gm' | 'player';

export interface SessionMember {
  userId: string;
  username: string;
  role: PlayerRole;
  characterId: string | null;
}

export interface GameSession {
  matchId: string;
  name: string;
  episodeNumber: number;
  episodeStatus: 'active' | 'leveling' | 'completed';
  members: SessionMember[];
  createdBy: string;
}

export function isGmRole(role: PlayerRole): boolean {
  return role === 'gm' || role === 'co-gm';
}
