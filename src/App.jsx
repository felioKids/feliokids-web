import { useState, useEffect, useRef, useCallback } from 'react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATS = [
  { id: 'gratuit', e: '💚', l: 'Gratuit', c: '#4CAF50',
    img: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=75',
    subs: ['Places de jeux', 'Forêts & balades', 'Pistes cyclables', 'Parcs & jardins', 'Plages & lacs', 'Musées gratuits', 'Événements gratuits'] },
  { id: 'sport', e: '🏃', l: 'Sport', c: '#2196F3',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75',
    subs: ['Football & terrains', 'Vélo & VTT', 'Piscines & bassins', 'Accrobranche', 'Ski & glisse', 'Tennis & padel', 'Patinoire', 'Sports nautiques'] },
  { id: 'enfants', e: '🎠', l: 'Enfants', c: '#FF6B6B',
    img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=75',
    subs: ['Fermes pédagogiques', 'Zoos & animaleries', 'Spectacles enfants', 'Ateliers créatifs', 'Parcs d\'attractions', 'Aquariums', 'Cueillette fruits'] },
  { id: 'culture', e: '🏰', l: 'Culture', c: '#9C27B0',
    img: 'https://images.unsplash.com/photo-1587782523922-f8d8f81eb7b9?w=400&q=75',
    subs: ['Châteaux & histoire', 'Musées d\'art', 'Musées des sciences', 'Théâtre enfants', 'Planétarium', 'Ateliers scientifiques'] },
  { id: 'nature', e: '🌲', l: 'Nature', c: '#009688',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=75',
    subs: ['Forêts & balades', 'Plages & lacs', 'Jardins botaniques', 'Cueillette fruits', 'Camping & picnic', 'Rivières & cascades'] },
  { id: 'cinema', e: '🎬', l: 'Cinéma', c: '#FF5722',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=75',
    subs: ['Films enfants', 'Cinémas proches', 'Ciné plein air', 'Où manger après'] },
  { id: 'loisirs', e: '🎲', l: 'Loisirs', c: '#FF9800',
    img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=75',
    subs: ['Bowling', 'Escape game', 'Gaming café', 'Laser game', 'Ateliers cuisine', 'Ateliers créatifs'] },
  { id: 'manger', e: '🍔', l: 'Manger', c: '#E91E63',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75',
    subs: ['Restaurants famille', 'Fast food famille', 'Spots pique-nique', 'Glacier & goûter', 'Boulangeries', 'Salons de thé'] },
  { id: 'events', e: '🎉', l: 'Événements', c: '#3F51B5',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75',
    subs: ['Ce weekend', 'Fêtes & marchés', 'Festivals famille', 'Événements saisonniers', 'Expos temporaires'] },
]

const ALL_SUBS = CATS.flatMap(c => c.subs.map(s => ({ cat: c.l, id: c.id, sub: s })))
const RADII = [5, 10, 20, 30]
const BUDGETS = ['Gratuit', '-20€', '-50€', '-100€', 'Libre']

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  hdr: { background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontFamily: "'Baloo 2',cursive", fontSize: 24, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.2)', lineHeight: 1 },
  logoSub: { fontSize: 9, color: 'rgba(255,255,255,.75)', fontWeight: 700, letterSpacing: '1.2px', display: 'block', marginTop: 1 },
  wBadge: { background: 'rgba(255,255,255,.22)', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,.3)' },
  alertBtn: { background: 'rgba(255,255,255,.2)', color: '#fff', padding: '7px 15px', borderRadius: 18, fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,.28)', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" },
  card: { background: '#fff', margin: '16px 16px 0', borderRadius: 22, padding: 18, boxShadow: '0 6px 28px rgba(0,0,0,.11)' },
  pill: (on, green) => ({
    padding: '8px 13px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
    background: on ? (green ? '#4CAF50' : 'linear-gradient(135deg,#FF6B6B,#FF8E53)') : '#f0f0f0',
    color: on ? '#fff' : '#666',
    boxShadow: on ? '0 3px 10px rgba(255,107,107,.3)' : 'none',
    transition: 'all .15s',
  }),
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #eee', fontFamily: "'Nunito',sans-serif", fontSize: 14, background: '#fafafa', outline: 'none', transition: 'border .2s' },
  goBtn: { width: '100%', padding: 14, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', borderRadius: 13, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", boxShadow: '0 4px 16px rgba(255,107,107,.4)' },
  suggList: { position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,.13)', zIndex: 50, overflow: 'hidden', maxHeight: 240, overflowY: 'auto' },
  suggItem: { padding: '11px 16px', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 10 },
  subsBox: { margin: '12px 16px 0', background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 3px 14px rgba(0,0,0,.08)' },
  resCard: { background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.09)', marginBottom: 14 },
  cbt: { flex: 1, padding: '12px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#666', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: "'Nunito',sans-serif" },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal: { background: '#fff', borderRadius: 24, padding: '32px 26px', maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.25)', textAlign: 'center' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function geocodeCity(val) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=fr&format=json&limit=7&addressdetails=1`,
    { headers: { 'Accept-Language': 'fr' } }
  )
  const d = await r.json()
  return d.filter(x => ['city', 'town', 'village', 'suburb', 'municipality'].includes(x.type) || x.class === 'place').slice(0, 5)
    .concat(d.slice(0, 5)).slice(0, 5)
}

