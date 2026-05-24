import { useState, useRef, useCallback, useEffect } from 'react'
import { searchActivities } from './api/overpassService.js'
import NewsletterPopup from './components/NewsletterPopup'
import ActivityCard from './components/ActivityCard.jsx'
import { resetCounters } from './api/requestLogger.js'
import WeekendPanel from './components/WeekendPanel.jsx'

// ─── SLIDES ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=85',
    label: 'FRANCE · SORTIES FAMILLE',
    title: "Que faire avec les enfants aujourd'hui ?",
    sub: 'Trouvez des idées proches, gratuites ou petit budget, avec parking et où manger.',
  },
  {
    img: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&q=85',
    label: 'FRANCE · PLEIN AIR · DÉTENTE',
    title: 'Des moments magiques en famille.',
    sub: 'Parcs, balades, nature — des souvenirs inoubliables près de chez vous.',
  },
  {
    img: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=85',
    label: 'FRANCE · SPORT · ENFANTS',
    title: 'Des activités pour tous les âges.',
    sub: "De 3 à 15 ans — des idées pour toute la famille, petits et grands.",
  },
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=85',
    label: 'FRANCE · NATURE · DÉCOUVERTE',
    title: 'Explorez la France avec vos enfants.',
    sub: 'Des milliers de sorties près de chez vous — gratuites ou petit budget.',
  },
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATS = [
  { id:'gratuit',      l:'Gratuit',              sub:'Tout gratuit près de toi',    c:'#3DAA6E', img:'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80',
    subs:['Parcs & jardins','Forêts & balades','Plages & lacs','Musées gratuits','Événements gratuits','Pistes cyclables','Bibliothèques','Zoos gratuits',"Fontaines & jets d'eau"] },
  { id:'anniversaire', l:'Anniversaires',         sub:"L'anniversaire parfait",      c:'#FF4081', img:'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&q=80',
    subs:['Bowling & laser game','Accrobranche','Restaurants fête','Ateliers créatifs','Escape game','Cinéma privatisé','Karting enfants','Parcs aquatiques'] },
  { id:'pluie',        l:'Pluie & Intérieur',     sub:'Quand il pleut dehors',       c:'#4A6FA5', img:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    subs:['Cinéma','Bowling','Aquarium','Trampoline','Laser game','Musées interactifs','Piscines couvertes','Bibliothèques & médiathèques','Cafés jeux','Ateliers créatifs'] },
  { id:'culture',      l:'Culture & Découverte',  sub:"Apprendre en s'amusant",      c:'#7C3AED', img:'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&q=80',
    subs:["Châteaux & histoire","Musées d'art",'Théâtre enfants','Planétarium','Sciences & découverte','Patrimoine UNESCO','Visites guidées famille','Cirque'] },
  { id:'nature',       l:'Nature & Animaux',      sub:'Plein air & rencontres',      c:'#059669', img:'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&q=80',
    subs:['Forêts & randonnée','Lacs & baignade','Plages','Zoos & parcs animaliers','Fermes pédagogiques','Cascades','Pêche en famille','Barbecue légal','Cueillette fruits','Camping & picnic','Observation oiseaux'] },
  { id:'sport',        l:'Sport & Activités',     sub:'Bougez en famille',           c:'#2F80ED', img:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80',
    subs:['Vélo & VTT','Football & terrains','Piscines','Ski & glisse','Tennis & padel','Accrobranche','Skateparks','Patinoire','Escalade','Ping-pong','Sports nautiques'] },
  { id:'events',       l:'Weekend & Événements',  sub:'Ce weekend près de toi',      c:'#1B2B4B', img:'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&q=80',
    subs:['Festivals famille','Fêtes & marchés','Brocante','Spectacles','Expos temporaires','Concerts gratuits',"Feux d'artifice",'Événements saisonniers','Compétitions sportives'] },
  { id:'halte',        l:'Halte Garderie',        sub:'1h pour vous ressourcer',     c:'#8B5CF6', img:'https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=400&q=80',
    subs:['Sport avec garderie','IKEA Småland','Centres de loisirs','Ateliers sans parents','Espaces kids galeries','Piscines avec garderie','Associations locales'] },
  { id:'ateliers',     l:'Ateliers Créatifs',     sub:"Créer & s'exprimer",          c:'#D97706', img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
    subs:['Ateliers peinture','Poterie enfants','Cuisine créative','Ateliers musique','Bibliothèques & médiathèques','Ateliers science','Couture & DIY','Théâtre enfants','Ateliers numériques'] },
]

