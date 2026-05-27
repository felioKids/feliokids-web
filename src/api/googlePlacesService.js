// src/api/googlePlacesService.js
// Wyszukiwanie przez Google Places Nearby Search API (przez proxy Vercel)
// Zabezpieczenia przed duplikacją requestów:
//   1. in-memory Map cache (TTL 10min, zero latencji)
//   2. sessionStorage cache (TTL 10min, przeżywa F5)
//   3. in-flight deduplication (ten sam request w locie → czeka, nie duplikuje)

import { makeCacheKey, getCached, setCached, inFlight } from './searchCache.js';
import { logRequest, logInflight } from './requestLogger.js';

// ─── Fallbacki kategoryjne (Unsplash) ────────────────────────────────────────
const CATEGORY_FALLBACK_PHOTOS = {
  parc:        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  zoo:         'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&q=80',
  musee:       'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80',
  sport:       'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=600&q=80',
  cinema:      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  piscine:     'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80',
  plage:       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  restaurant:  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  default:     'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80',
};

export function getCategoryFallbackPhoto(catId) {
  return CATEGORY_FALLBACK_PHOTOS[catId] || CATEGORY_FALLBACK_PHOTOS.default;
}

export function buildPhotoUrl(photoReference, maxwidth = 600) {
  if (!photoReference) return null;
  return `/api/photo?photo_reference=${encodeURIComponent(photoReference)}&maxwidth=${maxwidth}`;
}

// ─── Główna funkcja wyszukiwania ──────────────────────────────────────────────
export async function searchActivitiesGoogle({ lat, lng, radius, type, keyword, catId, textsearch }) {
  const cacheKey = makeCacheKey(lat, lng, radius, type, keyword);

  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (inFlight.has(cacheKey)) {
    logInflight('search', cacheKey);
    return inFlight.get(cacheKey);
  }

  logRequest('search', cacheKey, { lat, lng, radius, type, keyword, catId });

  const fetchPromise = _doFetch({ lat, lng, radius, type, keyword, catId, textsearch })
    .then((results) => {
      setCached(cacheKey, results);
      return results;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, fetchPromise);

  return fetchPromise;
}

// ─── Wewnętrzna funkcja fetch ─────────────────────────────────────────────────
async function _doFetch({ lat, lng, radius, type, keyword, catId, textsearch }) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
    language: 'fr',
  });
  if (type) params.set('type', type);
if (keyword) params.set('keyword', keyword);
if (textsearch) params.set('textsearch', 'true');

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erreur API: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places: ${data.status} — ${data.error_message || ''}`);
  }

 const BLOCKED_TYPES = new Set([
  'supermarket', 'grocery_or_supermarket', 'store', 'home_goods_store',
  'hardware_store', 'furniture_store', 'clothing_store', 'shoe_store',
  'shopping_mall', 'department_store', 'florist', 'pet_store',
  'car_dealer', 'car_repair', 'gas_station', 'bank', 'atm',
  'pharmacy', 'doctor', 'dentist', 'hospital', 'real_estate_agency',
  'insurance_agency', 'lawyer', 'accounting', 'electrician', 'plumber',
  'general_contractor', 'roofing_contractor', 'painter',
  'moving_company', 'storage', 'locksmith', 'travel_agency',
]);

const BLOCKED_NAME_KEYWORDS = [
  // Remonty / budowlanka
  'travaux', 'couvreur', 'plombier', 'électricien', 'maçon',
  'peintre', 'menuisier', 'charpentier', 'isolation', 'toiture',
  'assurance', 'avocat', 'notaire', 'comptable', 'agence immobilière',
  // Zdrowie / terapia
  'thérapeute', 'therapeute', 'psychologue', 'ostéopathe', 'osteopathe',
  'kinésithérapeute', 'kinesitherapeute', 'sophrologue', 'naturopathe',
  'médecin', 'medecin', 'cabinet médical', 'infirmier', 'infirmière',
  // Mistyka / afrykańskie
  'medium', 'marabout', 'voyant', 'voyante', 'guérisseur', 'guerisseur',
  'sorcier', 'envoûtement', 'envouter', 'retour affectif', 'charlatan',
  // Restauracje / bary / tabac
  'tabac', 'chicha', 'kebab', 'brasserie', 'bistro', 'bistrot',
  'cantine', 'turkish food', 'seoul bbq', 'snack', 'boucherie',
  // Samochody / przejazdy
  'auto', 'conduite', 'driving', 'automobile', 'garage', 'carrosserie',
  'concessionnaire', 'location voiture', 'taxi', 'transport',
  // Inne
  'conception et installation', 'conseil pour votre', 'diaconesses',
];
const results = data.results || [];

const activities = results
  .filter((place) => place.business_status !== 'CLOSED_PERMANENTLY')
  .filter((place) => !place.types?.some(t => BLOCKED_TYPES.has(t)))
  .filter((place) => !BLOCKED_NAME_KEYWORDS.some(k => place.name?.toLowerCase().includes(k)))
  .map((place) => ({
      id:             place.place_id,
      place_id:       place.place_id,
      name:           place.name,
      address:        place.vicinity || '',
      rating:         place.rating || null,
      ratingsTotal:   place.user_ratings_total || 0,
      types:          place.types || [],
      lat:            place.geometry?.location?.lat,
      lng:            place.geometry?.location?.lng,
      geometry:       place.geometry,           // ← DODANE: potrzebne do przycisków Parking/Manger
      openNow:        place.opening_hours?.open_now ?? null, // ← DODANE: badge Ouvert/Fermé
      photoReference: place.photos?.[0]?.photo_reference || null,
      fallbackPhoto:  getCategoryFallbackPhoto(catId),
      source:         'google',
      catId:          catId || null,
    }));

  // Deduplikacja po place_id
  const seen = new Set();
  const unique = activities.filter((a) => {
    if (seen.has(a.place_id)) return false;
    seen.add(a.place_id);
    return true;
  });

  // Filtrowanie po rzeczywistym dystansie — Google czasem zwraca wyniki poza promieniem
const radiusKm = radius / 1000;
const filtered = unique.filter(a => haversine(lat, lng, a.lat, a.lng) <= radiusKm);

// Sortowanie po dystansie od centrum
filtered.sort((a, b) => haversine(lat, lng, a.lat, a.lng) - haversine(lat, lng, b.lat, b.lng));

return filtered;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  if (!lat2 || !lng2) return Infinity;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
