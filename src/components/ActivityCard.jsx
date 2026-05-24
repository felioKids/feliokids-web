// src/components/ActivityCard.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import LazyImage from './LazyImage.jsx';

// ─── Kategorie BEZ przycisku parkingu ────────────────────────────────────────
const NO_PARKING_CATS = new Set(['halte']);
const NO_PARKING_TYPES = new Set([
  'shopping_mall', 'supermarket', 'department_store',
  'bowling_alley', 'stadium', 'airport',
]);
function showParkingButton(activity) {
  if (NO_PARKING_CATS.has(activity.catId)) return false;
  if (activity.types?.some(t => NO_PARKING_TYPES.has(t))) return false;
  return true;
}

// ─── Kategorie BEZ przycisku Réserver ────────────────────────────────────────
const NO_RESERVER_TYPES = new Set([
  'shopping_mall', 'supermarket', 'department_store',
  'park', 'library', 'school', 'church', 'cemetery',
  'locality', 'neighborhood', 'route',
]);
const NO_RESERVER_CATS = new Set(['gratuit', 'nature', 'halte']);

// Kategorie płatne → przycisk Réserver
const PAID_CATS = new Set(['anniversaire']);
const PAID_TYPES = new Set([
  'amusement_park', 'bowling_alley', 'movie_theater', 'aquarium', 'zoo',
]);
const PAID_KEYWORDS = [
  'cinéma', 'cinema', 'bowling', 'trampoline', 'laser', 'aquarium',
  'piscine', 'aquatique', 'karting', 'patinoire', 'escalade',
  'accrobranche', 'escape', 'karting', 'cirque', 'théâtre',
];

function isPaidActivity(activity) {
  if (NO_RESERVER_CATS.has(activity.catId)) return false;
  if (activity.types?.some(t => NO_RESERVER_TYPES.has(t))) return false;
  if (PAID_CATS.has(activity.catId)) return true;
  if (activity.types?.some(t => PAID_TYPES.has(t))) return true;
  const nameLower = (activity.name || '').toLowerCase();
  if (PAID_KEYWORDS.some(k => nameLower.includes(k))) return true;
  return false;
}

