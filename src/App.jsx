import { useState, useEffect, useRef, useCallback } from 'react'
import { getActivities } from './data/activities.js'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CATS = [
  { id: 'gratuit', e: '💚', l: 'Gratuit', c: '#4CAF50', img: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=75', subs: ['Places de jeux', 'Forêts & balades', 'Pistes cyclables', 'Parcs & jardins', 'Plages & lacs', 'Musées gratuits', 'Événements gratuits'] },
  { id: 'sport', e: '🏃', l: 'Sport', c: '#2196F3', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75', subs: ['Football & terrains', 'Vélo & VTT', 'Piscines & bassins', 'Accrobranche', 'Ski & glisse', 'Tennis & padel', 'Patinoire', 'Sports nautiques'] },
  { id: 'enfants', e: '🎠', l: 'Enfants', c: '#FF6B6B', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=75', subs: ['Fermes pédagogiques', 'Zoos & animaleries', 'Spectacles enfants', 'Ateliers créatifs', "Parcs d'attractions", 'Aquariums', 'Cueillette fruits'] },
  { id: 'culture', e: '🏰', l: 'Culture', c: '#9C27B0', img: 'https://images.unsplash.com/photo-1587782523922-f8d8f81eb7b9?w=400&q=75', subs: ['Châteaux & histoire', "Musées d'art", 'Musées des sciences', 'Théâtre enfants', 'Planétarium', 'Ateliers scientifiques'] },
  { id: 'nature', e: '🌲', l: 'Nature', c: '#009688', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=75', subs: ['Forêts & balades', 'Plages & lacs', 'Jardins botaniques', 'Cueillette fruits', 'Camping & picnic', 'Rivières & cascades'] },
  { id: 'cinema', e: '🎬', l: 'Cinéma', c: '#FF5722', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=75', subs: ['Films enfants', 'Cinémas proches', 'Ciné plein air', 'Où manger après'] },
  { id: 'loisirs', e: '🎲', l: 'Loisirs', c: '#FF9800', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=75', subs: ['Bowling', 'Escape game', 'Gaming café', 'Laser game', 'Ateliers cuisine', 'Ateliers créatifs'] },
  { id: 'manger', e: '🍔', l: 'Manger', c: '#E91E63', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75', subs: ['Restaurants famille', 'Fast food famille', 'Spots pique-nique', 'Glacier & goûter', 'Boulangeries', 'Salons de thé'] },
  { id: 'events', e: '🎉', l: 'Événements', c: '#3F51B5', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75', subs: ['Ce weekend', 'Fêtes & marchés', 'Festivals famille', 'Événements saisonniers', 'Expos temporaires'] },
]

const ALL_SUBS = CATS.flatMap(c => c.subs.map(s => ({ cat: c.l, id: c.id, sub: s })))
const RADII = [5, 10, 20, 30]
const BUDGETS = ['Gratuit', '-20€', '-50€', '-100€', 'Libre']

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────

function ActivityCard({ a, idx }) {
  const [restoOpen, setRestoOpen] = useState(false)
  const addr = encodeURIComponent(a.address)
  const nameEnc = encodeURIComponent(a.name)

  return (
    <div className="fade-up" style={{
      animationDelay: `${idx * 0.06}s`,
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: 12,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
    >
      {/* Card content */}
      <div style={{ padding: '16px 16px 10px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 7 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>{a.name}</span>
              {a.isFree && (
                <span style={{ background: '#4CAF50', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 8, whiteSpace: 'nowrap' }}>💚 GRATUIT</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginTop: 5 }}>
              <span style={{ background: '#f0f0f0', color: '#777', fontSize: 11, padding: '2px 8px', borderRadius: 7, fontWeight: 700 }}>{a.type}</span>
              <span style={{ fontSize: 12, color: '#bbb' }}>📍 {a.distance}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: a.openNow ? '#4CAF50' : '#f44336' }}>
                {a.openNow ? '● Ouvert' : '● Fermé'}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FF6B6B' }}>{a.price}</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>⭐ {a.rating} ({a.reviews.toLocaleString('fr')})</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.55, marginBottom: 8 }}>{a.description}</p>

        {/* Tags */}
        {a.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
            {a.tags.map(t => (
              <span key={t} style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{t}</span>
            ))}
          </div>
        )}

        {/* Hours */}
        {a.hours && <div style={{ fontSize: 11, color: '#ccc' }}>🕐 {a.hours}</div>}
      </div>

      {/* 3 action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #f0f0f0' }}>
        {[
          {
            icon: '🗺️', label: 'Itinéraire',
            url: `https://www.google.com/maps/dir/?api=1&destination=${addr}`,
            color: '#2196F3'
          },
          {
            icon: '🅿️', label: 'Parking',
            url: `https://www.google.com/maps/search/parking+près+de+${addr}`,
            color: '#FF9800'
          },
          {
            icon: '🍔', label: restoOpen ? 'Fermer' : 'Manger',
            action: () => setRestoOpen(!restoOpen),
            color: '#E91E63'
          },
        ].map((btn, i) => (
          <button key={i}
            onClick={() => btn.url ? window.open(btn.url, '_blank') : btn.action()}
            style={{
              padding: '11px 8px',
              background: 'transparent',
              border: 'none',
              borderRight: i < 2 ? '1px solid #f0f0f0' : 'none',
              fontSize: 12,
              fontWeight: 700,
              color: '#666',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = btn.color }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' }}
          >
            <span style={{ fontSize: 18 }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Restaurants panel */}
      {restoOpen && (
        <div className="fade-in" style={{ padding: '12px 16px 14px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#999', marginBottom: 10 }}>🍽️ Restaurants à proximité</div>
          {a.restaurants?.length > 0 ? a.restaurants.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff', borderRadius: 11, padding: '9px 12px', marginBottom: 7,
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{r.type} · {r.distance}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#bbb' }}>{r.price}</span>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.name + ' ' + a.address.split(',').slice(-1)[0])}`, '_blank')}
                  style={{ background: '#FF6B6B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 8, border: 'none' }}
                >
                  Maps
                </button>
              </div>
            </div>
          )) : (
            <div style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>Aucun restaurant trouvé à proximité</div>
          )}
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', maxWidth: 380, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        {!sent ? <>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🔔</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 21, marginBottom: 6 }}>Alertes activités</div>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 18, lineHeight: 1.6 }}>Reçois chaque semaine les meilleures activités famille près de chez toi !</p>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: '2px solid #eee', fontSize: 14, marginBottom: 10, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#FF6B6B'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
          <button onClick={() => email && setSent(true)}
            style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', borderRadius: 11, fontSize: 15, fontWeight: 800, border: 'none' }}>
            S'inscrire gratuitement 🎉
          </button>
        </> : <>
          <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 21, marginBottom: 6 }}>C'est parti !</div>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 18 }}>Tu recevras les meilleures activités sur <b>{email}</b> !</p>
          <button onClick={onClose} style={{ width: '100%', padding: 12, background: '#f0f0f0', color: '#666', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none' }}>Fermer</button>
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
  const [radius, setRadius] = useState(10)
  const [budget, setBudget] = useState('Libre')
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState(null)
  const [activeSub, setActiveSub] = useState(null)
  const [weather, setWeather] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [citySuggs, setCitySuggs] = useState([])
  const [showCitySugg, setShowCitySugg] = useState(false)
  const [qSuggs, setQSuggs] = useState([])
  const [showQSugg, setShowQSugg] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const cityTimer = useRef(null)
  const qTimer = useRef(null)

  // City autocomplete
  const handleCityInput = useCallback(async (val) => {
    setCity(val); setLat(null); setLon(null); setWeather(null)
    if (val.length < 2) { setCitySuggs([]); setShowCitySugg(false); return }
    clearTimeout(cityTimer.current)
    cityTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=fr&format=json&limit=6&addressdetails=1`, { headers: { 'Accept-Language': 'fr' } })
        const d = await r.json()
        const suggs = d.filter(x => ['city', 'town', 'village', 'suburb', 'municipality'].includes(x.type) || x.class === 'place').slice(0, 5)
        const final = suggs.length ? suggs : d.slice(0, 4)
        setCitySuggs(final); setShowCitySugg(final.length > 0)
      } catch { setCitySuggs([]); setShowCitySugg(false) }
    }, 400)
  }, [])

  const chooseSugg = useCallback(async (s) => {
    const name = s.display_name.split(',')[0].trim()
    const lt = parseFloat(s.lat), ln = parseFloat(s.lon)
    setCity(name); setLat(lt); setLon(ln)
    setCitySuggs([]); setShowCitySugg(false)
    try {
      const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lt}&longitude=${ln}&current=temperature_2m,weathercode&timezone=auto`)
      const wd = await wr.json()
      const t = Math.round(wd.current.temperature_2m)
      const c = wd.current.weathercode
      const em = c === 0 || c === 1 ? '☀️' : c <= 3 ? '⛅' : c >= 51 && c <= 82 ? '🌧️' : c >= 95 ? '⛈️' : c >= 71 && c <= 77 ? '❄️' : '🌤️'
      setWeather({ icon: em, temp: t, city: name })
    } catch {}
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

  // Search with mock data
  const doSearch = useCallback((catOverride, subOverride) => {
    const cat = catOverride !== undefined ? catOverride : activeCat
    const sub = subOverride !== undefined ? subOverride : activeSub
    if (!cat) return
    setLoading(true); setHasSearched(true)
    setTimeout(() => {
      const acts = getActivities(cat, sub, budget)
      setResults(acts)
      setLoading(false)
    }, 600)
  }, [activeCat, activeSub, budget])

  const clickCat = (id) => {
    if (activeCat === id) {
      setActiveCat(null); setActiveSub(null); setResults([]); setHasSearched(false)
    } else {
      setActiveCat(id); setActiveSub(null)
      doSearch(id, null)
    }
  }

  const clickSub = (sub) => {
    const next = activeSub === sub ? null : sub
    setActiveSub(next)
    doSearch(activeCat, next)
  }

  // Input styles
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #eee',
    fontSize: 14, background: '#fafafa', outline: 'none', transition: 'border .2s', color: '#1a1a2e'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}

        {/* ── HEADER ── */}
        <div style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎡</span>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.2)', lineHeight: 1 }}>FelioKids</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '1.2px' }}>ACTIVITÉS FAMILLE</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {weather && (
              <div style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
                {weather.icon} {weather.temp}°C
              </div>
            )}
            <button onClick={() => setShowEmail(true)}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: 18, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.28)' }}>
              🔔 Alertes
            </button>
          </div>
        </div>

        {/* ── SEARCH CARD ── */}
        <div style={{ background: '#fff', margin: '14px 14px 0', borderRadius: 20, padding: 16, boxShadow: '0 6px 28px rgba(0,0,0,0.10)' }}>

          {/* City input */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>📍</span>
            <input
              style={{ ...inputStyle, paddingLeft: 38, fontWeight: 700 }}
              type="text"
              placeholder="Ta ville... (Paris, Lyon, Bordeaux...)"
              value={city}
              onChange={e => handleCityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && citySuggs[0]) { chooseSugg(citySuggs[0]); e.preventDefault() } }}
              onFocus={e => { e.target.style.borderColor = '#FF6B6B'; if (citySuggs.length) setShowCitySugg(true) }}
              onBlur={e => { e.target.style.borderColor = '#eee'; setTimeout(() => setShowCitySugg(false), 180) }}
            />
            {showCitySugg && citySuggs.length > 0 && (
              <div style={{ position: 'absolute', top: '108%', left: 0, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.13)', zIndex: 50, overflow: 'hidden' }}>
                {citySuggs.map((s, i) => (
                  <div key={i}
                    style={{ padding: '10px 15px', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginRight: 2 }}>📏 Rayon</span>
            {RADII.map(r => (
              <button key={r}
                onClick={() => setRadius(r)}
                style={{ padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', background: radius === r ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f0f0f0', color: radius === r ? '#fff' : '#666', transition: 'all .15s' }}>
                {r} km
              </button>
            ))}
          </div>

          {/* Budget */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginRight: 2 }}>💰 Budget</span>
            {BUDGETS.map(b => (
              <button key={b}
                onClick={() => { setBudget(b); if (activeCat) doSearch(activeCat, activeSub) }}
                style={{ padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', background: budget === b ? (b === 'Gratuit' ? '#4CAF50' : 'linear-gradient(135deg,#FF6B6B,#FF8E53)') : '#f0f0f0', color: budget === b ? '#fff' : '#666', transition: 'all .15s' }}>
                {b}
              </button>
            ))}
          </div>

          {/* Keyword */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              style={inputStyle}
              type="text"
              placeholder='🔍  "bowling", "château gratuit", "piscine"...'
              value={query}
              onChange={e => handleQInput(e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#FF6B6B'; if (qSuggs.length) setShowQSugg(true) }}
              onBlur={e => { e.target.style.borderColor = '#eee'; setTimeout(() => setShowQSugg(false), 180) }}
            />
            {showQSugg && (
              <div style={{ position: 'absolute', top: '108%', left: 0, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.13)', zIndex: 50, overflow: 'hidden' }}>
                {qSuggs.map((s, i) => (
                  <div key={i}
                    style={{ padding: '9px 15px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                    onMouseDown={() => { setQuery(s.sub); setActiveCat(s.id); setActiveSub(s.sub); setShowQSugg(false); setTimeout(() => doSearch(s.id, s.sub), 50) }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    🔍 <b>{s.sub}</b> <span style={{ color: '#bbb', fontSize: 11 }}>— {s.cat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => { if (!activeCat && CATS[0]) { setActiveCat('enfants'); doSearch('enfants', null) } else doSearch() }}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 800, border: 'none', boxShadow: '0 4px 16px rgba(255,107,107,0.4)', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔍 Trouver des activités
          </button>
        </div>

        {/* ── CATEGORIES + INLINE SUBCATEGORIES ── */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Catégories</div>

          {/* We render rows of 3, inserting subs panel after the row containing the active cat */}
          {(() => {
            const rows = []
            for (let i = 0; i < CATS.length; i += 3) {
              const rowCats = CATS.slice(i, i + 3)
              const activeInRow = rowCats.find(c => c.id === activeCat)
              rows.push(
                <div key={i}>
                  {/* Row of 3 tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: activeInRow ? 0 : 8 }}>
                    {rowCats.map(cat => (
                      <button key={cat.id}
                        onClick={() => clickCat(cat.id)}
                        style={{
                          borderRadius: 15, overflow: 'hidden',
                          aspectRatio: '1', position: 'relative',
                          border: 'none', transition: 'all .2s',
                          boxShadow: activeCat === cat.id
                            ? `0 0 0 3px ${cat.c}, 0 6px 20px rgba(0,0,0,0.15)`
                            : '0 3px 12px rgba(0,0,0,0.09)',
                          transform: activeCat === cat.id ? 'scale(1.03)' : 'scale(1)',
                        }}
                      >
                        <img src={cat.img} alt={cat.l} loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                          padding: 8,
                          background: `linear-gradient(to top, ${cat.c}e0 0%, transparent 55%)`
                        }}>
                          <div style={{ fontSize: 18 }}>{cat.e}</div>
                          <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: "'Baloo 2',cursive", textShadow: '0 1px 4px rgba(0,0,0,0.6)', lineHeight: 1.1 }}>{cat.l}</div>
                        </div>
                        {/* Active indicator arrow */}
                        {activeCat === cat.id && (
                          <div style={{
                            position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `8px solid ${cat.c}`,
                            zIndex: 10,
                          }} />
                        )}
                      </button>
                    ))}
                    {/* Fill empty slots if row has < 3 */}
                    {rowCats.length < 3 && Array(3 - rowCats.length).fill(0).map((_, j) => (
                      <div key={`empty-${j}`} />
                    ))}
                  </div>

                  {/* Subcategories panel — only shown after the row containing active cat */}
                  {activeInRow && activeCat && (
                    <div className="fade-up" style={{
                      background: '#fff',
                      borderRadius: 16,
                      padding: '12px 14px',
                      marginTop: 10,
                      marginBottom: 8,
                      boxShadow: `0 4px 20px rgba(0,0,0,0.09), 0 0 0 2px ${activeInRow.c}33`,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 9 }}>
                        {activeInRow.e} {activeInRow.l} — que cherches-tu ?
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {activeInRow.subs.map(s => (
                          <button key={s}
                            onClick={() => clickSub(s)}
                            style={{
                              padding: '8px 13px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                              border: 'none', transition: 'all .15s',
                              background: activeSub === s ? `linear-gradient(135deg, ${activeInRow.c}, ${activeInRow.c}bb)` : '#f0f0f0',
                              color: activeSub === s ? '#fff' : '#555',
                              boxShadow: activeSub === s ? `0 3px 10px ${activeInRow.c}44` : 'none',
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            return rows
          })()}
        </div>

        {/* ── RESULTS ── */}
        <div style={{ padding: '14px 14px 32px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 44 }}>
              <div style={{ fontSize: 44, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🎡</div>
              <div style={{ color: '#888', fontSize: 14, fontWeight: 700, marginTop: 10 }}>Recherche en cours...</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 9 }}>
                  {results.length} activités
                </span>
                {city ? `près de ${city}` : 'disponibles'} · {radius} km · {budget}
              </div>
              {results.map((a, i) => <ActivityCard key={a.id} a={a} idx={i} />)}
            </>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🤷</div>
              <div style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7 }}>Aucune activité trouvée<br />pour ce filtre. Essaie un autre budget !</div>
            </div>
          )}

          {!loading && !hasSearched && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>👨‍👩‍👧‍👦</div>
              <div style={{ color: '#aaa', fontSize: 14, lineHeight: 1.8 }}>
                Clique sur une catégorie<br />pour découvrir des activités !
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '0 0 20px', color: '#ccc', fontSize: 11 }}>
          🎡 FelioKids · <a href="mailto:feliokids@gmail.com" style={{ color: '#ccc' }}>feliokids@gmail.com</a>
        </div>

      </div>
    </div>
  )
}
