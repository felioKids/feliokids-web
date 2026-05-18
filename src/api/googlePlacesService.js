// src/api/googlePlacesService.js

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY
console.log('API KEY:', API_KEY)

const GOOGLE_PLACES_CONFIG = {
  'Piscines':             { keyword: 'piscine centre aquatique' },
  'Cinéma':               { keyword: 'cinéma' },
  'Bowling':              { keyword: 'bowling' },
  'Trampoline':           { keyword: 'trampoline' },
  'Laser game':           { keyword: 'laser game' },
  'Escape game':          { keyword: 'escape game' },
  'Karting enfants':      { keyword: 'karting enfants' },
  'Parcs aquatiques':     { keyword: 'parc aquatique' },
  'Patinoire':            { keyword: 'patinoire' },
  'Zoos & parcs animaliers': { keyword: 'zoo parc animalier' },
  "Musées d'art":         { keyword: 'musée' },
  'Musées gratuits':      { keyword: 'musée gratuit' },
  'Musées interactifs':   { keyword: 'musée interactif' },
  'Aquarium':             { keyword: 'aquarium' },
  'Planétarium':          { keyword: 'planétarium' },
  'Restaurants fête':     { keyword: 'restaurant famille' },
  'Accrobranche':         { keyword: 'accrobranche aventure' },
  'Skateparks':           { keyword: 'skatepark' },
  'Bowling & laser game': { keyword: 'bowling laser game' },
  'Ski & glisse':         { keyword: 'ski station' },
  'Tennis & padel':       { keyword: 'tennis padel' },
  'Escalade':             { keyword: 'escalade mur' },
  'Sports nautiques':     { keyword: 'sports nautiques' },
  'Piscines couvertes':   { keyword: 'piscine couverte' },
  'Cafés jeux':           { keyword: 'café jeux' },
  'Théâtre enfants':      { keyword: 'théâtre enfants' },
  'Spectacles':           { keyword: 'spectacle famille' },
  'Concerts gratuits':    { keyword: 'concert gratuit' },
  'Compétitions sportives': { keyword: 'stade complexe sportif' },
  'Fermes pédagogiques':  { keyword: 'ferme pédagogique' },
  'Sciences & découverte':{ keyword: 'musée sciences découverte' },
  'Cirque':               { keyword: 'cirque spectacle' },
  'Expos temporaires':    { keyword: 'exposition musée' },
  'Sport avec garderie':  { keyword: 'sport garderie enfants' },
  'IKEA Småland':         { keyword: 'IKEA' },
  'Centres de loisirs':   { keyword: 'centre de loisirs' },
  'Espaces kids galeries':{ keyword: 'espace enfants galerie' },
  'Piscines avec garderie':{ keyword: 'piscine garderie' },
  'Ateliers peinture':    { keyword: 'atelier peinture enfants' },
  'Poterie enfants':      { keyword: 'poterie atelier enfants' },
  'Cuisine créative':     { keyword: 'atelier cuisine enfants' },
  'Ateliers musique':     { keyword: 'école musique atelier' },
  'Ateliers science':     { keyword: 'atelier science enfants' },
  'Ateliers numériques':  { keyword: 'atelier numérique informatique' },
  'Zoos gratuits':        { keyword: 'zoo gratuit' },
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function normalizePlaceGoogle(place, centerLat, centerLng, subName) {
  const lat = place.location?.latitude ?? place.geometry?.location?.lat
  const lng = place.location?.longitude ?? place.geometry?.location?.lng
  if (!lat || !lng) return null

  const distKm = haversineKm(centerLat, centerLng, lat, lng)
  const distStr = distKm < 1
    ? `${Math.round(distKm * 1000)} m`
    : `${distKm.toFixed(1)} km`

  return {
    id:          `google-${place.id ?? place.place_id ?? Math.random()}`,
    name:        place.displayName?.text ?? place.name,
    type:        subName,
    distance:    distStr,
    distanceKm:  Math.round(distKm * 10) / 10,
    address:     place.formattedAddress ?? place.vicinity ?? '',
    price:       'Voir sur place',
    priceNum:    1,
    isFree:      false,
    rating:      place.rating ? place.rating.toFixed(1) : '4.0',
    openNow:     place.currentOpeningHours?.openNow ?? place.opening_hours?.open_now ?? null,
    hours:       null,
    description: '',
    tags:        [],
    restaurants: [],
    lat,
    lng,
    website:     null,
    phone:       null,
  }
}

export async function searchActivitiesGoogle({ city, radiusKm, budget, subName, cityCoords }) {
  const config = GOOGLE_PLACES_CONFIG[subName]
  if (!config) throw new Error(`Pas de config Google Places pour "${subName}"`)

  const { lat, lng } = cityCoords
  const radiusMeters = Math.min(radiusKm * 1000, 50000)

  const url = `/api/search?lat=${lat}&lng=${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(config.keyword)}`
  const res  = await fetch(url)
  const data = await res.json()
  console.log('Google Places response:', data)

  if (!data.results) {
    throw new Error(data.error_message || data.error || 'Google Places error')
  }

  const BUDGET_MAP = { 'Tous': null, 'Gratuit': 0, '-20€': 1, '-50€': 2, '-100€': 3 }
  const maxPrice = BUDGET_MAP[budget] ?? null

  return (data.results ?? [])
    .map(p => normalizePlaceGoogle(p, lat, lng, subName))
    .filter(Boolean)
    .filter(a => maxPrice === null || a.priceNum <= maxPrice)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}