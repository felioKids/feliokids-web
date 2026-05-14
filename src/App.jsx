import { useState, useRef, useCallback, useEffect } from 'react'
import { getActivities } from './data/activities.js'

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const CATS = [
  { id:'gratuit',  e:'💚', l:'Gratuit',     sub:'Sorties sans se ruiner',  c:'#3DAA6E',
    img:'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=700&q=80',
    subs:['Places de jeux','Forêts & balades','Pistes cyclables','Parcs & jardins','Plages & lacs','Musées gratuits','Événements gratuits'] },
  { id:'sport',    e:'🏃', l:'Sport',        sub:'Bouger en famille',        c:'#2F80ED',
    img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80',
    subs:['Football & terrains','Vélo & VTT','Piscines & bassins','Accrobranche','Ski & glisse','Tennis & padel','Patinoire'] },
  { id:'enfants',  e:'🎠', l:'Enfants',      sub:'Pour petits et grands',    c:'#FF6B4A',
    img:'https://images.unsplash.com/photo-1543342384-1f1350e27861?w=700&q=80',
    subs:['Fermes pédagogiques','Zoos & animaleries','Spectacles enfants','Ateliers créatifs','Parcs d\'attractions','Aquariums','Cueillette fruits'] },
  { id:'culture',  e:'🏰', l:'Culture',      sub:'Découvrir et apprendre',   c:'#7C3AED',
    img:'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=700&q=80',
    subs:['Châteaux & histoire','Musées d\'art','Musées des sciences','Théâtre enfants','Planétarium','Ateliers scientifiques'] },
  { id:'nature',   e:'🌲', l:'Nature',       sub:'Respirer dehors',          c:'#059669',
    img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
    subs:['Forêts & balades','Plages & lacs','Jardins botaniques','Cueillette fruits','Camping & picnic','Rivières & cascades'] },
  { id:'cinema',   e:'🎬', l:'Cinéma',       sub:'Quand il pleut',           c:'#DC2626',
    img:'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=700&q=80',
    subs:['Films enfants','Cinémas proches','Ciné plein air','Où manger après'] },
  { id:'loisirs',  e:'🎲', l:'Loisirs',      sub:'Fun immédiat',             c:'#D97706',
    img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80',
    subs:['Bowling','Escape game','Gaming café','Laser game','Ateliers cuisine','Ateliers créatifs'] },
  { id:'manger',   e:'🍽️', l:'Manger',       sub:'Family friendly',          c:'#E91E8C',
    img:'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=700&q=80',
    subs:['Restaurants famille','Fast food famille','Spots pique-nique','Glacier & goûter','Boulangeries','Salons de thé'] },
  { id:'events',   e:'🎉', l:'Événements',   sub:'Ce weekend',               c:'#1B2B4B',
    img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80',
    subs:['Ce weekend','Fêtes & marchés','Festivals famille','Événements saisonniers','Expos temporaires'] },
]

const RADII   = [5, 10, 20, 30]
const BUDGETS = ['Gratuit', '-20€', '-50€', '-100€', 'Libre']

const SUGGESTIONS = [
  'Parc près de moi 🌳', 'Gratuit ce weekend 💚', 'Piscine couverte 🏊',
  'Musée enfants 🏛️', 'Accrobranche 🌲', 'Bowling famille 🎳',
]

// ─── LOGO ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:38, height:38, borderRadius:11,
        background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 12px rgba(255,107,74,0.35)',
        flexShrink:0,
      }}>
        <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:15, color:'#fff', letterSpacing:'-0.5px' }}>fk</span>
      </div>
      <div>
        <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:17, color:'#1B2B4B', lineHeight:1 }}>FelioKids</div>
        <div style={{ fontSize:10, color:'#9AAABB', fontWeight:600, letterSpacing:'0.6px', marginTop:1 }}>ACTIVITÉS FAMILLE</div>
      </div>
    </div>
  )
}

// ─── CATEGORY TILE ────────────────────────────────────────────────────────────

