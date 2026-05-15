import { useState, useRef, useCallback, useEffect } from 'react'
import { getActivities } from './data/activities.js'

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
  { id:'gratuit',      l:'Gratuit',              sub:'Tout gratuit près de toi',    c:'#3DAA6E', img:'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=75',
    subs:['Parcs & jardins','Forêts & balades','Plages & lacs','Musées gratuits','Événements gratuits','Pistes cyclables','Bibliothèques','Zoos gratuits','Fontaines & jets d\'eau'] },
  { id:'anniversaire', l:'Anniversaires',         sub:"L'anniversaire parfait",      c:'#FF4081', img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75',
    subs:['Bowling & laser game','Accrobranche','Restaurants fête','Ateliers créatifs','Escape game','Cinéma privatisé','Karting enfants','Parcs aquatiques'] },
  { id:'pluie',        l:'Pluie & Intérieur',     sub:'Quand il pleut dehors',       c:'#4A6FA5', img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=75',
    subs:['Cinéma','Bowling','Aquarium','Trampoline','Laser game','Musées interactifs','Piscines couvertes','Bibliothèques & médiathèques','Cafés jeux','Ateliers créatifs'] },
  { id:'culture',      l:'Culture & Découverte',  sub:'Apprendre en s\'amusant',     c:'#7C3AED', img:'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=400&q=75',
    subs:['Châteaux & histoire','Musées d\'art','Théâtre enfants','Planétarium','Sciences & découverte','Patrimoine UNESCO','Visites guidées famille','Cirque'] },
  { id:'nature',       l:'Nature & Animaux',      sub:'Plein air & rencontres',      c:'#059669', img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=75',
    subs:['Forêts & randonnée','Lacs & baignade','Plages','Zoos & parcs animaliers','Fermes pédagogiques','Cascades','Pêche en famille','Barbecue légal','Cueillette fruits','Camping & picnic','Observation oiseaux'] },
  { id:'sport',        l:'Sport & Activités',     sub:'Bougez en famille',           c:'#2F80ED', img:'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=75',
    subs:['Vélo & VTT','Football & terrains','Piscines','Ski & glisse','Tennis & padel','Accrobranche','Skateparks','Patinoire','Escalade','Ping-pong','Sports nautiques'] },
  { id:'events',       l:'Weekend & Événements',  sub:'Ce weekend près de toi',      c:'#1B2B4B', img:'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=75',
    subs:['Festivals famille','Fêtes & marchés','Brocante','Spectacles','Expos temporaires','Concerts gratuits','Feux d\'artifice','Événements saisonniers','Compétitions sportives'] },
  { id:'halte',        l:'Halte Garderie',        sub:'1h pour vous ressourcer',     c:'#8B5CF6', img:'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=75',
    subs:['Sport avec garderie','IKEA Småland','Centres de loisirs','Ateliers sans parents','Espaces kids galeries','Piscines avec garderie','Associations locales'] },
  { id:'ateliers',     l:'Ateliers Créatifs',     sub:'Créer & s\'exprimer',         c:'#D97706', img:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&q=75',
    subs:['Ateliers peinture','Poterie enfants','Cuisine créative','Ateliers musique','Bibliothèques & médiathèques','Ateliers science','Couture & DIY','Théâtre enfants','Ateliers numériques'] },
]

const RADII   = [5, 10, 20, 30]
const BUDGETS = ['Tous', 'Gratuit', '-20€', '-50€', '-100€', 'Nature', 'Intérieur', 'Sport']