// ─── LOGO FELIOKIDS — używane wszędzie ───────────────────────────────────────
function FelioLogo({ size = 36, fontSize = 14 }) {
  return (
    <div style={{ width:size, height:size, borderRadius: Math.round(size * 0.27), background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(255,107,74,0.45)', position:'relative', flexShrink:0 }}>
      <span style={{ fontWeight:900, fontSize, color:'#fff', letterSpacing:'-0.5px' }}>f<span style={{textTransform:'uppercase'}}>K</span></span>
      <div style={{ position:'absolute', top: Math.round(size*0.13), right: Math.round(size*0.13), width: Math.round(size*0.16), height: Math.round(size*0.16), borderRadius:'50%', background:'rgba(255,255,255,0.7)' }} />
    </div>
  )
}

// ─── HERO SLIDESHOW ───────────────────────────────────────────────────────────
function HeroSlideshow({ onWeekendClick }) {
  const [cur, setCur] = useState(0)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setCur(c => (c + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const goTo = (n) => setCur(n)

  return (
    <div style={{ position:'relative', width:'100%', height:'300px', overflow:'hidden', flexShrink:0 }}>
      {SLIDES.map((s, i) => (
        <div key={i} style={{ position:'absolute', inset:0, opacity: i === cur ? 1 : 0, transition: 'opacity 1.2s ease', zIndex: i === cur ? 1 : 0 }}>
          <img src={s.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(10,20,40,0.18) 0%, rgba(10,20,40,0.80) 100%)' }} />
        </div>
      ))}

      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10 }}>
        <button onClick={() => window.location.reload()} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <FelioLogo size={36} fontSize={14} />
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:'#fff', lineHeight:1, textShadow:'0 1px 6px rgba(0,0,0,0.3)', fontFamily:'var(--font-head)' }}>FelioKids</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', fontWeight:600, letterSpacing:'0.8px', fontFamily:'var(--font-body)' }}>FAMILY DISCOVERY</div>
          </div>
        </button>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          <button onClick={onWeekendClick} style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'6px 12px', borderRadius:99, fontSize:11, fontWeight:700, border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
            ✨ Weekend
          </button>
          <button onClick={() => setPopupOpen(true)} style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'6px 12px', borderRadius:99, fontSize:11, fontWeight:700, border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
            🔔 Alertes
          </button>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:32, left:20, right:20, zIndex:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.62)', letterSpacing:'1.8px', marginBottom:8 }}>{SLIDES[cur].label}</div>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:23, fontWeight:900, color:'#fff', lineHeight:1.22, marginBottom:8, textShadow:'0 2px 14px rgba(0,0,0,0.35)' }}>{SLIDES[cur].title}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.76)', lineHeight:1.6, fontWeight:500 }}>{SLIDES[cur].sub}</div>
      </div>

      <div style={{ position:'absolute', bottom:12, right:18, display:'flex', gap:5, zIndex:10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ width: i === cur ? 20 : 6, height:6, borderRadius:99, padding:0, background: i === cur ? '#FF6B4A' : 'rgba(255,255,255,0.4)', transition:'all .3s' }} />
        ))}
      </div>
      <NewsletterPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  )
}

// ─── CAT TILE ─────────────────────────────────────────────────────────────────
function CatTile({ cat, active, onClick, delay }) {
  return (
    <button id={`cat-tile-${cat.id}`} onClick={onClick} className="anim-up" style={{
      animationDelay:`${delay}s`, position:'relative', overflow:'hidden', borderRadius:18, width:'100%', aspectRatio:'1',
      border: active ? `3px solid ${cat.c}` : '3px solid transparent',
      boxShadow: active ? `0 0 0 2px ${cat.c}44, 0 8px 28px rgba(0,0,0,0.18)` : '0 2px 12px rgba(27,43,75,0.10)',
      transition:'all .22s cubic-bezier(.22,.68,0,1.2)', transform: active ? 'scale(1.03)' : 'scale(1)',
    }}>
      <img src={cat.img} alt={cat.l} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,0,0,0.04) 0%,rgba(0,0,0,0.68) 100%)' }} />
      {active && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cat.c }} />}
      <div style={{ position:'absolute', bottom:10, left:10, right:28 }}>
        <div style={{ fontSize:13, fontWeight:800, color:'#fff', lineHeight:1.15, textShadow:'0 1px 5px rgba(0,0,0,0.5)' }}>{cat.l}</div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', fontWeight:500, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
      </div>
      <div style={{ position:'absolute', right:8, bottom:13, width:20, height:20, borderRadius:6, background:'rgba(255,255,255,0.22)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700 }}>›</div>
    </button>
  )
}