function CatTile({ cat, active, wide, onClick, delay }) {
  return (
    <button
      onClick={onClick}
      className="anim-up"
      style={{
        animationDelay: `${delay}s`,
        position:'relative', overflow:'hidden',
        borderRadius:20, width:'100%',
        height: wide ? 160 : 140,
        border: active ? `2.5px solid ${cat.c}` : '2.5px solid transparent',
        boxShadow: active
          ? `0 0 0 3px ${cat.c}30, 0 8px 32px rgba(0,0,0,0.16)`
          : '0 2px 12px rgba(27,43,75,0.10)',
        transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
        transform: active ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <img src={cat.img} alt={cat.l} loading="lazy"
        style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }} />

      {/* Gradient overlay */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(160deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.58) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position:'absolute', bottom:13, left:13, right:40,
        display:'flex', alignItems:'center', gap:9,
      }}>
        <div style={{
          width:34, height:34, borderRadius:10,
          background:'rgba(255,255,255,0.20)',
          backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, flexShrink:0,
        }}>{cat.e}</div>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize: wide ? 19 : 16, fontWeight:800, color:'#fff', lineHeight:1.1, textShadow:'0 1px 6px rgba(0,0,0,0.5)' }}>{cat.l}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.78)', fontWeight:500, marginTop:2 }}>{cat.sub}</div>
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        position:'absolute', right:12, bottom:16,
        width:26, height:26, borderRadius:8,
        background:'rgba(255,255,255,0.18)',
        backdropFilter:'blur(6px)',
        border:'1px solid rgba(255,255,255,0.25)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#fff', fontSize:15, fontWeight:700,
      }}>›</div>
    </button>
  )
}

// ─── SUBS PANEL ───────────────────────────────────────────────────────────────

function SubsPanel({ cat, activeSub, onSub }) {
  return (
    <div className="anim-down" style={{
      background:'#fff', borderRadius:18, padding:'13px 14px 14px',
      marginBottom:10, marginTop:2,
      boxShadow:`0 4px 24px rgba(0,0,0,0.08), inset 0 0 0 1.5px ${cat.c}25`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:11 }}>
        <span style={{ fontSize:15 }}>{cat.e}</span>
        <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:13, color:'#1B2B4B' }}>{cat.l}</span>
        <span style={{ fontSize:11, color:'#9AAABB', marginLeft:2 }}>Que cherches-tu ?</span>
      </div>
      <div className="scroll-x" style={{ display:'flex', gap:7, paddingBottom:2 }}>
        {cat.subs.map(s => (
          <button key={s} onClick={() => onSub(s)} style={{
            padding:'8px 15px', borderRadius:99, fontSize:12, fontWeight:700,
            flexShrink:0, transition:'all .18s',
            background: activeSub === s ? cat.c : '#F5F3F0',
            color: activeSub === s ? '#fff' : '#5A6A82',
            boxShadow: activeSub === s ? `0 3px 12px ${cat.c}44` : 'none',
            border: activeSub === s ? 'none' : '1.5px solid #EDE8E1',
          }}>{s}</button>
        ))}
      </div>
    </div>
  )
}

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────