// ─── HERO SLIDESHOW ───────────────────────────────────────────────────────────
function HeroSlideshow() {
  const [cur, setCur] = useState(0)
  const [prevCur, setPrevCur] = useState(null)

  useEffect(() => {
    const t = setInterval(() => {
      setCur(c => {
        setPrevCur(c)
        return (c + 1) % SLIDES.length
      })
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const goTo = (n) => { setPrevCur(cur); setCur(n) }

  return (
    <div style={{ position:'relative', width:'100%', height:'300px', overflow:'hidden', flexShrink:0 }}>
      {SLIDES.map((s, i) => (
        <div key={i} style={{
          position:'absolute', inset:0,
          opacity: i === cur ? 1 : 0,
          transition: 'opacity 1.2s ease',
          zIndex: i === cur ? 1 : 0,
        }}>
          <img src={s.img} alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(10,20,40,0.18) 0%, rgba(10,20,40,0.80) 100%)' }} />
        </div>
      ))}

      {/* Top nav — always on top */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(255,107,74,0.45)' }}>
            <span style={{ fontWeight:900, fontSize:14, color:'#fff', letterSpacing:'-0.5px' }}>f<span style={{textTransform:'uppercase'}}>K</span></span>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:'#fff', lineHeight:1, textShadow:'0 1px 6px rgba(0,0,0,0.3)', fontFamily:'var(--font-head)' }}>FelioKids</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', fontWeight:600, letterSpacing:'0.8px', fontFamily:'var(--font-body)' }}>FAMILY DISCOVERY</div>
          </div>
        </div>
        {/* Right buttons */}
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          <div style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'6px 12px', borderRadius:99, fontSize:11, fontWeight:700, border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', gap:5 }}>
            ✨ Weekend
          </div>
          <div style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', color:'#fff', padding:'6px 12px', borderRadius:99, fontSize:11, fontWeight:700, border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', gap:5 }}>
            🔔 Alertes
          </div>
        </div>
      </div>

      {/* Hero text */}
      <div style={{ position:'absolute', bottom:32, left:20, right:20, zIndex:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.62)', letterSpacing:'1.8px', marginBottom:8 }}>
          {SLIDES[cur].label}
        </div>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:23, fontWeight:900, color:'#fff', lineHeight:1.22, marginBottom:8, textShadow:'0 2px 14px rgba(0,0,0,0.35)' }}>
          {SLIDES[cur].title}
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.76)', lineHeight:1.6, fontWeight:500 }}>
          {SLIDES[cur].sub}
        </div>
      </div>

      {/* Dots */}
      <div style={{ position:'absolute', bottom:12, right:18, display:'flex', gap:5, zIndex:10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === cur ? 20 : 6, height:6, borderRadius:99, padding:0,
            background: i === cur ? '#FF6B4A' : 'rgba(255,255,255,0.4)',
            transition:'all .3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── CAT TILE ─────────────────────────────────────────────────────────────────
function CatTile({ cat, active, onClick, delay }) {
  return (
    <button onClick={onClick} className="anim-up" style={{
      animationDelay:`${delay}s`,
      position:'relative', overflow:'hidden', borderRadius:18, width:'100%', aspectRatio:'1',
      border: active ? `3px solid ${cat.c}` : '3px solid transparent',
      boxShadow: active ? `0 0 0 2px ${cat.c}44, 0 8px 28px rgba(0,0,0,0.18)` : '0 2px 12px rgba(27,43,75,0.10)',
      transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
      transform: active ? 'scale(1.03)' : 'scale(1)',
    }}>
      <img src={cat.img} alt={cat.l} loading="lazy"
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,0,0,0.04) 0%,rgba(0,0,0,0.68) 100%)' }} />

      {/* Active color bar at top */}
      {active && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cat.c }} />}

      <div style={{ position:'absolute', bottom:10, left:10, right:28 }}>
        <div style={{ fontSize:13, fontWeight:800, color:'#fff', lineHeight:1.15, textShadow:'0 1px 5px rgba(0,0,0,0.5)' }}>{cat.l}</div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', fontWeight:500, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
      </div>
      <div style={{ position:'absolute', right:8, bottom:13, width:20, height:20, borderRadius:6, background:'rgba(255,255,255,0.22)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700 }}>
        ›
      </div>
    </button>
  )
}

// ─── SUBS PANEL ───────────────────────────────────────────────────────────────
function SubsPanel({ cat, activeSub, onSub }) {
  return (
    <div className="anim-down" style={{
      background:'#fff', borderRadius:16, padding:'12px 14px 14px',
      marginTop:8, marginBottom:2,
      boxShadow:`0 4px 20px rgba(0,0,0,0.09), inset 0 0 0 1.5px ${cat.c}25`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
        <span style={{ fontSize:15 }}>{cat.e}</span>
        <span style={{ fontWeight:800, fontSize:13, color:'#1B2B4B' }}>{cat.l}</span>
        <span style={{ fontSize:11, color:'#9AAABB' }}>— Que cherches-tu ?</span>
      </div>
      <div className="scroll-x" style={{ display:'flex', gap:7, paddingBottom:2 }}>
        {cat.subs.map(s => (
          <button key={s} onClick={() => onSub(s)} style={{
            padding:'8px 15px', borderRadius:99, fontSize:12, fontWeight:700,
            flexShrink:0, transition:'all .18s',
            background: activeSub === s ? cat.c : '#F5F3F0',
            color: activeSub === s ? '#fff' : '#5A6A82',
            border: activeSub === s ? 'none' : '1.5px solid #EDE8E1',
            boxShadow: activeSub === s ? `0 3px 10px ${cat.c}44` : 'none',
          }}>{s}</button>
        ))}
      </div>
    </div>
  )
}

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────

const TYPE_IMGS = {
  'parc':           'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=600&q=75',
  'jardin':         'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=75',
  'promenade':      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75',
  'forêt':          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75',
  'plage':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'lac':            'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=75',
  'zoo':            'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&q=75',
  'ferme':          'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=75',
  'aquarium':       'https://images.unsplash.com/photo-1520694478166-daaaaec95b69?w=600&q=75',
  'musée':          'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=600&q=75',
  'château':        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600&q=75',
  'patrimoine':     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=75',
  'site naturel':   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'gorges':         'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'piscine':        'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=75',
  'patinoire':      'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=75',
  'accrobranche':   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75',
  'vélo':           'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&q=75',
  'bowling':        'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=600&q=75',
  'escape':         'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&q=75',
  'laser':          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=75',
  'trampoline':     'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=75',
  'cinéma':         'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=75',
  'ciné':           'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=75',
  'théâtre':        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=75',
  'planétarium':    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=75',
  'atelier':        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=75',
  'cueillette':     'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=75',
  'restaurant':     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'boulangerie':    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=75',
  'glacier':        'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=75',
  'festival':       'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=75',
  'marché':         'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=75',
  'bibliothèque':   'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=75',
  'sport':          'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=75',
  'default':        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=75',
}

function getTypeImg(type) {
  if (!type) return TYPE_IMGS.default
  const t = type.toLowerCase()
  for (const [key, url] of Object.entries(TYPE_IMGS)) {
    if (t.includes(key)) return url
  }
  return TYPE_IMGS.default
}

function ActivityCard({ a, idx }) {
  const [restoOpen, setRestoOpen] = useState(false)
  const addr = encodeURIComponent(a.address)
  const cardImg = getTypeImg(a.type)
  return (
    <div className="anim-up" style={{ animationDelay:`${idx*0.06}s`, background:'#fff', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 16px rgba(27,43,75,0.09)', marginBottom:14, border:'1px solid #F0EBE3' }}>
      <div style={{ position:'relative', height:155, overflow:'hidden' }}>
        <img src={cardImg} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(27,43,75,0.72) 0%,rgba(0,0,0,0.1) 60%)' }} />
        <div style={{ position:'absolute', top:12, left:12 }}>
          {a.isFree && <span style={{ background:'#3DAA6E', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:99 }}>💚 Gratuit</span>}
        </div>
        <div style={{ position:'absolute', top:12, right:12 }}>
          <span style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 11px', borderRadius:99, border:'1px solid rgba(255,255,255,0.28)' }}>⭐ {a.rating}</span>
        </div>
        <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', textShadow:'0 1px 8px rgba(0,0,0,0.4)', lineHeight:1.2 }}>{a.name}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:3, fontWeight:500 }}>{a.type} · {a.distance}</div>
        </div>
      </div>
      <div style={{ padding:'12px 15px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
          <span style={{ fontWeight:700, fontSize:12, color: a.openNow ? '#3DAA6E' : '#DC2626' }}>
            {a.openNow ? '● Ouvert' : '● Fermé'}{a.hours ? ` · ${a.hours}` : ''}
          </span>
          <span style={{ fontSize:14, fontWeight:800, color:'#FF6B4A' }}>{a.price}</span>
        </div>
        <p style={{ fontSize:13, color:'#5A6A82', lineHeight:1.6, marginBottom:9 }}>{a.description}</p>
        {a.tags?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:9 }}>
            {a.tags.slice(0,4).map(t => <span key={t} style={{ background:'#FFF0E4', color:'#FF6B4A', fontSize:11, padding:'3px 9px', borderRadius:99, fontWeight:600 }}>{t}</span>)}
          </div>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid #F5F1EC' }}>
        {[
          { icon:'🗺️', label:'Itinéraire', url:`https://www.google.com/maps/dir/?api=1&destination=${addr}`, col:'#2F80ED' },
          { icon:'🅿️', label:'Parking',    url:`https://www.google.com/maps/search/parking+près+de+${addr}`, col:'#D97706' },
          { icon:'🍽️', label: restoOpen ? 'Fermer' : 'Manger', action:() => setRestoOpen(!restoOpen), col:'#E91E8C' },
        ].map((btn, i) => (
          <button key={i}
            onClick={() => btn.url ? window.open(btn.url,'_blank') : btn.action()}
            style={{ padding:'11px 6px', borderRight: i<2 ? '1px solid #F5F1EC' : 'none', fontSize:12, fontWeight:700, color:'#9AAABB', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'background .12s, color .12s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#FFF8F1'; e.currentTarget.style.color=btn.col }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9AAABB' }}>
            <span style={{ fontSize:17 }}>{btn.icon}</span>{btn.label}
          </button>
        ))}
      </div>
      {restoOpen && (
        <div className="anim-in" style={{ padding:'12px 15px 14px', background:'#FAFAF9', borderTop:'1px solid #F5F1EC' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#9AAABB', marginBottom:9 }}>🍽️ Restaurants à proximité</div>
          {a.restaurants?.length > 0 ? a.restaurants.map((r, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', borderRadius:12, padding:'9px 12px', marginBottom:6, border:'1px solid #F0EBE3' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1B2B4B' }}>{r.name}</div>
                <div style={{ fontSize:11, color:'#9AAABB', marginTop:2 }}>{r.type} · {r.distance}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:'#9AAABB', fontWeight:600 }}>{r.price}</span>
                <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.name)}`,'_blank')}
                  style={{ background:'#FF6B4A', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:99 }}>Maps</button>
              </div>
            </div>
          )) : <div style={{ color:'#C5C5C5', fontSize:13, textAlign:'center' }}>Aucun restaurant trouvé</div>}
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
          <div style={{ fontWeight:800, fontSize:20, color:'#1B2B4B', marginBottom:7 }}>Alertes activités</div>
          <p style={{ fontSize:13, color:'#9AAABB', marginBottom:18, lineHeight:1.7 }}>Reçois chaque semaine les meilleures activités famille près de chez toi !</p>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'13px 15px', borderRadius:13, border:'2px solid #EDE8E1', fontSize:14, marginBottom:10, color:'#1B2B4B', fontWeight:500 }}
            onFocus={e => e.target.style.border='2px solid #FF6B4A'}
            onBlur={e => e.target.style.border='2px solid #EDE8E1'} />
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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [city,        setCity]        = useState('')
  const [radius,      setRadius]      = useState(20)
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
  const [hasSearched, setHasSearched] = useState(false)
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
    const name = s.display_name.split(',')[0].trim()
    setCity(name); setCitySuggs([]); setShowSugg(false)
    try {
      const wr = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,weathercode&timezone=auto`)
      const wd = await wr.json()
      const t = Math.round(wd.current.temperature_2m), c = wd.current.weathercode
      const em = c===0||c===1?'☀️':c<=3?'⛅':c>=51&&c<=82?'🌧️':c>=95?'⛈️':'🌤️'
      setWeather({ icon:em, temp:t })
    } catch {}
  }, [])

  const doSearch = useCallback((catId, sub, bgt) => {
    const cat = catId !== undefined ? catId : activeCat
    const s   = sub   !== undefined ? sub   : activeSub
    const b   = bgt   !== undefined ? bgt   : budget
    if (!cat) return
    setLoading(true); setHasSearched(true)
    setTimeout(() => {
      const bf = b === 'Tous' ? 'Libre' : b
      setResults(getActivities(cat, s, bf))
      setLoading(false)
    }, 500)
  }, [activeCat, activeSub, budget])

  const clickCat = (id) => {
    if (activeCat === id) { setActiveCat(null); setActiveSub(null); setResults([]); setHasSearched(false) }
    else { setActiveCat(id); setActiveSub(null); doSearch(id, null, budget) }
  }
  const clickSub = (sub) => {
    const next = activeSub === sub ? null : sub
    setActiveSub(next); doSearch(activeCat, next, budget)
  }

  // Grid layout: we render tiles in a 3-col grid
  // But subs panel appears AFTER the row that contains the active tile
  const renderCatGrid = () => {
    const rows = []
    for (let i = 0; i < CATS.length; i += 3) {
      const row = CATS.slice(i, i + 3)
      const activeInRow = row.find(c => c.id === activeCat)
      rows.push(
        <div key={i}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9, marginBottom: activeInRow ? 0 : 9 }}>
            {row.map((cat, j) => (
              <CatTile key={cat.id} cat={cat} active={activeCat===cat.id} delay={(i+j)*0.04} onClick={() => clickCat(cat.id)} />
            ))}
            {/* Fill empty slots */}
            {row.length < 3 && Array(3-row.length).fill(0).map((_,k) => <div key={`e${k}`} />)}
          </div>
          {activeInRow && (
            <SubsPanel cat={activeInRow} activeSub={activeSub} onSub={clickSub} />
          )}
        </div>
      )
    }
    return rows
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FFF8F1' }}>
      <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:48 }}>

        {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}

        {/* ── HERO SLIDESHOW ── */}
        <HeroSlideshow />

        {/* ── SEARCH CARD ── */}
        <div style={{ padding:'0 14px', marginTop:-26, position:'relative', zIndex:10 }}>
          <div style={{ background:'#fff', borderRadius:24, padding:'22px 18px', boxShadow:'0 8px 40px rgba(27,43,75,0.13)', border:'1px solid #F0EBE3' }}>

            {/* Label mode 1 */}
            <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, color:'#9AAABB', marginBottom:12, letterSpacing:'0.2px' }}>
              Vous savez déjà ce que vous cherchez ? 👇
            </p>

            {/* Ville input */}
            <div style={{ position:'relative', marginBottom:10 }}>
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

            {/* Keyword search — multi */}
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
                      const matches = terms.map(term =>
                        CATS.find(c => c.l.toLowerCase().includes(term) || c.subs.some(s => s.toLowerCase().includes(term)))
                      ).filter(Boolean)
                      const cat = matches[0] || CATS[0]
                      setActiveCat(cat.id)
                      doSearch(cat.id, null, budget)
                    }
                  }}
                />
                {query && <button onClick={() => setQuery('')} style={{ color:'#C5C5C5', fontSize:14 }}>✕</button>}
              </div>
              <button
                onClick={() => {
                  if (!query.trim() && !city) return
                  const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(Boolean)
                  const matches = terms.map(term =>
                    CATS.find(c => c.l.toLowerCase().includes(term) || c.subs.some(s => s.toLowerCase().includes(term)))
                  ).filter(Boolean)
                  const cat = matches[0] || CATS[0]
                  setActiveCat(cat.id)
                  doSearch(cat.id, null, budget)
                }}
                style={{ background:'linear-gradient(135deg,#FF6B4A,#FF9A6C)', color:'#fff', padding:'12px 18px', borderRadius:14, fontSize:14, fontWeight:700, flexShrink:0, boxShadow:'0 4px 14px rgba(255,107,74,0.38)', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>
                Trouver →
              </button>
            </div>

            {/* Filtres discrets */}
            <div style={{ borderTop:'1px solid #F5F1EC', paddingTop:12 }}>
              {/* Radius */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'#C5C5C5', flexShrink:0 }}>📏</span>
                <div className="scroll-x" style={{ display:'flex', gap:5 }}>
                  {RADII.map(r => (
                    <button key={r} onClick={() => { setRadius(r); if(activeCat) doSearch(activeCat, activeSub, budget) }}
                      style={{ padding:'5px 11px', borderRadius:99, fontSize:12, fontWeight:600, flexShrink:0, transition:'all .15s', background: radius===r ? '#1B2B4B' : 'transparent', color: radius===r ? '#fff' : '#9AAABB', border: radius===r ? 'none' : '1px solid #EDE8E1', fontFamily:'var(--font-body)' }}>
                      {r} km
                    </button>
                  ))}
                </div>
              </div>
              {/* Budget */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'#C5C5C5', flexShrink:0 }}>💰</span>
                <div className="scroll-x" style={{ display:'flex', gap:5 }}>
                  {BUDGETS.map(b => (
                    <button key={b} onClick={() => { setBudget(b); if(activeCat) doSearch(activeCat, activeSub, b) }}
                      style={{ padding:'5px 11px', borderRadius:99, fontSize:12, fontWeight:600, flexShrink:0, transition:'all .15s', background: budget===b ? (b==='Gratuit'?'#3DAA6E':'#FF6B4A') : 'transparent', color: budget===b ? '#fff' : '#9AAABB', border: budget===b ? 'none' : '1px solid #EDE8E1', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SEPARATOR ── */}
        <div style={{ padding:'24px 18px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:1, background:'#EDE8E1' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'#C5C5C5', whiteSpace:'nowrap', fontFamily:'var(--font-body)' }}>ou explorez par catégorie</span>
          <div style={{ flex:1, height:1, background:'#EDE8E1' }} />
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ padding:'0 14px 0' }}>
          {renderCatGrid()}
        </div>

        {/* ── RESULTS ── */}
        <div style={{ padding:'8px 14px 0' }}>
          {loading && (
            <div style={{ textAlign:'center', padding:'44px 0' }}>
              <div style={{ fontSize:44, display:'inline-block', animation:'spin 1s linear infinite' }}>🎡</div>
              <div style={{ color:'#9AAABB', fontSize:14, fontWeight:600, marginTop:12 }}>Recherche en cours...</div>
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:800, color:'#1B2B4B' }}>
                  {results.length} idées{city ? ` près de ${city}` : ''}
                </div>
              </div>
              {results.map((a, i) => <ActivityCard key={a.id} a={a} idx={i} />)}
            </>
          )}
          {!loading && !hasSearched && (
            <div style={{ textAlign:'center', padding:'28px 0 40px' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>👨‍👩‍👧‍👦</div>
              <div style={{ color:'#9AAABB', fontSize:14, lineHeight:1.8, fontWeight:500 }}>
                Clique sur une catégorie<br />pour découvrir des activités !
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', padding:'20px 0 0', color:'#C5C5C5', fontSize:11 }}>
          🎡 FelioKids · <a href="mailto:feliokids@gmail.com" style={{ color:'#C5C5C5' }}>feliokids@gmail.com</a>
        </div>
      </div>
    </div>
  )
}
