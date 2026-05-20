// src/api/requestLogger.js
// Centralny licznik requestów do Google — tylko w trybie development
// Użycie: import { logRequest, logCacheHit, printReport } from './requestLogger.js'

const IS_DEV = import.meta.env.DEV;

// Stan licznika — moduł-singleton (jeden per tab, reset przy F5)
const counters = {
  search: { sent: 0, blocked: 0 },   // /api/search → Google Places Nearby
  photo: { sent: 0, blocked: 0 },    // /api/photo → Google Places Photo
};

// Historia ostatnich requestów (max 100 wpisów)
const history = [];
const MAX_HISTORY = 100;

function ts() {
  return new Date().toLocaleTimeString('pl-PL', { hour12: false });
}

function push(entry) {
  history.push({ ...entry, time: ts() });
  if (history.length > MAX_HISTORY) history.shift();
}

// ─── Publiczne API ────────────────────────────────────────────────────────────

/**
 * Loguje faktyczny request do Google (cache miss / nowy fetch)
 * @param {'search'|'photo'} type
 * @param {string} key - klucz cache lub URL zdjęcia
 * @param {Object} [meta] - dodatkowe info (lat, lng, catId, ...)
 */
export function logRequest(type, key, meta = {}) {
  if (!IS_DEV) return;
  counters[type].sent++;
  push({ type, result: 'MISS → fetch', key, meta });

  const total = counters.search.sent + counters.photo.sent;
  console.log(
    `%c[FK ${type.toUpperCase()}] 🔴 FETCH #${counters[type].sent} (łącznie: ${total})`,
    'color: #FF6B4A; font-weight: bold',
    '\n  klucz:', key,
    meta.catId ? `\n  kat: ${meta.catId}` : '',
    meta.lat ? `\n  coords: ${meta.lat}, ${meta.lng}` : '',
  );
}

/**
 * Loguje trafienie w cache (request zablokowany)
 * @param {'search'|'photo'} type
 * @param {string} key
 * @param {Object} [meta]
 */
export function logCacheHit(type, key, meta = {}) {
  if (!IS_DEV) return;
  counters[type].blocked++;
  push({ type, result: 'HIT ✓', key, meta });

  console.log(
    `%c[FK ${type.toUpperCase()}] ✅ CACHE HIT (zablokowanych: ${counters[type].blocked})`,
    'color: #22a066; font-weight: bold',
    '\n  klucz:', key,
  );
}

/**
 * Loguje request zablokowany przez in-flight dedup
 * (ten sam request już w locie)
 * @param {'search'|'photo'} type
 * @param {string} key
 */
export function logInflight(type, key) {
  if (!IS_DEV) return;
  counters[type].blocked++;
  push({ type, result: 'IN-FLIGHT ✓', key });

  console.log(
    `%c[FK ${type.toUpperCase()}] ⏳ IN-FLIGHT (czeka na: ${key})`,
    'color: #999; font-weight: bold',
  );
}

/**
 * Drukuje podsumowanie requestów w konsoli
 * Wywołaj ręcznie: window.__fkReport() w DevTools
 */
export function printReport() {
  if (!IS_DEV) return;

  const totalSent = counters.search.sent + counters.photo.sent;
  const totalBlocked = counters.search.blocked + counters.photo.blocked;
  const savings = totalSent + totalBlocked > 0
    ? Math.round((totalBlocked / (totalSent + totalBlocked)) * 100)
    : 0;

  console.group('%c📊 FelioKids — Raport requestów Google', 'font-size: 14px; font-weight: bold; color: #FF6B4A');
  console.log('%cSearch (Places Nearby):', 'font-weight:bold',
    `wysłane: ${counters.search.sent} | zablokowane: ${counters.search.blocked}`);
  console.log('%cPhoto (Places Photo):', 'font-weight:bold',
    `wysłane: ${counters.photo.sent} | zablokowane: ${counters.photo.blocked}`);
  console.log('─────────────────────────────────────');
  console.log(`Łącznie wysłanych do Google: ${totalSent}`);
  console.log(`Łącznie zablokowanych (cache/dedup): ${totalBlocked}`);
  console.log(`%cOszczędność: ${savings}% requestów przechwycono`, savings >= 50 ? 'color: #22a066; font-weight: bold' : 'color: #FF6B4A');
  console.log('─────────────────────────────────────');
  console.log('Historia (ostatnie', history.length, 'zdarzeń):');
  console.table(history.map(h => ({
    czas: h.time,
    typ: h.type,
    wynik: h.result,
    klucz: h.key?.slice(0, 60) + (h.key?.length > 60 ? '…' : ''),
  })));
  console.groupEnd();
}

/**
 * Resetuje liczniki (np. po zmianie miasta)
 */
export function resetCounters() {
  if (!IS_DEV) return;
  counters.search.sent = 0;
  counters.search.blocked = 0;
  counters.photo.sent = 0;
  counters.photo.blocked = 0;
  history.length = 0;
  console.log('%c[FK] Liczniki requestów zresetowane', 'color: #999');
}

// Eksponuj na window w dev — wywołaj window.__fkReport() z konsoli
if (IS_DEV && typeof window !== 'undefined') {
  window.__fkReport = printReport;
  window.__fkResetCounters = resetCounters;
  window.__fkCounters = counters;   // live reference — zawsze aktualne

  // Autoraport co 30s jeśli cokolwiek się wydarzyło
  setInterval(() => {
    if (counters.search.sent + counters.photo.sent > 0) {
      console.log(
        `%c[FK] Auto-raport | search: ${counters.search.sent} sent / ${counters.search.blocked} cached | photo: ${counters.photo.sent} sent / ${counters.photo.blocked} cached`,
        'color: #888; font-size: 11px',
      );
    }
  }, 30_000);
}