// ─── Linki ────────────────────────────────────────────────────────────────────
function getCallUrl(activity) {
  // Otwiera Google Maps na stronie miejsca — tam jest numer telefonu
  if (activity.place_id) {
    return `https://www.google.com/maps/place/?q=place_id:${activity.place_id}`
  }
  const dest = encodeURIComponent(`${activity.name}, ${activity.address || ''}`)
  return `https://www.google.com/maps/search/${dest}`
}
function getMapsUrl(activity) {
  const dest = encodeURIComponent(`${activity.name}, ${activity.address || ''}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
function getFunbookerUrl(activity) {
  const q = encodeURIComponent(activity.name || '');
  return `https://www.funbooker.com/fr/recherche?q=${q}&ref=feliokids`;
}

// ─── Fetch restaurants kids-friendly ─────────────────────────────────────────
// Szuka po kolei: McDo → Burger King → Pizza → Crêperie → ogólnie fast food
async function fetchKidsRestaurants(lat, lng) {
  const keywords = ['McDonald', 'Burger King', 'KFC', 'Quick', 'Subway', 'pizza', 'crêperie', 'kebab', 'Brioche Dorée'];
  const allResults = [];
  const seen = new Set();

  await Promise.all(keywords.map(async (kw) => {
    try {
      const params = new URLSearchParams({ lat, lng, radius: 1000, type: 'restaurant', keyword: kw, language: 'fr' });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      (data.results || []).slice(0, 2).forEach(r => {
        if (!seen.has(r.place_id)) {
          seen.add(r.place_id);
          allResults.push(r);
        }
      });
    } catch { /* ignore */ }
  }));

  // Sortuj po odległości (Google już to robi, ale mieszamy wyniki)
  return allResults.slice(0, 5);
}

async function fetchNearby(lat, lng, type) {
  const params = new URLSearchParams({ lat, lng, radius: 500, type, language: 'fr' });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error('fetch failed');
  const data = await res.json();
  return (data.results || []).slice(0, 4);
}

// ─── Mini-lista wyników ───────────────────────────────────────────────────────
function MiniList({ items, type, onClose, loading }) {
  const isParking = type === 'parking';
  const icon  = isParking ? '🅿️' : '🍔';
  const title = isParking ? 'Parkings à proximité' : 'Manger à proximité';

  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      zIndex: 100, padding: '12px', maxHeight: '220px', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: '#1a1a1a' }}>
          {title}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#aaa', padding: '0 2px' }}>✕</button>
      </div>

      <style>{`@keyframes fk-spin { to { transform: rotate(360deg); } }`}</style>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #FFE8E1', borderTopColor: '#FF6B4A', animation: 'fk-spin 0.7s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Outfit, sans-serif' }}>Recherche en cours...</span>
        </div>
      ) : items.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#aaa', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
          Aucun résultat trouvé.
        </p>
      ) : items.map((item, i) => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.name + ', ' + (item.vicinity || ''))}`;
        return (
          <a key={i} href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '7px 0', borderTop: i === 0 ? 'none' : '1px solid #f0e8e0',
            textDecoration: 'none', color: 'inherit',
          }}>
            <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </div>
              {item.vicinity && (
                <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.vicinity}
                </div>
              )}
            </div>
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              {item.rating && (
                <span style={{ fontSize: '11px', color: '#FF6B4A', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                  ★ {item.rating}
                </span>
              )}
              {item.opening_hours?.open_now !== undefined && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                  color: item.opening_hours.open_now ? '#22c55e' : '#ef4444',
                  whiteSpace: 'nowrap',
                }}>
                  {item.opening_hours.open_now ? '● Ouvert' : '● Fermé'}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ─── Przycisk akcji ───────────────────────────────────────────────────────────
function ActionBtn({ emoji, label, onClick, href, loading, active, style = {} }) {
  const base = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '2px', padding: '6px 4px',
    background: active ? '#FFE8E1' : '#f5f0ea',
    border: active ? '1.5px solid #FF6B4A' : '1.5px solid transparent',
    borderRadius: '10px', cursor: 'pointer', flex: 1,
    transition: 'background 0.15s, border-color 0.15s',
    textDecoration: 'none', ...style,
  };
  const inner = (
    <>
      <span style={{ fontSize: '16px', lineHeight: 1 }}>{loading ? '⏳' : emoji}</span>
      <span style={{ fontSize: '9.5px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: active ? '#FF6B4A' : '#555', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
        {label}
      </span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onClick={e => e.stopPropagation()}>{inner}</a>;
  return <button style={base} onClick={e => { e.stopPropagation(); onClick?.(); }}>{inner}</button>;
}

// ─── Główny komponent ─────────────────────────────────────────────────────────
export default function ActivityCard({ activity, onSelect, distanceKm }) {
  const { name, address, rating, ratingsTotal, photoReference, fallbackPhoto, openNow } = activity;

  const [parkingData, setParkingData] = useState(null);
  const [mangerData,  setMangerData]  = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const cardRef = useRef(null);

  const lat = activity.geometry?.location?.lat ?? activity.lat;
  const lng = activity.geometry?.location?.lng ?? activity.lng;
  const paid    = isPaidActivity(activity);
  const parking = showParkingButton(activity);
  const openStatus = openNow ?? activity.opening_hours?.open_now ?? null;

  useEffect(() => {
    if (!activePanel) return;
    function handleOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) setActivePanel(null);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePanel]);

  const handleParking = useCallback(async () => {
    if (activePanel === 'parking') { setActivePanel(null); return; }
    setActivePanel('parking');
    if (parkingData !== null) return;
    setParkingData('loading');
    try { setParkingData(await fetchNearby(lat, lng, 'parking')); }
    catch { setParkingData([]); }
  }, [lat, lng, activePanel, parkingData]);

  const handleManger = useCallback(async () => {
    if (activePanel === 'manger') { setActivePanel(null); return; }
    setActivePanel('manger');
    if (mangerData !== null) return;
    setMangerData('loading');
    try { setMangerData(await fetchKidsRestaurants(lat, lng)); }
    catch { setMangerData([]); }
  }, [lat, lng, activePanel, mangerData]);

  function formatDistance(km) {
    if (!km && km !== 0) return null;
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }
  const dist = formatDistance(distanceKm);

  return (
    <article
      ref={cardRef}
      className="activity-card"
      onClick={() => onSelect?.(activity)}
      style={{
        borderRadius: '16px', overflow: 'visible', background: '#FFF8F1',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
        <LazyImage photoReference={photoReference} fallbackSrc={fallbackPhoto} alt={name} style={{ height: '180px', width: '100%' }} />
        {openStatus !== null && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            background: openStatus ? 'rgba(34,197,94,0.92)' : 'rgba(239,68,68,0.88)',
            color: '#fff', fontSize: '10px', fontWeight: 700,
            fontFamily: 'Outfit, sans-serif', padding: '3px 8px',
            borderRadius: '20px', letterSpacing: '0.03em', backdropFilter: 'blur(4px)',
          }}>
            {openStatus ? '● Ouvert' : '● Fermé'}
          </span>
        )}
      </div>

      <div style={{ padding: '14px 16px 12px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {name}
        </h3>
        {address && (
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontFamily: 'Outfit, sans-serif', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            📍 {address}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {rating && (
            <span style={{ fontSize: '12px', color: '#FF6B4A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }} title={`${ratingsTotal} avis`}>
              ★ {rating.toFixed(1)}
              <span style={{ color: '#aaa', fontWeight: 400, marginLeft: '3px' }}>({ratingsTotal > 999 ? '999+' : ratingsTotal})</span>
            </span>
          )}
          {dist && (
            <span style={{ fontSize: '11px', background: '#FFE8E1', color: '#FF6B4A', padding: '2px 8px', borderRadius: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {dist}
            </span>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          {activePanel === 'parking' && (
            <MiniList items={parkingData || []} type="parking" loading={parkingData === 'loading'} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'manger' && (
            <MiniList items={mangerData || []} type="manger" loading={mangerData === 'loading'} onClose={() => setActivePanel(null)} />
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <ActionBtn emoji="🗺️" label="Itinéraire" href={getMapsUrl(activity)} />
            {activity.catId === 'anniversaire' && (
              <ActionBtn emoji="📞" label="Appeler" href={getCallUrl(activity)} />
            )}
            {parking && (
              <ActionBtn emoji="🅿️" label="Parking" loading={parkingData === 'loading'} active={activePanel === 'parking'} onClick={handleParking} />
            )}
            <ActionBtn emoji="🍔" label="Manger" loading={mangerData === 'loading'} active={activePanel === 'manger'} onClick={handleManger} />
            {paid && (
              <ActionBtn emoji="🎟️" label="Réserver" href={getFunbookerUrl(activity)} style={{ background: '#FF6B4A', border: '1.5px solid #FF6B4A' }} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
