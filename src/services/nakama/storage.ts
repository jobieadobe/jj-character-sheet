import { getClient, getSession } from './client';
import { Character } from '../../models/character';

const COLLECTION_CHARACTERS = 'characters';
const COLLECTION_NPCS = 'npcs';

export async function saveCharacter(character: Character): Promise<void> {
  const client = getClient();
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const collection = character.isNpc ? COLLECTION_NPCS : COLLECTION_CHARACTERS;

  await client.writeStorageObjects(session, [
    {
      collection,
      key: character.id,
      value: character as unknown as Record<string, unknown>,
      permission_read: 2, // public read
      permission_write: 1, // owner write
    },
  ]);
}

export async function loadCharacter(userId: string, characterId: string, isNpc = false): Promise<Character | null> {
  const client = getClient();
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const collection = isNpc ? COLLECTION_NPCS : COLLECTION_CHARACTERS;

  const result = await client.readStorageObjects(session, {
    object_ids: [
      {
        collection,
        key: characterId,
        user_id: userId,
      },
    ],
  });

  if (result.objects && result.objects.length > 0) {
    return result.objects[0].value as unknown as Character;
  }
  return null;
}

export async function loadMyCharacters(): Promise<Character[]> {
  const client = getClient();
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const result = await client.listStorageObjects(session, COLLECTION_CHARACTERS, session.user_id, 100);
  return (result.objects || []).map((obj) => obj.value as unknown as Character);
}

export async function loadNpcs(gmUserId: string): Promise<Character[]> {
  const client = getClient();
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const result = await client.listStorageObjects(session, COLLECTION_NPCS, gmUserId, 100);
  return (result.objects || []).map((obj) => obj.value as unknown as Character);
}

export async function deleteCharacter(characterId: string, isNpc = false): Promise<void> {
  const client = getClient();
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const collection = isNpc ? COLLECTION_NPCS : COLLECTION_CHARACTERS;

  await client.deleteStorageObjects(session, {
    object_ids: [
      {
        collection,
        key: characterId,
      },
    ],
  });
}
