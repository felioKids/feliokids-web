import { useMemo, useRef, useState } from 'react'
import {
  Search, MapPin, Navigation, ParkingCircle, Utensils, Star, ChevronRight,
  Bell, Sparkles, X, Heart, Activity, Landmark, Trees, Clapperboard,
  Gamepad2, CalendarDays, Umbrella, SunMedium, BadgeEuro, SlidersHorizontal
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

function buildSuggestions({ query, budget, selectedCategory }) {
  const q = query.toLowerCase()
  if (q.includes('pluie') || q.includes('rain') || q.includes('intérieur') || q.includes('interieur')) {
    return { icon: <Umbrella size={20} />, label: 'Parfait quand il pleut', text: 'Cinéma, bowling, musée ou ateliers créatifs: des idées simples quand il faut rester au sec.', chips: ['Cinéma', 'Bowling', 'Musée', 'Atelier'] }
  }
  if (budget === 'Gratuit') {
    return { icon: <BadgeEuro size={20} />, label: 'Petit budget aujourd’hui', text: 'On privilégie les sorties gratuites: parc, forêt, aire de jeux ou balade en famille.', chips: ['Parc', 'Forêt', 'Aire de jeux', 'Balade'] }
  }
  if (selectedCategory === 'nature') {
    return { icon: <Trees size={20} />, label: 'Idéal pour une sortie dehors', text: 'Forêt, lac, pique-nique ou cascade: des idées pour respirer en famille.', chips: ['Forêt', 'Lac', 'Pique-nique', 'Cascade'] }
  }
  if (selectedCategory === 'sport' || q.includes('sport') || q.includes('piscine') || q.includes('vélo') || q.includes('velo')) {
    return { icon: <Activity size={20} />, label: 'Idées actives en famille', text: 'Piscine, vélo, football ou accrobranche: parfait pour dépenser leur énergie.', chips: ['Piscine', 'Vélo', 'Foot', 'Accrobranche'] }
  }
  if (selectedCategory === 'evenements') {
    return { icon: <CalendarDays size={20} />, label: 'Idées du weekend', text: 'Fêtes, marchés, spectacles et festivals famille: parfait pour changer de routine.', chips: ['Festival', 'Marché', 'Spectacle', 'Expo'] }
  }
  return { icon: <SunMedium size={20} />, label: 'Suggestions du moment', text: 'Commencez par une idée facile: sortie gratuite, activité en intérieur ou balade proche.', chips: ['Gratuit', 'Ce weekend', 'Pluie', 'Nature'] }
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
  const smart = buildSuggestions({ query, budget, selectedCategory })

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

  function quickSearch(value) {
    setQuery(value)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <main className="page">
      <header className="top">
        <div className="brand">
          <div className="brand-mark">fk</div>
          <div><strong>FelioKids</strong></div>
        </div>
        <div className="top-actions">
          <button className="weekend"><Sparkles size={16} /> Weekend</button>
          <button className="alert"><Bell size={16} /> Alertes</button>
        </div>
      </header>

      <section className="hero-card" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="kicker">France · sorties famille</p>
          <h1>Que faire avec les enfants aujourd’hui ?</h1>
          <p className="intro">Trouvez des idées proches, gratuites ou petit budget, avec parking et où manger.</p>
        </div>
      </section>

      <form className="search-box" onSubmit={handleSearch}>
        <div className="search-row">
          <label className="city">
            <MapPin size={17} />
            <input value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="Où voulez-vous aller ?" />
          </label>
          <button className="search-button desktop-search" type="submit">
            <Search size={18} />
            Trouver des activités
          </button>
        </div>

        <div className="chips">
          <button type="button" className={!selectedCategory && budget === 'Libre' ? 'soft-active' : ''} onClick={() => { setSelectedCategory(null); setBudget('Libre'); setSelectedSubcategory('') }}>Tous</button>
          {['Gratuit', '-20€', '-50€', '-100€'].map(b => <button type="button" key={b} className={budget === b ? 'active' : ''} onClick={() => setBudget(b)}>{b}</button>)}
          <button type="button" className={selectedCategory === 'nature' ? 'active' : ''} onClick={() => setSelectedCategory('nature')}>Nature</button>
          <button type="button" className={query.toLowerCase().includes('pluie') ? 'active' : ''} onClick={() => setQuery('pluie')}>Intérieur</button>
          <button type="button" className={selectedCategory === 'sport' ? 'active' : ''} onClick={() => setSelectedCategory('sport')}>Sport</button>
          <button type="button" className="filter-chip"><SlidersHorizontal size={15} /> Filtres</button>
        </div>

        <div className="chips small-radius">
          {[5, 10, 20, 30].map(km => <button type="button" key={km} className={Number(radius) === km ? 'active dark' : ''} onClick={() => setRadius(km)}>{km} km</button>)}
        </div>

        <label className="search-line">
          <Search size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder='"bowling", "château gratuit", "piscine"...' />
        </label>

        <button className="search-button mobile-search" type="submit">
          <Search size={18} />
          Trouver des activités
        </button>
      </form>

      <section className="smart-row">
        <div className="section-inline-title">
          <span className="small-icon"><Sparkles size={17} /></span>
          <h2>Suggestions du moment</h2>
        </div>
        <button className="see-all">Voir tout <ChevronRight size={16}/></button>
      </section>

      <div className="suggestion-strip">
        {[
          ['🌧️', 'Parfait pluie', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=900&q=80'],
          ['💚', 'Petit budget', 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?auto=format&fit=crop&w=900&q=80'],
          ['🌲', "Nature aujourd'hui", 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80'],
          ['🏃', 'Bouger en famille', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=900&q=80'],
          ['🎨', 'Activités créatives', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80']
        ].map(([emoji, label, image]) => (
          <button key={label} className="mini-suggestion" onClick={() => quickSearch(label)}>
            <div style={{ backgroundImage: `url(${image})` }} />
            <span>{emoji} {label}</span>
          </button>
        ))}
      </div>

      <section className="smart-card">
        <div className="smart-icon">{smart.icon}</div>
        <div className="smart-copy">
          <p>Suggestion active</p>
          <h2>{smart.label}</h2>
          <span>{smart.text}</span>
          <div className="smart-chips">
            {smart.chips.map(chip => <button key={chip} onClick={() => quickSearch(chip)}>{chip}</button>)}
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-title">
          <div><p>Explorer</p><h2>Catégories</h2></div>
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
                  {category.subcategories.map(sub => <button key={sub} className={selectedSubcategory === sub ? 'active' : ''} onClick={() => setSelectedSubcategory(sub)}>{sub}</button>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="results" ref={resultsRef}>
        <div className="section-title">
          <div><p>Résultats</p><h2>{filteredPlaces.length} idées près de {postalCode}</h2></div>
        </div>

        {filteredPlaces.length === 0 && (
          <div className="empty-state">
            <Sparkles size={28} />
            <h3>Aucune activité trouvée pour ce filtre.</h3>
            <p>Essayez un budget plus large, un autre mot-clé ou un rayon plus grand.</p>
          </div>
        )}

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