// ─── SUBS PANEL ───────────────────────────────────────────────────────────────
function SubsPanel({ cat, activeSub, onSub }) {
  return (
    <div className="anim-down" style={{ background:'#fff', borderRadius:16, padding:'12px 14px 14px', marginTop:8, marginBottom:2, boxShadow:`0 4px 20px rgba(0,0,0,0.09), inset 0 0 0 1.5px ${cat.c}25` }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
        <span style={{ fontWeight:800, fontSize:13, color:'#1B2B4B' }}>{cat.l}</span>
        <span style={{ fontSize:11, color:'#9AAABB' }}>— Que cherches-tu ?</span>
      </div>
      <div className="scroll-x" style={{ display:'flex', gap:7, paddingBottom:2 }}>
        {cat.subs.map(s => (
          <button key={s} onClick={() => onSub(s)} style={{
            padding:'8px 15px', borderRadius:99, fontSize:12, fontWeight:700, flexShrink:0, transition:'all .18s',
            background: activeSub === s ? cat.c : '#F5F3F0', color: activeSub === s ? '#fff' : '#5A6A82',
            border: activeSub === s ? 'none' : '1.5px solid #EDE8E1', boxShadow: activeSub === s ? `0 3px 10px ${cat.c}44` : 'none',
          }}>{s}</button>
        ))}
      </div>
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
          <div style={{ fontWeight:800, fontSize:20, color:'#1B2B4B', marginBottom:7 }}>Alertes activités</div>
          <p style={{ fontSize:13, color:'#9AAABB', marginBottom:18, lineHeight:1.7 }}>Reçois chaque semaine les meilleures activités famille près de chez toi !</p>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'13px 15px', borderRadius:13, border:'2px solid #EDE8E1', fontSize:14, marginBottom:10, color:'#1B2B4B', fontWeight:500 }}
            onFocus={e => e.target.style.border='2px solid #FF6B4A'} onBlur={e => e.target.style.border='2px solid #EDE8E1'} />
          <button onClick={() => email && setSent(true)} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', color:'#fff', borderRadius:13, fontSize:15, fontWeight:800, boxShadow:'0 4px 16px rgba(255,107,74,0.35)' }}>
            S'inscrire gratuitement 🎉
          </button>
        </> : <>
          <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:20, color:'#1B2B4B', marginBottom:7 }}>C'est parti !</div>
          <p style={{ fontSize:13, color:'#9AAABB', marginBottom:18 }}>Tu recevras les meilleures activités sur <b style={{ color:'#1B2B4B' }}>{email}</b> !</p>
          <button onClick={onClose} style={{ width:'100%', padding:12, background:'#F5F3F0', color:'#5A6A82', borderRadius:13, fontSize:14, fontWeight:700 }}>Fermer</button>
        </>}
      </div>
    </div>
  )
}

