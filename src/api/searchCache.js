// src/api/searchCache.js
// Cache wyników Google Places
// Warstwa 1: Map() w pamięci — zero latencji, przeżywa re-rendery, reset przy F5
// Warstwa 2: sessionStorage — przeżywa odświeżenie strony, reset po zamknięciu karty
// TTL: 10 minut

import { logCacheHit, logRequest } from './requestLogger.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_PREFIX = 'fk_search_';
const MAX_CACHE_ENTRIES = 50;

// ─── Warstwa 1: in-memory Map ─────────────────────────────────────────────────
// Pierwsza linia obrony — odpowiedź natychmiastowa, zero overhead JSON.parse
// Resetuje się przy każdym F5 (czyli przy Vite HMR też — OK, bo sessionStorage przejmuje)
const memCache = new Map(); // key → { data, timestamp }

// ─── In-flight deduplication ──────────────────────────────────────────────────
// Jeśli dwa wywołania startują z tym samym kluczem zanim pierwsze wróci
// (React StrictMode, double-invoke, race condition) — drugie czeka na pierwsze
const inFlight = new Map(); // key → Promise<Array>

export { inFlight }; // eksponuj dla googlePlacesService

// ─── Klucz cache ─────────────────────────────────────────────────────────────

/**
 * Generuje klucz cache z parametrów wyszukiwania.
 * Współrzędne zaokrąglone do 3 miejsc (~100m) → więcej trafień cache gdy
 * użytkownik wybiera to samo miasto z nieznacznie różnych koordynatów.
 */
export function makeCacheKey(lat, lng, radius, type, keyword) {
  const rLat = parseFloat(lat).toFixed(3);
  const rLng = parseFloat(lng).toFixed(3);
  return `${CACHE_PREFIX}${rLat}_${rLng}_${radius}_${type || ''}_${keyword || ''}`;
}

// ─── Odczyt ───────────────────────────────────────────────────────────────────

/**
 * Pobiera wyniki z cache (mem → sessionStorage → null).
 * Loguje wynik do requestLogger.
 * @returns {Array|null}
 */
export function getCached(key) {
  // 1. Mem cache — najszybszy
  const mem = memCache.get(key);
  if (mem) {
    const age = Date.now() - mem.timestamp;
    if (age <= CACHE_TTL_MS) {
      logCacheHit('search', key, { source: 'memory', ageS: Math.round(age / 1000) });
      return mem.data;
    }
    memCache.delete(key); // wygasł
  }

  // 2. sessionStorage — przeżywa F5
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;

    if (age > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }

    // Wróć do mem cache żeby następne odwołanie było jeszcze szybsze
    memCache.set(key, { data, timestamp });

    logCacheHit('search', key, { source: 'sessionStorage', ageS: Math.round(age / 1000) });
    return data;
  } catch {
    return null;
  }
}

// ─── Zapis ────────────────────────────────────────────────────────────────────

/**
 * Zapisuje wyniki do obu warstw cache.
 */
export function setCached(key, data) {
  const timestamp = Date.now();

  // 1. Zawsze zapisz do mem cache
  memCache.set(key, { data, timestamp });

  // 2. Spróbuj sessionStorage (może być niedostępne w SSR / private mode)
  try {
    pruneSessionStorage();
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp }));
  } catch (err) {
    // sessionStorage pełne lub niedostępne — mem cache wystarczy
    if (import.meta.env.DEV) {
      console.warn('[FK cache] sessionStorage niedostępne:', err.message);
    }
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

function pruneSessionStorage() {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
    }

    // Usuń wygasłe
    for (const k of keys) {
      try {
        const { timestamp } = JSON.parse(sessionStorage.getItem(k) || '{}');
        if (Date.now() - (timestamp || 0) > CACHE_TTL_MS) sessionStorage.removeItem(k);
      } catch {
        sessionStorage.removeItem(k);
      }
    }

    // Ogranicz rozmiar — usuń najstarsze
    const live = keys.filter((k) => sessionStorage.getItem(k));
    if (live.length >= MAX_CACHE_ENTRIES) {
      live
        .map((k) => {
          try { return { k, t: JSON.parse(sessionStorage.getItem(k)).timestamp }; }
          catch { return { k, t: 0 }; }
        })
        .sort((a, b) => a.t - b.t)
        .slice(0, 10)
        .forEach(({ k }) => sessionStorage.removeItem(k));
    }
  } catch {
    // ignoruj
  }
}

/**
 * Czyści obie warstwy cache FelioKids (np. przycisk "odśwież").
 */
export function clearCache() {
  memCache.clear();
  try {
    const toDelete = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) toDelete.push(k);
    }
    toDelete.forEach((k) => sessionStorage.removeItem(k));
    if (import.meta.env.DEV) {
      console.log(`[FK cache] wyczyszczono: ${toDelete.length} sessionStorage + mem`);
    }
  } catch {
    // ignoruj
  }
}
