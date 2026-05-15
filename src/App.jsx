import { useMemo, useRef, useState } from 'react'
import { Search, MapPin, Navigation, ParkingCircle, Utensils, Star, ChevronRight, Bell, Sparkles, X, Umbrella, SunMedium, BadgeEuro, SlidersHorizontal } from 'lucide-react'
import { categories, places, heroImage } from './data/activities'

const quickFilters = ['Bébé friendly','Parents relax','Intérieur pluie','Petit budget','Parking facile','8+ ans','Toute la famille','Anniversaire']

function mapsUrl(query) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` }

function buildSuggestions({ query, budget, selectedCategory, activeQuick }) {
  const q = query.toLowerCase()
  if (activeQuick === 'Intérieur pluie' || q.includes('pluie')) return { icon:<Umbrella size={20}/>, label:'Parfait quand il pleut', text:'Cinéma, bowling, musée ou ateliers créatifs: des idées simples quand il faut rester au sec.', chips:['Cinéma','Bowling','Musée','Atelier'] }
  if (activeQuick === 'Bébé friendly' || activeQuick === 'Parents relax') return { icon:<Sparkles size={20}/>, label:'Confort pour les parents', text:'Des lieux plus calmes, poussette facile, café agréable et options adaptées aux tout-petits.', chips:['Café','Brunch','Poussette','Calme'] }
  if (activeQuick === 'Anniversaire' || selectedCategory === 'anniversaires') return { icon:<Sparkles size={20}/>, label:'Idées anniversaire', text:'Bowling, trampoline, laser game ou atelier créatif: des options simples à réserver.', chips:['Bowling','Trampoline','Laser game','Atelier'] }
  if (budget === 'Gratuit' || activeQuick === 'Petit budget') return { icon:<BadgeEuro size={20}/>, label:'Petit budget aujourd’hui', text:'On privilégie les sorties gratuites: parc, forêt, aire de jeux ou balade en famille.', chips:['Parc','Forêt','Aire de jeux','Balade'] }
  return { icon:<SunMedium size={20}/>, label:'Suggestions du moment', text:'Commencez par une idée facile: sortie gratuite, activité en intérieur ou balade proche.', chips:['Gratuit','Weekend','Pluie','Nature'] }
}

export default function App() {
  const [postalCode, setPostalCode] = useState('75001')
  const [radius, setRadius] = useState(20)
  const [budget, setBudget] = useState('Libre')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [activeQuick, setActiveQuick] = useState('')
  const [expanded, setExpanded] = useState(null)
  const resultsRef = useRef(null)
  const smart = buildSuggestions({ query, budget, selectedCategory, activeQuick })

  const filteredPlaces = useMemo(() => {
    const maxBudget = budget === 'Gratuit' ? 0 : budget === '-20€' ? 20 : budget === '-50€' ? 50 : budget === '-100€' ? 100 : Infinity
    const text = query.trim().toLowerCase()
    return places
      .filter(place => place.distance <= Number(radius))
      .filter(place => place.price <= maxBudget)
      .filter(place => !selectedCategory || place.category === selectedCategory)
      .filter(place => !selectedSubcategory || place.subcategory === selectedSubcategory)
      .filter(place => !activeQuick || place.tags?.includes(activeQuick) || place.badge === activeQuick)
      .filter(place => !text || `${place.name} ${place.subcategory} ${place.description} ${place.badge} ${place.age} ${place.tags?.join(' ')}`.toLowerCase().includes(text))
  }, [radius, budget, query, selectedCategory, selectedSubcategory, activeQuick])

  function handleSearch(e) { e?.preventDefault(); resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }) }
  function quickSearch(value) { setQuery(value); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80) }
  function toggleQuick(filter) {
    setActiveQuick(activeQuick === filter ? '' : filter)
    if (filter === 'Petit budget') setBudget(activeQuick === filter ? 'Libre' : 'Gratuit')
    if (filter === 'Intérieur pluie') setSelectedCategory(activeQuick === filter ? null : 'pluie')
    if (filter === 'Anniversaire') setSelectedCategory(activeQuick === filter ? null : 'anniversaires')
  }

  return (
    <main className="page">
      <header className="top">
        <div className="brand"><div className="brand-mark">fk</div><div><strong>FelioKids</strong></div></div>
        <div className="top-actions"><button className="weekend"><Sparkles size={16}/> Weekend</button><button className="alert"><Bell size={16}/> Alertes</button></div>
      </header>

      <section className="hero-card" style={{ backgroundImage:`url(${heroImage})` }}>
        <div className="hero-shade"/><div className="hero-content"><p className="kicker">France · sorties famille</p><h1>Que faire avec les enfants aujourd’hui ?</h1><p className="intro">Trouvez des idées proches, gratuites ou petit budget, avec parking et où manger.</p></div>
      </section>

      <form className="search-box" onSubmit={handleSearch}>
        <div className="search-row"><label className="city"><MapPin size={17}/><input value={postalCode} onChange={e=>setPostalCode(e.target.value.replace(/\D/g,'').slice(0,5))} placeholder="Code postal ou ville"/></label><button className="search-button desktop-search" type="submit"><Search size={18}/> Trouver des activités</button></div>
        <div className="chips quick-chips">{quickFilters.map(filter=><button type="button" key={filter} className={activeQuick===filter?'active':''} onClick={()=>toggleQuick(filter)}>{filter}</button>)}<button type="button" className="filter-chip"><SlidersHorizontal size={15}/> Filtres</button></div>
        <div className="chips small-radius">{[5,10,20,30].map(km=><button type="button" key={km} className={Number(radius)===km?'active dark':''} onClick={()=>setRadius(km)}>{km} km</button>)}</div>
        <label className="search-line"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='"bowling", "anniversaire", "poussette"...'/></label>
        <button className="search-button mobile-search" type="submit"><Search size={18}/> Trouver des activités</button>
      </form>

      <section className="smart-card"><div className="smart-icon">{smart.icon}</div><div className="smart-copy"><p>Suggestion active</p><h2>{smart.label}</h2><span>{smart.text}</span><div className="smart-chips">{smart.chips.map(chip=><button key={chip} onClick={()=>quickSearch(chip)}>{chip}</button>)}</div></div></section>

      <section className="categories-section">
        <div className="section-title"><div><p>Explorer</p><h2>Grandes envies</h2></div>{(selectedCategory||selectedSubcategory||activeQuick)&&<button className="reset" onClick={()=>{setSelectedCategory(null);setSelectedSubcategory('');setActiveQuick('');setBudget('Libre')}}><X size={16}/> Effacer</button>}</div>
        <div className="equal-grid">{categories.map(category=><div className="category-wrap" key={category.id}><button className={`photo-card ${selectedCategory===category.id?'selected':''}`} style={{backgroundImage:`url(${category.image})`, '--accent':category.color}} onClick={()=>{setSelectedCategory(category.id);setSelectedSubcategory('');setActiveQuick('')}}><div className="shade"/><div className="arrow"><ChevronRight size={20}/></div><div className="card-text"><h3>{category.title}</h3><p>{category.subtitle}</p></div></button>{selectedCategory===category.id&&<div className="inline-subcategories" style={{'--accent':category.color}}>{category.subcategories.map(sub=><button key={sub} className={selectedSubcategory===sub?'active':''} onClick={()=>setSelectedSubcategory(sub)}>{sub}</button>)}</div>}</div>)}</div>
      </section>

      <section className="results" ref={resultsRef}>
        <div className="section-title"><div><p>Résultats</p><h2>{filteredPlaces.length} idées près de {postalCode}</h2></div></div>
        {filteredPlaces.length===0&&<div className="empty-state"><Sparkles size={28}/><h3>Aucune activité trouvée pour ce filtre.</h3><p>Essayez un autre mot-clé, un autre besoin ou un rayon plus grand.</p></div>}
        <div className="result-grid">{filteredPlaces.map(place=><article className="result-card" key={place.id}><div className="result-photo" style={{backgroundImage:`url(${place.image})`}}><div className="shade"/><div className="result-top"><span className={place.price===0?'pill free':'pill'}>{place.price===0?'💚 Gratuit':place.badge}</span><span className="score"><Star size={14} fill="currentColor"/> {place.rating}</span></div><div className="result-name"><h3>{place.name}</h3><p>{place.subcategory} · {place.age}</p></div></div><div className="result-body"><p>{place.description}</p><div className="meta"><span>{place.distance} km</span><span>{place.price===0?'0€':`${place.price}€`}</span><span>{place.age}</span></div><div className="tag-row">{place.tags?.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div><div className="actions"><a href={mapsUrl(`${place.name} ${postalCode}`)} target="_blank" rel="noreferrer"><Navigation size={15}/> Route</a><a href={mapsUrl(`parking ${place.name} ${postalCode}`)} target="_blank" rel="noreferrer"><ParkingCircle size={15}/> Parking</a><button onClick={()=>setExpanded(expanded===place.id?null:place.id)}><Utensils size={15}/> Manger</button></div>{expanded===place.id&&<div className="restaurants">{place.restaurants.map(r=><a key={r} href={mapsUrl(`${r} près de ${place.name}`)} target="_blank" rel="noreferrer">🍽️ {r}</a>)}</div>}</div></article>)}</div>
      </section>
    </main>
  )
}
