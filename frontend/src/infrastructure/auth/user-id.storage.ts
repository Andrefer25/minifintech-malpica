const STORAGE_KEY = 'mf.xUserId';
const TTL_MS = 60 * 60 * 1000;

interface StoredUserId {
  id: string;
  expiresAt: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

function readStored(): StoredUserId | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredUserId>;
    if (
      !parsed ||
      typeof parsed.id !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      !UUID_REGEX.test(parsed.id)
    ) {
      return null;
    }
    return { id: parsed.id, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function writeStored(value: StoredUserId): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* sessionStorage no disponible: se regenerar en la prxima llamada */
  }
}

export function getUserId(): string {
  const stored = readStored();
  if (stored && Date.now() < stored.expiresAt) {
    return stored.id;
  }
  const fresh: StoredUserId = {
    id: generateUserId(),
    expiresAt: Date.now() + TTL_MS,
  };
  writeStored(fresh);
  return fresh.id;
}

export function clearUserId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
