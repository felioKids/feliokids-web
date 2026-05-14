import { useMemo, useState } from 'react'
import {
  Search, MapPin, Navigation, ParkingCircle, Utensils,
  Star, SlidersHorizontal, Sparkles, ChevronRight, X
} from 'lucide-react'
import { categories, places } from './data/activities'

function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function App() {
  const [postalCode, setPostalCode] = useState('75001')
  const [radius, setRadius] = useState(20)
  const [budget, setBudget] = useState('Libre')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [expanded, setExpanded] = useState(null)

  const activeCategory = categories.find(c => c.id === selectedCategory)

  const filteredPlaces = useMemo(() => {
    const maxBudget =
      budget === 'Gratuit' ? 0 :
      budget === '-20€' ? 20 :
      budget === '-50€' ? 50 :
      budget === '-100€' ? 100 :
      Infinity

    const text = query.trim().toLowerCase()

    return places
      .filter(place => place.distance <= Number(radius))
      .filter(place => place.price <= maxBudget)
      .filter(place => !selectedCategory || place.category === selectedCategory)
      .filter(place => !selectedSubcategory || place.subcategory === selectedSubcategory)
      .filter(place => !text || `${place.name} ${place.subcategory} ${place.description} ${place.badge}`.toLowerCase().includes(text))
  }, [radius, budget, query, selectedCategory, selectedSubcategory])

  const featuredCategory = activeCategory || categories[0]

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="topbar">
          <div className="logo">
            <div className="logo-mark">fk</div>
            <span>FelioKids</span>
          </div>
          <button className="top-action">
            <Sparkles size={17} />
            Weekend
          </button>
        </div>

        <div className="hero-card" style={{ backgroundImage: `url(${featuredCategory.image})` }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">France · sorties famille</p>
            <h1>Que faire avec les enfants aujourd’hui ?</h1>
            <p>Trouvez des idées proches, gratuites ou petit budget, avec parking et où manger après.</p>
          </div>
        </div>

        <div className="search-card">
          <div className="search-main">
            <Search size={19} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="bowling, château gratuit, pluie..."
            />
          </div>

          <div className="filters">
            <label>
              <MapPin size={15} />
              <input
                value={postalCode}
                onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="75001"
              />
            </label>

            <select value={radius} onChange={e => setRadius(e.target.value)}>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
            </select>

            <select value={budget} onChange={e => setBudget(e.target.value)}>
              <option>Gratuit</option>
              <option>-20€</option>
              <option>-50€</option>
              <option>-100€</option>
              <option>Libre</option>
            </select>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="label">Explorer</p>
            <h2>Catégories</h2>
          </div>
          {(selectedCategory || selectedSubcategory) && (
            <button className="clear" onClick={() => { setSelectedCategory(null); setSelectedSubcategory('') }}>
              <X size={16} /> Effacer
            </button>
          )}
        </div>

        <div className="category-grid">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className={`category-card card-${index % 5} ${selectedCategory === category.id ? 'selected' : ''}`}
              style={{ backgroundImage: `url(${category.image})` }}
              onClick={() => {
                setSelectedCategory(category.id)
                setSelectedSubcategory('')
              }}
            >
              <div className="card-glow" />
              <div className="category-meta">
                <span className="category-icon">{category.icon}</span>
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="chevron" size={20} />
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="subcategory-panel">
            <div className="subcategory-title">
              <span>{activeCategory.icon}</span>
              <strong>{activeCategory.title}</strong>
            </div>
            <div className="subchips">
              {activeCategory.subcategories.map(sub => (
                <button
                  key={sub}
                  className={selectedSubcategory === sub ? 'active' : ''}
                  onClick={() => setSelectedSubcategory(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head sticky-title">
          <div>
            <p className="label">Résultats</p>
            <h2>{filteredPlaces.length} idées près de {postalCode}</h2>
          </div>
          <button className="filter-pill">
            <SlidersHorizontal size={16} />
            Filtres
          </button>
        </div>

        <div className="places-grid">
          {filteredPlaces.map(place => (
            <article className="place-card" key={place.id}>
              <div className="place-image" style={{ backgroundImage: `url(${place.image})` }}>
                <div className="place-image-overlay" />
                <div className="place-top">
                  <span className={place.price === 0 ? 'free-badge badge' : 'badge'}>
                    {place.price === 0 ? '💚 Gratuit' : place.badge}
                  </span>
                  <span className="rating"><Star size={14} fill="currentColor" /> {place.rating}</span>
                </div>
                <div className="place-title">
                  <h3>{place.name}</h3>
                  <p>{place.subcategory} · {place.age}</p>
                </div>
              </div>

              <div className="place-body">
                <p>{place.description}</p>
                <div className="place-stats">
                  <span>{place.distance} km</span>
                  <span>{place.price === 0 ? 'Gratuit' : `${place.price}€ famille`}</span>
                  <span>{place.age}</span>
                </div>

                <div className="actions">
                  <a href={mapsUrl(`${place.name} ${postalCode}`)} target="_blank" rel="noreferrer">
                    <Navigation size={15} /> Route
                  </a>
                  <a href={mapsUrl(`parking ${place.name} ${postalCode}`)} target="_blank" rel="noreferrer">
                    <ParkingCircle size={15} /> Parking
                  </a>
                  <button onClick={() => setExpanded(expanded === place.id ? null : place.id)}>
                    <Utensils size={15} /> Manger
                  </button>
                </div>

                {expanded === place.id && (
                  <div className="restaurants">
                    {place.restaurants.map(r => (
                      <a key={r} href={mapsUrl(`${r} près de ${place.name}`)} target="_blank" rel="noreferrer">
                        🍽️ {r}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <strong>FelioKids</strong>
        <span>Le guide simple des sorties famille.</span>
      </footer>
    </main>
  )
}

export default App
