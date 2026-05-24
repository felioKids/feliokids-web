// src/api/eventsService.js
// Pobiera wydarzenia (brocantes, festiwale, marchés) z proxy /api/events
// Używa cache sessionStorage żeby nie dublować requestów

const CACHE_TTL = 30 * 60 * 1000; // 30 minut

function getCacheKey(lat, lng, radius, days) {
  return `fk_events_${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}_${days}`;
}

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function setCached(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/**
 * Pobiera wydarzenia w pobliżu
 * @param {{ lat, lng, radiusKm, days }} params
 * @returns {Promise<Array>}
 */
export async function fetchNearbyEvents({ lat, lng, radiusKm = 20, days = 7 }) {
  const key = getCacheKey(lat, lng, radiusKm, days);

  const cached = getCached(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radiusKm.toString(),
    days: days.toString(),
  });

  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur API events: ${res.status}`);
  }

  const data = await res.json();
  const events = data.events || [];

  setCached(key, events);
  return events;
}

// ─── Helpers pour affichage ───────────────────────────────────────────────────

/**
 * Formate une date en français
 * "2026-05-24T08:00:00" → "Dim. 24 mai · 8h00"
 */
export function formatEventDate(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const month = months[d.getMonth()];
    const h = d.getHours();
    const m = d.getMinutes();
    const time = m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
    return `${dayName} ${dayNum} ${month} · ${time}`;
  } catch { return null; }
}

/**
 * Emoji par catégorie d'événement
 */
export function getCategoryEmoji(category) {
  const map = {
    brocante: '🏺',
    festival: '🎪',
    marche: '🛒',
    concert: '🎵',
    evenement: '🎉',
  };
  return map[category] || '🎉';
}

/**
 * Calcule si l'événement est ce weekend
 */
export function isThisWeekend(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  const day = d.getDay(); // 0=dim, 6=sam
  const diffDays = Math.floor((d - now) / (1000 * 60 * 60 * 24));
  return (day === 0 || day === 6) && diffDays >= 0 && diffDays <= 7;
}
