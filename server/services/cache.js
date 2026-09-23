import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_ROOT = path.join(__dirname, '..', '.cache');

/**
 * Tiny in-memory TTL cache. Used for the aggregated IPO list so we don't
 * hammer IndianAPI/NSE on every request.
 */
const store = new Map();

export function memoryGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function memorySet(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Disk-backed JSON cache. Used for AI analysis results and extracted DRHP
 * text — both are expensive to regenerate, so they're kept until the
 * underlying source data changes (caller controls that via the key).
 */
function diskPath(namespace, key) {
  const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
  return path.join(CACHE_ROOT, namespace, `${safeKey}.json`);
}

export function diskGet(namespace, key) {
  try {
    const raw = fs.readFileSync(diskPath(namespace, key), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function diskSet(namespace, key, value) {
  const filePath = diskPath(namespace, key);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
}