async function fetchWeather(lat, lon) {
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`)
  const d = await r.json()
  const t = Math.round(d.current.temperature_2m)
  const c = d.current.weathercode
  const em = c === 0 || c === 1 ? '☀️' : c <= 3 ? '⛅' : c >= 51 && c <= 82 ? '🌧️' : c >= 95 ? '⛈️' : c >= 71 && c <= 77 ? '❄️' : '🌤️'
  return `${em} ${t}°C`
}

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────

function ActivityCard({ a, idx }) {
  const [restoOpen, setRestoOpen] = useState(false)
  const mq = encodeURIComponent((a.address || a.name))

  return (
    <div className="fade-in" style={{ ...S.resCard, animationDelay: `${idx * 0.07}s` }}>
      <div style={{ padding: '16px 18px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
          <div>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 700, color: '#1a1a2e' }}>{a.name}</span>
            {a.isFree && <span style={{ background: '#4CAF50', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8, marginLeft: 6, verticalAlign: 'middle' }}>💚 GRATUIT</span>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FF6B6B' }}>{a.price}</div>
            <div style={{ fontSize: 12, color: '#bbb' }}>⭐ {a.rating} ({a.reviews})</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
          <span style={{ background: '#f0f0f0', color: '#777', fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{a.type}</span>
          <span style={{ fontSize: 12, color: '#bbb' }}>📍 {a.distance}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: a.openNow ? '#4CAF50' : '#f44336' }}>{a.openNow ? '● Ouvert' : '● Fermé'}</span>
        </div>
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 8 }}>{a.description}</p>
        {a.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
            {a.tags.map(t => <span key={t} style={{ background: 'rgba(255,107,107,.1)', color: '#FF6B6B', fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{t}</span>)}
          </div>
        )}
        {a.hours && <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>🕐 {a.hours}</div>}
      </div>

      <div style={{ display: 'flex', borderTop: '1px solid #f0f0f0' }}>
        {[
          { icon: '🗺️', label: 'Itinéraire', url: `https://www.google.com/maps/dir/?api=1&destination=${mq}` },
          { icon: '🅿️', label: 'Parking', url: `https://www.google.com/maps/search/parking+near+${mq}` },
          { icon: '🍔', label: 'Manger', action: () => setRestoOpen(!restoOpen) },
        ].map((b, i) => (
          <button key={i} style={{ ...S.cbt, borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}
            onClick={() => b.url ? window.open(b.url, '_blank') : b.action()}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 16 }}>{b.icon}</span>{b.label}
          </button>
        ))}
      </div>

      {restoOpen && (
        <div style={{ padding: '14px 18px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#999', marginBottom: 9 }}>🍽️ Restaurants à proximité</div>
          {(a.restaurants || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 11, padding: '9px 12px', marginBottom: 7, boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>{r.type} · {r.distance}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>{r.price}</span>
                <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.name)}`, '_blank')}
                  style={{ background: '#FF6B6B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                  Maps
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── EMAIL MODAL ──────────────────────────────────────────────────────────────

function EmailModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {!sent ? <>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, marginBottom: 8 }}>Alertes activités</div>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 18, lineHeight: 1.6 }}>Reçois chaque semaine les meilleures activités famille près de chez toi !</p>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ ...S.input, marginBottom: 12 }}
            onFocus={e => e.target.style.borderColor = '#FF6B6B'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
          <button style={S.goBtn} onClick={() => email && setSent(true)}>S'inscrire gratuitement 🎉</button>
        </> : <>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, marginBottom: 8 }}>C'est parti !</div>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 18 }}>Tu recevras les meilleures activités sur <b>{email}</b> !</p>
          <button style={{ ...S.goBtn, background: '#f0f0f0', color: '#666', boxShadow: 'none' }} onClick={onClose}>Fermer</button>
        </>}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [city, setCity] = useState('')
  const [lat, setLat] = useState(null)
  const [lon, setLon] = useState(null)
  const [radius, setRadius] = useState(5)
  const [budget, setBudget] = useState('Gratuit')
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState(null)
  const [activeSub, setActiveSub] = useState(null)
  const [weather, setWeather] = useState('🌤️ France')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [citySuggs, setCitySuggs] = useState([])
  const [showCitySugg, setShowCitySugg] = useState(false)
  const [qSuggs, setQSuggs] = useState([])
  const [showQSugg, setShowQSugg] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const cityTimer = useRef(null)
  const qTimer = useRef(null)

  // City autocomplete
  const handleCityInput = useCallback(async (val) => {
    setCity(val); setLat(null); setLon(null); setWeather('🌤️ France')
    if (val.length < 2) { setCitySuggs([]); setShowCitySugg(false); return }
    clearTimeout(cityTimer.current)
    cityTimer.current = setTimeout(async () => {
      try {
        const suggs = await geocodeCity(val)
        setCitySuggs(suggs); setShowCitySugg(suggs.length > 0)
      } catch { setCitySuggs([]); setShowCitySugg(false) }
    }, 400)
  }, [])

  const chooseSugg = useCallback(async (s) => {
    const name = s.display_name.split(',')[0].trim()
    const lt = parseFloat(s.lat), ln = parseFloat(s.lon)
    setCity(name); setLat(lt); setLon(ln); setCitySuggs([]); setShowCitySugg(false)
    try { const w = await fetchWeather(lt, ln); setWeather(`${w} · ${name}`) } catch {}
  }, [])

  // Keyword autocomplete
  const handleQInput = useCallback((val) => {
    setQuery(val)
    clearTimeout(qTimer.current)
    if (val.length < 2) { setQSuggs([]); setShowQSugg(false); return }
    qTimer.current = setTimeout(() => {
      const q = val.toLowerCase()
      const hits = ALL_SUBS.filter(x => x.sub.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q)).slice(0, 6)
      setQSuggs(hits); setShowQSugg(hits.length > 0)
    }, 200)
  }, [])

  const pickQSugg = (s) => {
    setQuery(s.sub); setActiveCat(s.id); setActiveSub(s.sub)
    setQSuggs([]); setShowQSugg(false)
  }

  // Category
  const clickCat = (id) => {
    const next = activeCat === id ? null : id
    setActiveCat(next); setActiveSub(null)
    if (!next) setResults([])
  }

  // Search
  const doSearch = useCallback(async () => {
    if (!city) { alert('📍 Entre d\'abord une ville !'); return }
    if (loading) return
    setLoading(true); setError(''); setResults([])
    const catLabel = activeCat ? CATS.find(c => c.id === activeCat)?.l : ''
    const budgetText = budget === 'Libre' ? 'sans limite de budget' : budget === 'Gratuit' ? 'uniquement gratuites (isFree:true)' : `budget max ${budget} par personne`
    const prompt = `Tu es l'assistant de FelioKids, agrégateur d'activités familiales en France.
Ville: ${city}${lat ? ` (lat:${lat.toFixed(3)}, lon:${lon.toFixed(3)})` : ''}
Rayon: ${radius} km | Budget: ${budgetText}
${catLabel ? `Catégorie: ${catLabel}` : ''}${activeSub ? `\nSous-catégorie: ${activeSub}` : ''}${query ? `\nRecherche: "${query}"` : ''}

Génère exactement 6 activités familiales RÉALISTES. Adresses cohérentes avec la ville réelle.
Réponds UNIQUEMENT JSON valide, aucun texte autour:
[{"name":"...","type":"...","address":"...","distance":"X,X km","price":"Gratuit ou X€","isFree":true,"rating":4.2,"reviews":312,"openNow":true,"hours":"9h-18h","description":"2 phrases pour familles","tags":["tag1"],"restaurants":[{"name":"...","type":"...","distance":"X km","price":"€€"}]}]`

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setResults(data.activities)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [city, lat, lon, radius, budget, activeCat, activeSub, query, loading])

  useEffect(() => {
    if (activeCat && city) doSearch()
  }, [activeCat, activeSub])

  return (
    <div style={{ minHeight: '100vh', background: '#f9f7f4', maxWidth: 680, margin: '0 auto' }}>
      {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}

      {/* HEADER */}
      <div style={S.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 30 }}>🎡</span>
          <div>
            <div style={S.logoText}>FelioKids</div>
            <span style={S.logoSub}>ACTIVITÉS FAMILLE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={S.wBadge}>{weather}</div>
          <button style={S.alertBtn} onClick={() => setShowEmail(true)}>🔔 Alertes</button>
        </div>
      </div>

      {/* SEARCH CARD */}
      <div style={S.card}>
        {/* City */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 17, pointerEvents: 'none' }}>📍</span>
          <input
            style={{ ...S.input, paddingLeft: 40, fontWeight: 700 }}
            type="text" placeholder="Ville ou commune... (Paris, Lyon, Bordeaux...)"
            value={city}
            onChange={e => handleCityInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && citySuggs[0]) { chooseSugg(citySuggs[0]); e.preventDefault() } }}
            onFocus={e => { e.target.style.borderColor = '#FF6B6B'; setShowCitySugg(citySuggs.length > 0) }}
            onBlur={e => { e.target.style.borderColor = '#eee'; setTimeout(() => setShowCitySugg(false), 200) }}
          />
          {showCitySugg && (
            <div style={S.suggList}>
              {citySuggs.map((s, i) => (
                <div key={i} style={S.suggItem}
                  onMouseDown={() => chooseSugg(s)}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  📍 <b>{s.display_name.split(',').slice(0, 3).join(', ')}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Radius */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb' }}>📏</span>
          {RADII.map(r => (
            <button key={r} style={S.pill(radius === r)} onClick={() => setRadius(r)}>{r} km</button>
          ))}
        </div>

        {/* Budget */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb' }}>💰</span>
          {BUDGETS.map(b => (
            <button key={b} style={S.pill(budget === b, b === 'Gratuit')} onClick={() => setBudget(b)}>{b}</button>
          ))}
        </div>

        {/* Keyword */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            style={S.input}
            type="text" placeholder='🔍  "bowling", "château gratuit", "piscine couverte"...'
            value={query}
            onChange={e => handleQInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            onFocus={e => { e.target.style.borderColor = '#FF6B6B'; setShowQSugg(qSuggs.length > 0) }}
            onBlur={e => { e.target.style.borderColor = '#eee'; setTimeout(() => setShowQSugg(false), 200) }}
          />
          {showQSugg && (
            <div style={S.suggList}>
              {qSuggs.map((s, i) => (
                <div key={i} style={{ ...S.suggItem, fontSize: 13 }}
                  onMouseDown={() => pickQSugg(s)}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  🔍 <b>{s.sub}</b> <span style={{ color: '#bbb', fontSize: 11 }}>— {s.cat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button style={S.goBtn} onClick={doSearch}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {loading ? '⏳ Recherche en cours...' : '🔍 Trouver des activités'}
        </button>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 11 }}>Catégories</div>
        <div style={S.catGrid}>
          {CATS.map(cat => (
            <button key={cat.id}
              onClick={() => clickCat(cat.id)}
              style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '1', position: 'relative', cursor: 'pointer', border: 'none', transition: 'all .2s', boxShadow: activeCat === cat.id ? `0 0 0 3px #FF6B6B, 0 6px 22px rgba(255,107,107,.3)` : '0 3px 14px rgba(0,0,0,.1)', transform: activeCat === cat.id ? 'scale(1.04)' : 'scale(1)' }}
            >
              <img src={cat.img} alt={cat.l} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 8, background: `linear-gradient(to top,${cat.c}dd 0%,transparent 55%)` }}>
                <div style={{ fontSize: 18 }}>{cat.e}</div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: "'Baloo 2',cursive", textShadow: '0 1px 4px rgba(0,0,0,.6)', lineHeight: 1.1 }}>{cat.l}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SUBCATEGORIES */}
      {activeCat && (
        <div className="fade-in" style={S.subsBox}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>
            {CATS.find(c => c.id === activeCat)?.l} — sous-catégories
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATS.find(c => c.id === activeCat)?.subs.map(s => (
              <button key={s} style={S.pill(activeSub === s)} onClick={() => { setActiveSub(activeSub === s ? null : s) }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      <div style={{ padding: '16px 16px 32px' }}>
        {error && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, color: '#c62828', fontWeight: 600, marginBottom: 14, textAlign: 'center', boxShadow: '0 3px 12px rgba(0,0,0,.08)' }}>
            ⚠️ {error}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🎡</div>
            <div style={{ color: '#888', fontSize: 14, fontWeight: 700, marginTop: 12 }}>On cherche les meilleures activités à {city}...</div>
          </div>
        )}
        {!loading && results.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9 }}>{results.length} activités</span>
              près de {city} · {radius} km · {budget}
            </div>
            {results.map((a, i) => <ActivityCard key={i} a={a} idx={i} />)}
          </>
        )}
        {!loading && results.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
            <div style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7 }}>Entre ta ville et clique sur<br />une catégorie pour commencer !</div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '0 0 24px', color: '#ccc', fontSize: 12 }}>
        🎡 FelioKids · <a href="mailto:feliokids@gmail.com" style={{ color: '#ccc' }}>feliokids@gmail.com</a>
      </div>
    </div>
  )
}