function ActivityCard({ a, idx }) {
  const [restoOpen, setRestoOpen] = useState(false)
  const addr = encodeURIComponent(a.address)

  const imgKeywords = a.type.toLowerCase().replace(/ /g, '+') + '+france'

  return (
    <div className="anim-up" style={{
      animationDelay:`${idx * 0.06}s`,
      background:'#fff', borderRadius:22, overflow:'hidden',
      boxShadow:'0 2px 18px rgba(27,43,75,0.09)', marginBottom:14,
      border:'1px solid #F0EBE3',
    }}>
      {/* Image header */}
      <div style={{ position:'relative', height:168, background:'#EDE8E1', overflow:'hidden' }}>
        <img
          src={`https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=600&q=75`}
          alt={a.name}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(27,43,75,0.65) 0%, transparent 55%)' }} />

        {/* Badges */}
        <div style={{ position:'absolute', top:12, left:12 }}>
          {a.isFree && <span style={{ background:'#3DAA6E', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:99 }}>💚 Gratuit</span>}
        </div>
        <div style={{ position:'absolute', top:12, right:12 }}>
          <span style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 11px', borderRadius:99, border:'1px solid rgba(255,255,255,0.3)' }}>⭐ {a.rating}</span>
        </div>

        {/* Name */}
        <div style={{ position:'absolute', bottom:13, left:14, right:14 }}>
          <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:17, fontWeight:800, color:'#fff', textShadow:'0 1px 8px rgba(0,0,0,0.4)', lineHeight:1.2 }}>{a.name}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.78)', marginTop:3, fontWeight:500 }}>{a.type} · {a.distance}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'13px 15px 0' }}>
        {/* Meta row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:12, color: a.openNow ? '#3DAA6E' : '#DC2626' }}>
              {a.openNow ? '● Ouvert' : '● Fermé'}
            </span>
            {a.hours && <span style={{ fontSize:12, color:'#9AAABB' }}>· {a.hours}</span>}
          </div>
          <div style={{ fontSize:14, fontWeight:800, color:'#FF6B4A', flexShrink:0 }}>{a.price}</div>
        </div>

        <p style={{ fontSize:13, color:'#5A6A82', lineHeight:1.6, marginBottom:10 }}>{a.description}</p>

        {/* Tags */}
        {a.tags?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
            {a.tags.slice(0,4).map(t => (
              <span key={t} style={{ background:'#FFF0E4', color:'#FF6B4A', fontSize:11, padding:'3px 9px', borderRadius:99, fontWeight:600 }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* 3 action buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid #F5F1EC' }}>
        {[
          { icon:'🗺️', label:'Itinéraire', url:`https://www.google.com/maps/dir/?api=1&destination=${addr}`, col:'#2F80ED' },
          { icon:'🅿️', label:'Parking',    url:`https://www.google.com/maps/search/parking+près+de+${addr}`, col:'#D97706' },
          { icon:'🍽️', label: restoOpen ? 'Fermer' : 'Manger', action:() => setRestoOpen(!restoOpen), col:'#E91E8C' },
        ].map((btn, i) => (
          <button key={i}
            onClick={() => btn.url ? window.open(btn.url,'_blank') : btn.action()}
            style={{
              padding:'12px 6px',
              borderRight: i < 2 ? '1px solid #F5F1EC' : 'none',
              fontSize:12, fontWeight:700, color:'#9AAABB',
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              transition:'background .12s, color .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#FFF8F1'; e.currentTarget.style.color=btn.col }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9AAABB' }}
          >
            <span style={{ fontSize:17 }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Restaurants */}
      {restoOpen && (
        <div className="anim-in" style={{ padding:'12px 15px 14px', background:'#FAFAF9', borderTop:'1px solid #F5F1EC' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#9AAABB', marginBottom:9 }}>🍽️ Restaurants à proximité</div>
          {a.restaurants?.length > 0 ? a.restaurants.map((r, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', borderRadius:13, padding:'9px 12px', marginBottom:7, border:'1px solid #F0EBE3' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1B2B4B' }}>{r.name}</div>
                <div style={{ fontSize:11, color:'#9AAABB', marginTop:2 }}>{r.type} · {r.distance}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, color:'#9AAABB', fontWeight:600 }}>{r.price}</span>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.name)}`, '_blank')}
                  style={{ background:'#FF6B4A', color:'#fff', fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:99 }}>
                  Maps
                </button>
              </div>
            </div>
          )) : <div style={{ color:'#C5C5C5', fontSize:13, textAlign:'center', padding:'6px 0' }}>Aucun restaurant trouvé</div>}
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
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(27,43,75,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:26, padding:'32px 26px', maxWidth:360, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(27,43,75,0.2)' }}>
        {!sent ? <>
          <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
          <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:20, color:'#1B2B4B', marginBottom:7 }}>Alertes activités</div>
          <p style={{ fontSize:13, color:'#9AAABB', marginBottom:18, lineHeight:1.7 }}>Reçois chaque semaine les meilleures activités famille près de chez toi !</p>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'13px 15px', borderRadius:13, border:'2px solid #EDE8E1', fontSize:14, marginBottom:10, color:'#1B2B4B', fontWeight:500 }}
            onFocus={e => e.target.style.border='2px solid #FF6B4A'}
            onBlur={e => e.target.style.border='2px solid #EDE8E1'}
          />
          <button onClick={() => email && setSent(true)} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', color:'#fff', borderRadius:13, fontSize:15, fontWeight:800, boxShadow:'0 4px 16px rgba(255,107,74,0.35)' }}>
            S'inscrire gratuitement 🎉
          </button>
        </> : <>
          <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
          <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:20, color:'#1B2B4B', marginBottom:7 }}>C'est parti !</div>
          <p style={{ fontSize:13, color:'#9AAABB', marginBottom:18 }}>Tu recevras les meilleures activités sur <b style={{ color:'#1B2B4B' }}>{email}</b> !</p>
          <button onClick={onClose} style={{ width:'100%', padding:12, background:'#F5F3F0', color:'#5A6A82', borderRadius:13, fontSize:14, fontWeight:700 }}>Fermer</button>
        </>}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [city,         setCity]         = useState('')
  const [lat,          setLat]          = useState(null)
  const [lon,          setLon]          = useState(null)
  const [radius,       setRadius]       = useState(10)
  const [budget,       setBudget]       = useState('Libre')
  const [activeCat,    setActiveCat]    = useState(null)
  const [activeSub,    setActiveSub]    = useState(null)
  const [weather,      setWeather]      = useState(null)
  const [results,      setResults]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [citySuggs,    setCitySuggs]    = useState([])
  const [showSugg,     setShowSugg]     = useState(false)
  const [showEmail,    setShowEmail]    = useState(false)
  const [hasSearched,  setHasSearched]  = useState(false)
  const cityTimer = useRef(null)

  // City autocomplete
  const handleCityInput = useCallback(async (val) => {
    setCity(val); setLat(null); setLon(null); setWeather(null)
    if (val.length < 2) { setCitySuggs([]); setShowSugg(false); return }
    clearTimeout(cityTimer.current)
    cityTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=fr&format=json&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        const d = await r.json()
        const s = d.filter(x => ['city','town','village','municipality'].includes(x.type) || x.class==='place').slice(0,5)
        const f = s.length ? s : d.slice(0,4)
        setCitySuggs(f); setShowSugg(f.length > 0)
      } catch { setCitySuggs([]); setShowSugg(false) }
    }, 380)
  }, [])

  const chooseSugg = useCallback(async (s) => {
    const name = s.display_name.split(',')[0].trim()
    const lt = parseFloat(s.lat), ln = parseFloat(s.lon)
    setCity(name); setLat(lt); setLon(ln)
    setCitySuggs([]); setShowSugg(false)
    try {
      const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lt}&longitude=${ln}&current=temperature_2m,weathercode&timezone=auto`)
      const wd = await wr.json()
      const t = Math.round(wd.current.temperature_2m)
      const c = wd.current.weathercode
      const em = c===0||c===1?'☀️':c<=3?'⛅':c>=51&&c<=82?'🌧️':c>=95?'⛈️':c>=71&&c<=77?'❄️':'🌤️'
      setWeather({ icon:em, temp:t })
    } catch {}
  }, [])

  // Search
  const doSearch = useCallback((catId, sub, bgt) => {
    const cat = catId !== undefined ? catId : activeCat
    const s   = sub   !== undefined ? sub   : activeSub
    const b   = bgt   !== undefined ? bgt   : budget
    if (!cat) return
    setLoading(true); setHasSearched(true)
    setTimeout(() => {
      setResults(getActivities(cat, s, b))
      setLoading(false)
    }, 500)
  }, [activeCat, activeSub, budget])

  const clickCat = (id) => {
    if (activeCat === id) {
      setActiveCat(null); setActiveSub(null); setResults([]); setHasSearched(false)
    } else {
      setActiveCat(id); setActiveSub(null)
      doSearch(id, null, budget)
    }
  }

  const clickSub = (sub) => {
    const next = activeSub === sub ? null : sub
    setActiveSub(next)
    doSearch(activeCat, next, budget)
  }

  // Layout: wide / 2col / wide / 2col...
  const renderLayout = () => {
    const els = []
    let i = 0, rowIdx = 0
    while (i < CATS.length) {
      if (rowIdx % 2 === 0) {
        const cat = CATS[i]
        els.push(
          <div key={cat.id} style={{ marginBottom:10 }}>
            <CatTile cat={cat} active={activeCat===cat.id} wide delay={i*0.05} onClick={() => clickCat(cat.id)} />
            {activeCat === cat.id && <div style={{ marginTop:8 }}><SubsPanel cat={cat} activeSub={activeSub} onSub={clickSub} /></div>}
          </div>
        )
        i++
      } else {
        const pair = CATS.slice(i, i+2)
        const activeInPair = pair.find(c => c.id === activeCat)
        els.push(
          <div key={`row${i}`} style={{ marginBottom:10 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {pair.map((cat, j) => (
                <CatTile key={cat.id} cat={cat} active={activeCat===cat.id} wide={false} delay={(i+j)*0.05} onClick={() => clickCat(cat.id)} />
              ))}
            </div>
            {activeInPair && <div style={{ marginTop:8 }}><SubsPanel cat={activeInPair} activeSub={activeSub} onSub={clickSub} /></div>}
          </div>
        )
        i += 2
      }
      rowIdx++
    }
    return els
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FFF8F1' }}>
      <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:40 }}>

        {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}

        {/* ── HERO ── */}
        <div style={{ position:'relative', height:260, overflow:'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80"
            alt="hero"
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(27,43,75,0.15) 0%, rgba(27,43,75,0.72) 100%)' }} />

          {/* Top bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Logo />
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {weather && (
                <div style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:600, border:'1px solid rgba(255,255,255,0.28)' }}>
                  {weather.icon} {weather.temp}°C
                </div>
              )}
              <button onClick={() => setShowEmail(true)}
                style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:700, border:'1px solid rgba(255,255,255,0.28)' }}>
                🔔
              </button>
            </div>
          </div>

          {/* Hero text */}
          <div style={{ position:'absolute', bottom:20, left:18, right:18 }}>
            <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:22, fontWeight:800, color:'#fff', lineHeight:1.25, textShadow:'0 2px 10px rgba(0,0,0,0.4)' }}>
              Que faire avec les enfants<br />aujourd'hui ?
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div style={{ padding:'0 14px', marginTop:-22, position:'relative', zIndex:10 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'14px 15px', boxShadow:'0 8px 32px rgba(27,43,75,0.13)', border:'1px solid #F0EBE3' }}>

            {/* City */}
            <div style={{ position:'relative', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', background:'#FFF8F1', borderRadius:13, padding:'11px 14px', gap:8, border:'1.5px solid #EDE8E1', transition:'border .2s' }}
                onFocus={() => {}} >
                <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                <input
                  style={{ flex:1, fontSize:14, fontWeight:600, color:'#1B2B4B' }}
                  placeholder="Ta ville... (Paris, Lyon, Bordeaux...)"
                  value={city}
                  onChange={e => handleCityInput(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter' && citySuggs[0]) chooseSugg(citySuggs[0]) }}
                  onFocus={() => { if(citySuggs.length) setShowSugg(true) }}
                  onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                />
                {city && <button onClick={() => { setCity(''); setWeather(null) }} style={{ color:'#C5C5C5', fontSize:15, lineHeight:1 }}>✕</button>}
              </div>

              {/* Suggestions dropdown */}
              {showSugg && citySuggs.length > 0 && (
                <div className="anim-down" style={{ position:'absolute', top:'110%', left:0, right:0, background:'#fff', borderRadius:15, boxShadow:'0 8px 32px rgba(27,43,75,0.13)', zIndex:50, overflow:'hidden', border:'1px solid #F0EBE3' }}>
                  {citySuggs.map((s, i) => (
                    <div key={i}
                      style={{ padding:'11px 15px', fontSize:14, cursor:'pointer', borderBottom: i < citySuggs.length-1 ? '1px solid #F5F1EC' : 'none', fontWeight:500, color:'#1B2B4B', display:'flex', alignItems:'center', gap:8 }}
                      onMouseDown={() => chooseSugg(s)}
                      onMouseEnter={e => e.currentTarget.style.background='#FFF8F1'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}
                    >
                      <span style={{ fontSize:13 }}>📍</span>
                      {s.display_name.split(',').slice(0,3).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Radius + Budget scrollable row */}
            <div className="scroll-x" style={{ display:'flex', gap:6, paddingBottom:2 }}>
              {RADII.map(r => (
                <button key={r} onClick={() => { setRadius(r); if(activeCat) doSearch(activeCat,activeSub,budget) }}
                  style={{ padding:'7px 13px', borderRadius:99, fontSize:12, fontWeight:700, flexShrink:0, transition:'all .15s', background: radius===r ? '#1B2B4B' : '#F5F3F0', color: radius===r ? '#fff' : '#5A6A82', border: radius===r ? 'none' : '1.5px solid #EDE8E1' }}>
                  {r} km
                </button>
              ))}
              <div style={{ width:1, background:'#EDE8E1', margin:'0 2px', flexShrink:0 }} />
              {BUDGETS.map(b => (
                <button key={b} onClick={() => { setBudget(b); if(activeCat) doSearch(activeCat,activeSub,b) }}
                  style={{ padding:'7px 13px', borderRadius:99, fontSize:12, fontWeight:700, flexShrink:0, transition:'all .15s', background: budget===b ? (b==='Gratuit'?'#3DAA6E':'#FF6B4A') : '#F5F3F0', color: budget===b ? '#fff' : '#5A6A82', border: budget===b ? 'none' : '1.5px solid #EDE8E1' }}>
                  {b}
                </button>
              ))}
            </div>

            {/* Smart suggestions */}
            {!hasSearched && (
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9AAABB', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.5px' }}>Suggestions</div>
                <div className="scroll-x" style={{ display:'flex', gap:6 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s}
                      onClick={() => { const cat = CATS.find(c => c.subs.some(sub => s.toLowerCase().includes(sub.toLowerCase().split(' ')[0]))) || CATS[0]; clickCat(cat.id) }}
                      style={{ padding:'7px 13px', borderRadius:99, fontSize:12, fontWeight:600, flexShrink:0, background:'#FFF0E4', color:'#FF6B4A', border:'1.5px solid #FFD4C2', whiteSpace:'nowrap' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CLEAR FILTER ── */}
        {activeCat && (
          <div style={{ padding:'12px 14px 0', display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => { setActiveCat(null); setActiveSub(null); setResults([]); setHasSearched(false) }}
              style={{ padding:'7px 16px', borderRadius:99, background:'#fff', border:'1.5px solid #EDE8E1', color:'#5A6A82', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:5, boxShadow:'0 2px 8px rgba(27,43,75,0.07)' }}>
              ✕ Effacer
            </button>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        <div style={{ padding:'16px 14px 0' }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#FF6B4A', textTransform:'uppercase', letterSpacing:'1px', marginBottom:3 }}>EXPLORER</div>
            <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:24, fontWeight:800, color:'#1B2B4B' }}>Catégories</div>
          </div>
          {renderLayout()}
        </div>

        {/* ── RESULTS ── */}
        <div style={{ padding:'4px 14px 0' }}>
          {loading && (
            <div style={{ textAlign:'center', padding:'44px 0' }}>
              <div style={{ fontSize:44, display:'inline-block', animation:'spin 1s linear infinite' }}>🎡</div>
              <div style={{ color:'#9AAABB', fontSize:14, fontWeight:600, marginTop:12 }}>Recherche en cours...</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#FF6B4A', textTransform:'uppercase', letterSpacing:'1px', marginBottom:3 }}>RÉSULTATS</div>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:22, fontWeight:800, color:'#1B2B4B' }}>
                  {results.length} idées{city ? ` près de ${city}` : ''}
                </div>
              </div>
              {results.map((a, i) => <ActivityCard key={a.id} a={a} idx={i} />)}
            </>
          )}

          {!loading && !hasSearched && (
            <div style={{ textAlign:'center', padding:'24px 0 40px' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>👨‍👩‍👧‍👦</div>
              <div style={{ color:'#9AAABB', fontSize:14, lineHeight:1.8, fontWeight:500 }}>
                Clique sur une catégorie<br />pour découvrir des activités !
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', padding:'16px 0 0', color:'#C5C5C5', fontSize:11 }}>
          🎡 FelioKids · <a href="mailto:feliokids@gmail.com" style={{ color:'#C5C5C5' }}>feliokids@gmail.com</a>
        </div>
      </div>
    </div>
  )
}
