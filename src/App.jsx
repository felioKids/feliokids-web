import { useMemo, useRef, useState } from 'react'
import {
  Search, MapPin, Navigation, ParkingCircle, Utensils, Star, ChevronRight,
  Bell, Sparkles, X, Heart, Activity, Landmark, Trees, Clapperboard,
  Gamepad2, CalendarDays, SmilePlus
} from 'lucide-react'
import { categories, places, heroImage } from './data/activities'

function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function CategoryIcon({ name, size = 24 }) {
  const props = { size, strokeWidth: 2.35 }
  const icons = {
    heart: <Heart {...props} />,
    activity: <Activity {...props} />,
    sparkles: <Sparkles {...props} />,
    landmark: <Landmark {...props} />,
    trees: <Trees {...props} />,
    clapperboard: <Clapperboard {...props} />,
    gamepad: <Gamepad2 {...props} />,
    utensils: <Utensils {...props} />,
    calendar: <CalendarDays {...props} />
  }
  return icons[name] || <Sparkles {...props} />
}

function App() {
  const [postalCode, setPostalCode] = useState('75001')
  const [radius, setRadius] = useState(20)
  const [budget, setBudget] = useState('Libre')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [expanded, setExpanded] = useState(null)
  const resultsRef = useRef(null)

  const filteredPlaces = useMemo(() => {
    const maxBudget = budget === 'Gratuit' ? 0 : budget === '-20€' ? 20 : budget === '-50€' ? 50 : budget === '-100€' ? 100 : Infinity
    const text = query.trim().toLowerCase()
    return places
      .filter(place => place.distance <= Number(radius))
      .filter(place => place.price <= maxBudget)
      .filter(place => !selectedCategory || place.category === selectedCategory)
      .filter(place => !selectedSubcategory || place.subcategory === selectedSubcategory)
      .filter(place => !text || `${place.name} ${place.subcategory} ${place.description} ${place.badge} ${place.age}`.toLowerCase().includes(text))
  }, [radius, budget, query, selectedCategory, selectedSubcategory])

  function handleSearch(e) {
    e?.preventDefault()
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="page">
      <header className="top">
        <div className="brand">
          <div className="brand-mark">
            <SmilePlus size={23} strokeWidth={2.5} />
          </div>
          <div><strong>FelioKids</strong><span>Family discovery</span></div>
        </div>
        <button className="alert"><Bell size={16} /> Alertes</button>
      </header>

      <section className="hero-card" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="kicker">France · familles · weekend</p>
          <h1>Explorez les meilleures sorties avec vos enfants.</h1>
          <p className="intro">Activités, parking, budget et restaurants proches — en quelques secondes.</p>
        </div>
      </section>

      <form className="search-box" onSubmit={handleSearch}>
        <label className="city">
          <MapPin size={17} />
          <input value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="Code postal" />
        </label>

        <div className="chips">
          {[5, 10, 20, 30].map(km => <button type="button" key={km} className={Number(radius) === km ? 'active' : ''} onClick={() => setRadius(km)}>{km} km</button>)}
        </div>

        <div className="chips budget">
          {['Gratuit', '-20€', '-50€', '-100€', 'Libre'].map(b => <button type="button" key={b} className={budget === b ? 'active' : ''} onClick={() => setBudget(b)}>{b}</button>)}
        </div>

        <label className="search-line">
          <Search size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder='"bowling", "château gratuit", "piscine"...' />
        </label>

        <button className="search-button" type="submit">
          <Search size={18} />
          Trouver des activités
        </button>
      </form>

      <section className="categories-section">
        <div className="section-title">
          <div><p>Catégories</p><h2>Choisissez une ambiance</h2></div>
          {(selectedCategory || selectedSubcategory) && <button className="reset" onClick={() => { setSelectedCategory(null); setSelectedSubcategory('') }}><X size={16} /> Effacer</button>}
        </div>

        <div className="equal-grid">
          {categories.map((category) => (
            <div className="category-wrap" key={category.id}>
              <button
                className={`photo-card ${selectedCategory === category.id ? 'selected' : ''}`}
                style={{ backgroundImage: `url(${category.image})`, '--accent': category.color }}
                onClick={() => { setSelectedCategory(category.id); setSelectedSubcategory('') }}
              >
                <div className="shade" />
                <div className="icon-bubble"><CategoryIcon name={category.icon} /></div>
                <div className="arrow"><ChevronRight size={20} /></div>
                <div className="card-text"><h3>{category.title}</h3><p>{category.subtitle}</p></div>
              </button>

              {selectedCategory === category.id && (
                <div className="inline-subcategories" style={{ '--accent': category.color }}>
                  {category.subcategories.map(sub => (
                    <button key={sub} className={selectedSubcategory === sub ? 'active' : ''} onClick={() => setSelectedSubcategory(sub)}>
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="results" ref={resultsRef}>
        <div className="section-title">
          <div><p>Résultats</p><h2>{filteredPlaces.length} idées près de {postalCode}</h2></div>
          <span className="ai-off"><Sparkles size={15} /> Sans API payante</span>
        </div>

        <div className="result-grid">
          {filteredPlaces.map(place => (
            <article className="result-card" key={place.id}>
              <div className="result-photo" style={{ backgroundImage: `url(${place.image})` }}>
                <div className="shade" />
                <div className="result-top">
                  <span className={place.price === 0 ? 'pill free' : 'pill'}>{place.price === 0 ? '💚 Gratuit' : place.badge}</span>
                  <span className="score"><Star size={14} fill="currentColor" /> {place.rating}</span>
                </div>
                <div className="result-name"><h3>{place.name}</h3><p>{place.subcategory} · {place.age}</p></div>
              </div>
              <div className="result-body">
                <p>{place.description}</p>
                <div className="meta"><span>{place.distance} km</span><span>{place.price === 0 ? '0€' : `${place.price}€`}</span><span>{place.age}</span></div>
                <div className="actions">
                  <a href={mapsUrl(`${place.name} ${postalCode}`)} target="_blank" rel="noreferrer"><Navigation size={15} /> Route</a>
                  <a href={mapsUrl(`parking ${place.name} ${postalCode}`)} target="_blank" rel="noreferrer"><ParkingCircle size={15} /> Parking</a>
                  <button onClick={() => setExpanded(expanded === place.id ? null : place.id)}><Utensils size={15} /> Manger</button>
                </div>
                {expanded === place.id && <div className="restaurants">{place.restaurants.map(r => <a key={r} href={mapsUrl(`${r} près de ${place.name}`)} target="_blank" rel="noreferrer">🍽️ {r}</a>)}</div>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
export default App
