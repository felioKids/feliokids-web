// src/components/ActivityCard.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import LazyImage from './LazyImage.jsx';

const NO_RESERVER_TYPES = new Set([
  'shopping_mall', 'supermarket', 'department_store',
  'park', 'library', 'school', 'church', 'cemetery',
  'locality', 'neighborhood', 'route',
]);
const NO_RESERVER_CATS = new Set(['gratuit', 'nature', 'halte']);
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

function isRestaurant(activity) {
  return activity.catId === 'resto';
}

function getMapsUrl(activity) {
  const lat = activity.geometry?.location?.lat ?? activity.lat;
  const lng = activity.geometry?.location?.lng ?? activity.lng;
  if (lat != null && lng != null) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const dest = encodeURIComponent(`${activity.name}, ${activity.address || ''}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

function getFunbookerUrl(activity) {
  const q = encodeURIComponent(activity.name || '');
  return `https://www.funbooker.com/fr/recherche?q=${q}&ref=feliokids`;
}

function getTheForkUrl(activity) {
  const q = encodeURIComponent(activity.name || '');
  return `https://www.thefork.fr/recherche?q=${q}&utm_source=feliokids`;
}

async function shareActivity(activity) {
  const text = `J'ai trouvé une super activité pour les enfants : ${activity.name}`;
  const url = `https://www.feliokids.com`;
  if (navigator.share) {
    try { await navigator.share({ title: activity.name, text, url }); } catch {}
  } else {
    await navigator.clipboard.writeText(`${text} — ${url}`);
    alert('Lien copié !');
  }
}

// ── Pobiera telefon z naszego proxy /api/details ─────────────────────────────
async function fetchPlaceDetails(placeId) {
  const cacheKey = `fk_phone_${placeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached !== null) {
    return JSON.parse(cached);
  }
  try {
    const res = await fetch(`/api/details?place_id=${encodeURIComponent(placeId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

async function fetchKidsRestaurants(lat, lng) {
  const keywords = ['McDonald', 'Burger King', 'KFC', 'Quick', 'Subway', 'pizza', 'crêperie', 'kebab', 'Brioche Dorée'];
  const allResults = [];
  const seen = new Set();
  await Promise.all(keywords.map(async (kw) => {
    try {
      const params = new URLSearchParams({ lat, lng, radius: 2000, type: 'restaurant', keyword: kw, language: 'fr' });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      (data.results || []).slice(0, 2).forEach(r => {
        if (!seen.has(r.place_id)) { seen.add(r.place_id); allResults.push(r); }
      });
    } catch {}
  }));
  if (allResults.length < 3) {
    try {
      const params = new URLSearchParams({ lat, lng, radius: 3000, type: 'restaurant', language: 'fr' });
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        (data.results || []).slice(0, 5).forEach(r => {
          if (!seen.has(r.place_id)) { seen.add(r.place_id); allResults.push(r); }
        });
      }
    } catch {}
  }
  return allResults.slice(0, 5);
}

async function fetchNearby(lat, lng, type) {
  const params = new URLSearchParams({ lat, lng, radius: 1000, type, language: 'fr' });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error('fetch failed');
  const data = await res.json();
  return (data.results || []).slice(0, 4);
}

function getDirectionsUrl(item) {
  let lat = item.geometry?.location?.lat;
  let lng = item.geometry?.location?.lng;
  if (typeof lat === 'function') lat = lat();
  if (typeof lng === 'function') lng = lng();
  if (lat == null) lat = item.lat;
  if (lng == null) lng = item.lng;
  const destinationText = [item.name, item.vicinity].filter(Boolean).join(', ');
  if (item.place_id && lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${item.place_id}`;
  if (item.place_id && destinationText)
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationText)}&destination_place_id=${item.place_id}`;
  if (lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationText)}`;
}

function MiniList({ items, type, onClose, loading }) {
  const isParking = type === 'parking';
  const icon  = isParking ? '🅿️' : '🍔';
  const title = isParking ? 'Parkings à proximité' : 'Manger à proximité';
  return (
    <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:0, right:0, background:'#fff', borderRadius:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', zIndex:100, padding:'12px', maxHeight:'220px', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
        <span style={{ fontSize:'12px', fontWeight:700, fontFamily:'Bricolage Grotesque, sans-serif', color:'#1a1a1a' }}>{title}</span>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'14px', color:'#aaa', padding:'0 2px' }}>✕</button>
      </div>
      <style>{`@keyframes fk-spin { to { transform: rotate(360deg); } }`}</style>
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 0' }}>
          <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:'2px solid #FFE8E1', borderTopColor:'#FF6B4A', animation:'fk-spin 0.7s linear infinite', flexShrink:0 }} />
          <span style={{ fontSize:'12px', color:'#aaa', fontFamily:'Outfit, sans-serif' }}>Recherche en cours...</span>
        </div>
      ) : items.length === 0 && isParking ? (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 0' }}>
          <span style={{ fontSize:'16px' }}>🅿️</span>
          <span style={{ fontSize:'12px', color:'#555', fontFamily:'Outfit, sans-serif', fontStyle:'italic' }}>Parking probablement disponible sur place</span>
        </div>
      ) : items.length === 0 ? (
        <p style={{ fontSize:'12px', color:'#aaa', margin:0, fontFamily:'Outfit, sans-serif' }}>Aucun résultat trouvé.</p>
      ) : items.map((item, i) => (
        <a key={item.place_id || i} href={getDirectionsUrl(item)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'7px 0', borderTop:i===0?'none':'1px solid #f0e8e0', textDecoration:'none', color:'inherit' }}>
          <span style={{ fontSize:'14px', flexShrink:0, marginTop:'1px' }}>{icon}</span>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'12px', fontWeight:600, fontFamily:'Outfit, sans-serif', color:'#1a1a1a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
            {item.vicinity && <div style={{ fontSize:'11px', color:'#aaa', fontFamily:'Outfit, sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.vicinity}</div>}
          </div>
          <div style={{ marginLeft:'auto', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'3px' }}>
            {item.rating && <span style={{ fontSize:'11px', color:'#FF6B4A', fontWeight:600, fontFamily:'Outfit, sans-serif' }}>★ {item.rating}</span>}
            {item.opening_hours?.open_now !== undefined && (
              <span style={{ fontSize:'9px', fontWeight:700, fontFamily:'Outfit, sans-serif', color:item.opening_hours.open_now?'#22c55e':'#ef4444', whiteSpace:'nowrap' }}>
                {item.opening_hours.open_now ? '● Ouvert' : '● Fermé'}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

function ActionBtn({ emoji, label, onClick, href, loading, active, style = {} }) {
  const base = {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'2px', padding:'6px 4px',
    background: active ? '#FFE8E1' : '#f5f0ea',
    border: active ? '1.5px solid #FF6B4A' : '1.5px solid transparent',
    borderRadius:'10px', cursor:'pointer', flex:1,
    transition:'background 0.15s, border-color 0.15s',
    textDecoration:'none', ...style,
  };
  const inner = (
    <>
      <span style={{ fontSize:'16px', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#555' }}>{loading ? '⏳' : emoji}</span>
      <span style={{ fontSize:'9.5px', fontFamily:'Outfit, sans-serif', fontWeight:600, color:active?'#FF6B4A':'#555', whiteSpace:'nowrap', letterSpacing:'0.01em' }}>{label}</span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onClick={e => e.stopPropagation()}>{inner}</a>;
  return <button style={base} onClick={e => { e.stopPropagation(); onClick?.(); }}>{inner}</button>;
}

export default function ActivityCard({ activity, onSelect, distanceKm }) {
  const { name, address, rating, ratingsTotal, photoReference, fallbackPhoto, openNow } = activity;
  const [parkingData, setParkingData] = useState(null);
  const [mangerData,  setMangerData]  = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  // ── Telefon dla kategorii anniversaire ────────────────────────────────────
  const [phone, setPhone] = useState(null); // null = jeszcze nie pobrano, '' = brak telefonu

  const cardRef = useRef(null);

  const lat = activity.geometry?.location?.lat ?? activity.lat;
  const lng = activity.geometry?.location?.lng ?? activity.lng;
  const paid = isPaidActivity(activity);
  const resto = isRestaurant(activity);
  const isAnniversaire = activity.catId === 'anniversaire';
  const openStatus = openNow ?? activity.opening_hours?.open_now ?? null;

  // Pobierz telefon automatycznie gdy to karta anniversaire
  useEffect(() => {
    if (!isAnniversaire || !activity.place_id || phone !== null) return;
    fetchPlaceDetails(activity.place_id).then(details => {
      setPhone(details?.phone || '');
    });
  }, [isAnniversaire, activity.place_id, phone]);

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

  // ── Przycisk Appeler — logika ─────────────────────────────────────────────
  // Stan:  null = ładowanie  |  '' = brak numeru  |  '+33...' = jest numer
  function renderAppelerBtn() {
    if (!isAnniversaire) return null;

    if (phone === null) {
      // Ładowanie — spinner w przycisku
      return <ActionBtn emoji="📞" label="Appeler" loading={true} onClick={() => {}} />;
    }
    if (phone) {
      // Jest numer → tel: link, kliknie i zadzwoni
      return (
        <ActionBtn
          emoji="📞"
          label="Appeler"
          href={`tel:${phone.replace(/\s/g, '')}`}
          style={{ background:'#e8f5e9', border:'1.5px solid #22c55e' }}
        />
      );
    }
    // Brak numeru → otwiera Google Maps jako fallback
    return (
      <ActionBtn
        emoji="📞"
        label="Appeler"
        href={`https://www.google.com/maps/place/?q=place_id:${activity.place_id}`}
      />
    );
  }

  return (
    <article ref={cardRef} className="activity-card" onClick={() => onSelect?.(activity)}
      style={{ borderRadius:'16px', overflow:'visible', background:'#FFF8F1', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', cursor:'pointer', transition:'transform 0.2s ease, box-shadow 0.2s ease', position:'relative', marginBottom:'16px' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ borderRadius:'16px 16px 0 0', overflow:'hidden', position:'relative' }}>
        <LazyImage photoReference={photoReference} fallbackSrc={fallbackPhoto} alt={name} style={{ height:'180px', width:'100%' }} />

        {/* Badge Ouvert/Fermé */}
        {openStatus !== null && (
          <span style={{ position:'absolute', top:'10px', right:'10px', background:openStatus?'rgba(34,197,94,0.92)':'rgba(239,68,68,0.88)', color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'Outfit, sans-serif', padding:'3px 8px', borderRadius:'20px', letterSpacing:'0.03em', backdropFilter:'blur(4px)' }}>
            {openStatus ? '● Ouvert' : '● Fermé'}
          </span>
        )}

        {/* Badge 🎂 Anniversaires pour les cartes anniversaire */}
        {isAnniversaire && (
          <span style={{ position:'absolute', top:'10px', left:'10px', background:'rgba(255,107,74,0.92)', color:'#fff', fontSize:'10px', fontWeight:700, fontFamily:'Outfit, sans-serif', padding:'3px 8px', borderRadius:'20px', letterSpacing:'0.03em', backdropFilter:'blur(4px)' }}>
            🎂 Anniversaires
          </span>
        )}
      </div>

      <div style={{ padding:'14px 16px 12px' }}>
        <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, color:'#1a1a1a', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {name}
        </h3>
        {address && (
          <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#888', fontFamily:'Outfit, sans-serif', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            📍 {address}
          </p>
        )}

        {/* Numer telefonu widoczny pod adresem jeśli jest */}
        {isAnniversaire && phone && (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            onClick={e => e.stopPropagation()}
            style={{ display:'inline-flex', alignItems:'center', gap:'5px', margin:'0 0 8px', fontSize:'13px', color:'#22c55e', fontFamily:'Outfit, sans-serif', fontWeight:600, textDecoration:'none' }}
          >
            📞 {phone}
          </a>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
          {rating && (
            <span style={{ fontSize:'12px', color:'#FF6B4A', fontFamily:'Outfit, sans-serif', fontWeight:600 }} title={`${ratingsTotal} avis`}>
              ★ {rating.toFixed(1)}
              <span style={{ color:'#aaa', fontWeight:400, marginLeft:'3px' }}>({ratingsTotal > 999 ? '999+' : ratingsTotal})</span>
            </span>
          )}
          {dist && (
            <span style={{ fontSize:'11px', background:'#FFE8E1', color:'#FF6B4A', padding:'2px 8px', borderRadius:'20px', fontFamily:'Outfit, sans-serif', fontWeight:600, whiteSpace:'nowrap' }}>
              {dist}
            </span>
          )}
        </div>

        <div style={{ position:'relative' }}>
          {activePanel === 'parking' && (
            <MiniList items={parkingData || []} type="parking" loading={parkingData === 'loading'} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'manger' && (
            <MiniList items={mangerData || []} type="manger" loading={mangerData === 'loading'} onClose={() => setActivePanel(null)} />
          )}

          <div style={{ display:'flex', gap:'6px' }}>
            <ActionBtn emoji="🗺️" label="Itinéraire" href={getMapsUrl(activity)} />
            {renderAppelerBtn()}
            <ActionBtn emoji="🅿️" label="Parking" loading={parkingData === 'loading'} active={activePanel === 'parking'} onClick={handleParking} />
            {resto ? (
              <ActionBtn
                emoji="🍴"
                label="Réserver"
                href={getTheForkUrl(activity)}
                style={{ background:'#E8734A', border:'1.5px solid #E8734A' }}
              />
            ) : (
              <ActionBtn emoji="🍔" label="Manger" loading={mangerData === 'loading'} active={activePanel === 'manger'} onClick={handleManger} />
            )}
            <ActionBtn
              emoji={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              }
              label="Partager"
              onClick={() => shareActivity(activity)}
            />
            {paid && !resto && (
              <ActionBtn emoji="🎟️" label="Réserver" href={getFunbookerUrl(activity)} style={{ background:'#FF6B4A', border:'1.5px solid #FF6B4A' }} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