// ─── BANER POGODOWY ───────────────────────────────────────────────────────────
function WeatherBanner({ weather, city, setActiveCat, setActiveSub, doSearch }) {
  if (!weather || !city) return null
  const { code, temp, icon } = weather
  const isRain = (code >= 51 && code <= 82) || code >= 95
  const isSnow = code >= 71 && code <= 77
  const isHot  = temp > 28 && code <= 3
  const isCold = temp < 10 && code <= 3

  let gradient, emoji, line1, line2, catId, subName
  if (isRain)      { gradient='linear-gradient(135deg,#4A6FA5,#3557A0)'; emoji='🌧️'; line1=`Il pleut à ${city} — voir nos idées indoor`; line2='Cinémas · Bowlings · Piscines couvertes →'; catId='pluie'; subName='Cinéma' }
  else if (isSnow) { gradient='linear-gradient(135deg,#7C9CBF,#5B7FA6)'; emoji='❄️'; line1=`Il neige à ${city} — activités hiver`; line2='Ski · Patinoire · Sports de glisse →'; catId='sport'; subName='Ski & glisse' }
  else if (isHot)  { gradient='linear-gradient(135deg,#E8734A,#C8502A)'; emoji='🥵'; line1=`Chaud à ${city} — plages & lacs`; line2='Baignade · Nature · Fraîcheur →'; catId='nature'; subName='Lacs & baignade' }
  else if (isCold) { gradient='linear-gradient(135deg,#5B7FA6,#3D5A82)'; emoji='🧥'; line1=`Froid à ${city} — sorties couvertes`; line2='Piscines · Musées · Activités indoor →'; catId='pluie'; subName='Piscines couvertes' }
  else             { gradient='linear-gradient(135deg,#3DAA6E,#2A8A55)'; emoji='☀️'; line1=`Beau temps à ${city} — plein air`; line2='Forêts · Randonnées · Nature →'; catId='nature'; subName='Forêts & randonnée' }

  const handleClick = () => {
    setActiveCat(catId); setActiveSub(subName); doSearch(catId, subName)
    setTimeout(() => { const tile = document.getElementById(`cat-tile-${catId}`); if (tile) tile.scrollIntoView({ behavior:'smooth', block:'center' }) }, 200)
    setTimeout(() => { document.getElementById('results-section')?.scrollIntoView({ behavior:'smooth' }) }, 900)
  }

  return (
    <button onClick={handleClick} style={{ width:'100%', background:gradient, borderRadius:14, padding:'12px 15px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, border:'none', cursor:'pointer', boxShadow:'0 3px 16px rgba(0,0,0,0.15)', transition:'transform .15s ease, box-shadow .15s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.015)'; e.currentTarget.style.boxShadow='0 6px 22px rgba(0,0,0,0.22)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 3px 16px rgba(0,0,0,0.15)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{emoji}</span>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#fff', lineHeight:1.35 }}>{line1}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.72)', fontWeight:600, marginTop:3 }}>{icon} {temp}°C · {line2}</div>
        </div>
      </div>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#fff', fontWeight:700 }}>›</div>
    </button>
  )
}

// ─── BANER DÉCOUVRIR TOUT ─────────────────────────────────────────────────────
function getDiscoverQueries(ageFilter) {
  if (ageFilter === '0-3') return [
    { catId:'gratuit', subName:'Parcs & jardins' },
    { catId:'pluie',   subName:'Piscines couvertes' },
    { catId:'pluie',   subName:'Bibliothèques & médiathèques' },
    { catId:'nature',  subName:'Fermes pédagogiques' },
    { catId:'ateliers',subName:'Ateliers créatifs' },
  ]
  if (ageFilter === '4-6') return [
    { catId:'nature',  subName:'Zoos & parcs animaliers' },
    { catId:'gratuit', subName:'Parcs & jardins' },
    { catId:'pluie',   subName:'Aquarium' },
    { catId:'sport',   subName:'Piscines' },
    { catId:'ateliers',subName:'Ateliers peinture' },
  ]
  if (ageFilter === '13+') return [
    { catId:'sport',   subName:'Escalade' },
    { catId:'sport',   subName:'Skateparks' },
    { catId:'pluie',   subName:'Laser game' },
    { catId:'anniversaire', subName:'Escape game' },
    { catId:'culture', subName:'Châteaux & histoire' },
  ]
  return [
    { catId:'nature',  subName:'Forêts & randonnée' },
    { catId:'nature',  subName:'Zoos & parcs animaliers' },
    { catId:'pluie',   subName:'Cinéma' },
    { catId:'sport',   subName:'Piscines' },
    { catId:'culture', subName:'Châteaux & histoire' },
  ]
}

function DecouvrirBanner({ city, radius, budget, setResults, setLoading, setHasSearched, setSearchError, setActiveCat, setActiveSub, ageFilter }) {
  const [running, setRunning] = useState(false)

  const handleClick = async () => {
    if (!city?.trim() || running) return
    setRunning(true); setLoading(true); setHasSearched(true); setSearchError(null); setActiveCat(null); setActiveSub(null)
    try {
      const allResults = await Promise.allSettled(getDiscoverQueries(ageFilter).map(({ catId, subName }) => searchActivities({ city: city.trim(), radiusKm: radius, budget, catId, subName })))
      const flat = allResults.filter(r => r.status === 'fulfilled').flatMap(r => r.value)
      const seen = new Set()
      const unique = flat.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true })
      const parseDist = (d) => parseFloat(String(d ?? '999').replace(/[^\d.]/g, '')) || 999
      unique.sort((a, b) => parseDist(a.distance) - parseDist(b.distance))
      if (unique.length === 0) { setSearchError(`Aucun résultat trouvé près de "${city}". Essayez d'élargir le rayon.`); setResults([]) }
      else { setResults(unique); setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior:'smooth' }), 400) }
    } catch (err) {
      console.error('[DecouvrirTout]', err); setSearchError('Erreur lors de la recherche. Vérifiez votre connexion.'); setResults([])
    } finally { setLoading(false); setRunning(false) }
  }

  if (!city) return null

  return (
    <button onClick={handleClick} disabled={running} style={{ width:'100%', background:'linear-gradient(135deg,#1B2B4B,#2C3E6A)', borderRadius:14, padding:'12px 15px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, border:'none', cursor: running ? 'wait' : 'pointer', boxShadow:'0 3px 16px rgba(27,43,75,0.25)', transition:'transform .15s ease, box-shadow .15s ease', opacity: running ? 0.9 : 1 }}
      onMouseEnter={e => { if (!running) { e.currentTarget.style.transform='scale(1.015)'; e.currentTarget.style.boxShadow='0 6px 22px rgba(27,43,75,0.35)' }}}
      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 3px 16px rgba(27,43,75,0.25)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{running ? '⏳' : '🗺️'}</span>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#fff', lineHeight:1.35 }}>{running ? 'Recherche en cours…' : `Découvrir tout à ${city}`}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', fontWeight:600, marginTop:3 }}>
            {running
              ? (ageFilter === '0-3' ? 'Parcs · Piscines · Bibliothèques · Fermes…' : 'Forêts · Zoos · Cinémas · Piscines · Châteaux…')
              : (ageFilter === '0-3' ? 'Parcs · Piscines · Bibliothèques · Fermes →' : 'Forêts · Zoos · Cinémas · Piscines · Châteaux →')
            }
          </div>
        </div>
      </div>
      {running
        ? <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, border:'2.5px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', animation:'spin 0.75s linear infinite' }} />
        : <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#fff', fontWeight:700 }}>›</div>
      }
    </button>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [city,        setCity]        = useState('')
  const [radius,      setRadius]      = useState(10)
  const [budget,      setBudget]      = useState('Tous')
  const [query,       setQuery]       = useState('')
  const [activeCat,   setActiveCat]   = useState(null)
  const [activeSub,   setActiveSub]   = useState(null)
  const [weather,     setWeather]     = useState(null)
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [citySuggs,   setCitySuggs]   = useState([])
  const [showSugg,    setShowSugg]    = useState(false)
  const [showEmail,   setShowEmail]   = useState(false)
  const [popupOpen,   setPopupOpen]   = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [weekendOpen,  setWeekendOpen]  = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [ageFilter,    setAgeFilter]    = useState(null)
  const cityTimer = useRef(null)

  const handleCityInput = useCallback(async (val) => {
    setCity(val)
    if (val.length < 2) { setCitySuggs([]); setShowSugg(false); return }
    clearTimeout(cityTimer.current)
    cityTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=fr&format=json&limit=6&addressdetails=1`, { headers:{ 'Accept-Language':'fr' } })
        const d = await r.json()
        const s = d.filter(x => ['city','town','village','municipality'].includes(x.type) || x.class==='place').slice(0,5)
        const f = s.length ? s : d.slice(0,4)
        setCitySuggs(f); setShowSugg(f.length > 0)
      } catch { setCitySuggs([]); setShowSugg(false) }
    }, 380)
  }, [])

  const chooseSugg = useCallback(async (s) => {
    resetCounters()
    const name = s.display_name.split(',')[0].trim()
    setCity(name); setCitySuggs([]); setShowSugg(false)
    setUserLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) })
    try {
      const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,weathercode&timezone=auto`)
      const wd = await wr.json()
      const t = Math.round(wd.current.temperature_2m), c = wd.current.weathercode
      const em = c===0||c===1?'☀️':c<=3?'⛅':c>=51&&c<=82?'🌧️':c>=95?'⛈️':'🌤️'
      setWeather({ icon:em, temp:t, code:c })
    } catch {}
  }, [])

  const doSearch = useCallback(async (catId, sub, bgt, rad) => {
    const cat = catId !== undefined ? catId : activeCat
    const s   = sub   !== undefined ? sub   : activeSub
    const b   = bgt   !== undefined ? bgt   : budget
    const r   = rad   !== undefined ? rad   : radius
    if (!cat || !s) return
    if (!city.trim()) { setSearchError("Entrez d'abord une ville pour lancer la recherche."); return }
    setLoading(true); setSearchError(null); setHasSearched(true)
    try {
      const activities = await searchActivities({ city: city.trim(), radiusKm: r, budget: b, catId: cat, subName: s })
      if (activities.length === 0) {
        setSearchError(`Aucun résultat pour "${s}" dans un rayon de ${r} km autour de "${city}". Essayez d'élargir la zone.`)
        setResults([])
      } else {
        setResults(activities)
        setSearchError(null)
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }
    } catch (err) {
      console.error('[FelioKids]', err)
      if (err.message.includes('introuvable')) setSearchError(`Ville "${city}" introuvable. Vérifiez l'orthographe.`)
      else if (err.message.includes('Overpass')) setSearchError('Service de carte temporairement indisponible. Réessayez dans quelques secondes.')
      else setSearchError('Une erreur est survenue. Vérifiez votre connexion.')
      setResults([])
    } finally { setLoading(false) }
  }, [activeCat, activeSub, budget, city, radius])

  const clickCat = (id) => {
    if (activeCat === id) { setActiveCat(null); setActiveSub(null); setResults([]); setHasSearched(false) }
    else { setActiveCat(id); setActiveSub(null); doSearch(id, null, budget) }
  }
  const clickSub = (sub) => { const next = activeSub === sub ? null : sub; setActiveSub(next); doSearch(activeCat, next, budget) }

  const filterByAge = (activity) => {
    if (!ageFilter) return true
    const cat = activity.catId
    const types = activity.types || []
    const name = (activity.name || '').toLowerCase()
    if (ageFilter === '0-3') {
      const ok = ['gratuit','nature','ateliers','halte'].includes(cat)
      const block = types.some(t => ['bowling_alley','amusement_park','movie_theater'].includes(t))
        || ['karting','accrobranche','escalade','laser','trampoline','escape','patinoire'].some(k => name.includes(k))
      return ok && !block
    }
    if (ageFilter === '4-6') {
      return !['karting','accrobranche','escalade','laser','escape','patinoire'].some(k => name.includes(k))
    }
    return true
  }

  const renderCatGrid = () => {
    const rows = []
    for (let i = 0; i < CATS.length; i += 3) {
      const row = CATS.slice(i, i + 3)
      const activeInRow = row.find(c => c.id === activeCat)
      rows.push(
        <div key={i}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9, marginBottom: activeInRow ? 0 : 9 }}>
            {row.map((cat, j) => <CatTile key={cat.id} cat={cat} active={activeCat===cat.id} delay={(i+j)*0.04} onClick={() => clickCat(cat.id)} />)}
            {row.length < 3 && Array(3-row.length).fill(0).map((_,k) => <div key={`e${k}`} />)}
          </div>
          {activeInRow && <SubsPanel cat={activeInRow} activeSub={activeSub} onSub={clickSub} />}
        </div>
      )
    }
    return rows
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FFF8F1' }}>
      <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:48 }}>

        {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}

        <HeroSlideshow onWeekendClick={() => setWeekendOpen(true)} />

        <div style={{ padding:'0 14px', marginTop:-26, position:'relative', zIndex:10 }}>
          <div style={{ background:'#fff', borderRadius:24, padding:'22px 18px', boxShadow:'0 8px 40px rgba(27,43,75,0.13)', border:'1px solid #F0EBE3' }}>

            <div style={{ position:'relative', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', background:'#FFF8F1', borderRadius:14, padding:'12px 15px', gap:10, border:'1.5px solid #EDE8E1' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                <input
                  style={{ flex:1, fontSize:15, fontWeight:600, color:'#1B2B4B', fontFamily:'var(--font-body)' }}
                  placeholder="Ville ou commune..."
                  value={city}
                  onChange={e => handleCityInput(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter' && citySuggs[0]) chooseSugg(citySuggs[0]) }}
                  onFocus={() => { if(citySuggs.length) setShowSugg(true) }}
                  onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                />
                {weather && <span style={{ fontSize:12, color:'#9AAABB', fontWeight:600, flexShrink:0 }}>{weather.icon} {weather.temp}°C</span>}
                {city && !weather && <button onClick={() => { setCity(''); setWeather(null) }} style={{ color:'#C5C5C5', fontSize:14 }}>✕</button>}
              </div>

              {showSugg && citySuggs.length > 0 && (
                <div className="anim-down" style={{ position:'absolute', top:'110%', left:0, right:0, background:'#fff', borderRadius:15, boxShadow:'0 8px 32px rgba(27,43,75,0.13)', zIndex:50, overflow:'hidden', border:'1px solid #F0EBE3' }}>
                  {citySuggs.map((s, i) => (
                    <div key={i}
                      style={{ padding:'11px 15px', fontSize:14, cursor:'pointer', borderBottom: i<citySuggs.length-1 ? '1px solid #F5F1EC' : 'none', fontWeight:500, color:'#1B2B4B', display:'flex', alignItems:'center', gap:8 }}
                      onMouseDown={() => chooseSugg(s)}
                      onMouseEnter={e => e.currentTarget.style.background='#FFF8F1'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      <span>📍</span>{s.display_name.split(',').slice(0,3).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {city && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                <WeatherBanner weather={weather} city={city} setActiveCat={setActiveCat} setActiveSub={setActiveSub} doSearch={doSearch} />
                <DecouvrirBanner city={city} radius={radius} budget={budget} setResults={setResults} setLoading={setLoading} setHasSearched={setHasSearched} setSearchError={setSearchError} setActiveCat={setActiveCat} setActiveSub={setActiveSub} ageFilter={ageFilter} />
              </div>
            )}

            <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, color:'#9AAABB', marginBottom:10, letterSpacing:'0.2px' }}>
              Vous savez déjà ce que vous cherchez ? 👇
            </p>

            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', background:'#FFF8F1', borderRadius:14, padding:'12px 15px', gap:10, border:'1.5px solid #EDE8E1' }}>
                <span style={{ fontSize:16, flexShrink:0, color:'#9AAABB' }}>🔍</span>
                <input
                  style={{ flex:1, fontSize:14, fontWeight:500, color:'#1B2B4B', fontFamily:'var(--font-body)' }}
                  placeholder="Bowling, cinéma, zoo, anniversaire…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && query.trim()) {
                      const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(Boolean)
                      const matches = terms.map(term => CATS.find(c => c.l.toLowerCase().includes(term) || c.subs.some(s => s.toLowerCase().includes(term)))).filter(Boolean)
                      const cat = matches[0] || CATS[0]
                      setActiveCat(cat.id); doSearch(cat.id, null, budget)
                    }
                  }}
                />
                {query && <button onClick={() => setQuery('')} style={{ color:'#C5C5C5', fontSize:14 }}>✕</button>}
              </div>
              <button
                onClick={() => {
                  if (!query.trim() && !city) return
                  const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(Boolean)
                  const matches = terms.map(term => CATS.find(c => c.l.toLowerCase().includes(term) || c.subs.some(s => s.toLowerCase().includes(term)))).filter(Boolean)
                  const cat = matches[0] || CATS[0]
                  setActiveCat(cat.id); doSearch(cat.id, null, budget)
                }}
                style={{ background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', color:'#fff', padding:'12px 18px', borderRadius:14, fontSize:14, fontWeight:700, flexShrink:0, boxShadow:'0 4px 14px rgba(255,107,74,0.38)', whiteSpace:'nowrap' }}>
                Trouver →
              </button>
            </div>

            <div style={{ borderTop:'1px solid #F5F1EC', paddingTop:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'#C5C5C5', flexShrink:0 }}>📏</span>
                <div style={{ display:'flex', alignItems:'center', gap:0, border:'1.5px solid #EDE8E1', borderRadius:99, overflow:'hidden' }}>
                  <button
                    onPointerDown={() => { const step = () => { setRadius(r => { const next = Math.max(5, r-5); if(activeCat) doSearch(activeCat, activeSub, budget, next); return next }) }; step(); const t = setInterval(step, 400); window._rTimer = t }}
                    onPointerUp={() => clearInterval(window._rTimer)} onPointerLeave={() => clearInterval(window._rTimer)}
                    style={{ width:36, height:34, fontSize:18, fontWeight:700, color:'#1B2B4B', background:'#F5F3F0', borderRight:'1.5px solid #EDE8E1', flexShrink:0 }}>−</button>
                  <div style={{ minWidth:72, textAlign:'center', padding:'0 10px' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#1B2B4B' }}>{radius} km</span>
                  </div>
                  <button
                    onPointerDown={() => { const step = () => { setRadius(r => { const next = Math.min(50, r+5); if(activeCat) doSearch(activeCat, activeSub, budget, next); return next }) }; step(); const t = setInterval(step, 400); window._rTimer = t }}
                    onPointerUp={() => clearInterval(window._rTimer)} onPointerLeave={() => clearInterval(window._rTimer)}
                    style={{ width:36, height:34, fontSize:18, fontWeight:700, color:'#1B2B4B', background:'#F5F3F0', borderLeft:'1.5px solid #EDE8E1', flexShrink:0 }}>+</button>
                </div>
                <span style={{ fontSize:11, color:'#C5C5C5', fontWeight:500 }}>autour de toi</span>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'#C5C5C5', flexShrink:0 }}>👶</span>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {[
                    { id: null,   label: 'Tous' },
                    { id: '0-3',  label: '0-3 ans' },
                    { id: '4-6',  label: '4-6 ans' },
                    { id: '7-12', label: '7-12 ans' },
                    { id: '13+',  label: 'Ado' },
                  ].map(a => (
                    <button key={String(a.id)} onClick={() => setAgeFilter(a.id)} style={{
                      padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                      background: ageFilter === a.id ? '#FF6B4A' : '#F5F3F0',
                      color: ageFilter === a.id ? '#fff' : '#5A6A82',
                      border: ageFilter === a.id ? 'none' : '1.5px solid #EDE8E1',
                      cursor:'pointer', transition:'all .15s',
                    }}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'24px 18px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:1, background:'#EDE8E1' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'#C5C5C5', whiteSpace:'nowrap' }}>ou explorez par catégorie</span>
          <div style={{ flex:1, height:1, background:'#EDE8E1' }} />
        </div>

        <div style={{ padding:'0 14px 0' }}>
          {renderCatGrid()}
        </div>

        <div id="results-section" style={{ padding:'8px 14px 0' }}>
          {searchError && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'1rem 1.25rem', margin:'8px 0 4px', background:'#FFF3F0', border:'1px solid #FFCFC4', borderLeft:'4px solid #FF6B4A', borderRadius:10, fontSize:13, color:'#B03A2E', lineHeight:1.5 }}>
              <span style={{ flexShrink:0 }}>⚠️</span>{searchError}
            </div>
          )}
          {loading && (
            <div style={{ textAlign:'center', padding:'44px 0' }}>
              <div style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>
                <FelioLogo size={52} fontSize={22} />
              </div>
              <div style={{ color:'#9AAABB', fontSize:14, fontWeight:600, marginTop:14 }}>Recherche en cours...</div>
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#1B2B4B' }}>
                  {results.filter(filterByAge).length} idées{city ? ` près de ${city}` : ''}
                  {ageFilter && <span style={{ fontSize:14, fontWeight:600, color:'#FF6B4A', marginLeft:8 }}>· {ageFilter === '0-3' ? '👶' : ageFilter === '4-6' ? '🧒' : ageFilter === '7-12' ? '👦' : '🧑'} {ageFilter} ans</span>}
                </div>
              </div>
              {results.filter(filterByAge).map((activity) => (
                <ActivityCard
                  key={activity.place_id || activity.id}
                  activity={activity}
                  onSelect={(act) => { window.open(`https://www.google.com/maps/place/?q=place_id:${act.place_id}`, '_blank') }}
                />
              ))}
            </>
          )}
          {!loading && !hasSearched && <div style={{ padding:'20px 0' }} />}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', padding:'20px 0 32px', color:'#C5C5C5', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
          <FelioLogo size={22} fontSize={10} />
          FelioKids · <a href="mailto:contact.feliokids@gmail.com" style={{ color:'#FF6B4A', fontWeight:600 }}>contact.feliokids@gmail.com</a>
        </div>

      </div>
      <NewsletterPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
      <WeekendPanel
        lat={userLocation?.lat}
        lng={userLocation?.lng}
        isOpen={weekendOpen}
        onClose={() => setWeekendOpen(false)}
      />
    </div>
  )
}
