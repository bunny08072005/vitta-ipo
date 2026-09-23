import { fetchIndianApiIPOs } from './indianApi.js';
import { fetchNseIPOs } from './nseApi.js';
import { mergeSources } from './merge.js';
import { memoryGet, memorySet } from './cache.js';

const LIST_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = 'ipos:list';

export async function getAggregatedList() {
  const cached = memoryGet(CACHE_KEY);
  if (cached) return cached;

  const [indianApiList, nseList] = await Promise.all([
    fetchIndianApiIPOs(),
    fetchNseIPOs(),
  ]);

  const merged = mergeSources(indianApiList, nseList);
  memorySet(CACHE_KEY, merged, LIST_TTL_MS);
  return merged;
}

export async function getIPOBySlug(slug) {
  const list = await getAggregatedList();
  return list.find(i => i.id === slug) || null;
}
