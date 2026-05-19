// src/api/googlePlacesService.js

const GOOGLE_PLACES_CONFIG = {
  // ── GRATUIT ─────────────────────────────────────────────────────────────────
  'Parcs & jardins':        { keyword: 'parc jardin public',         type: 'park' },
  'Forêts & balades':       { keyword: 'forêt balade nature',        type: 'park' },
  'Plages & lacs':          { keyword: 'plage lac baignade',         type: 'natural_feature' },
  'Musées gratuits':        { keyword: 'musée gratuit',              type: 'museum' },
  'Événements gratuits':    { keyword: 'événement gratuit famille',  type: 'event_venue' },
  'Pistes cyclables':       { keyword: 'piste cyclable vélo',        type: 'park' },
  'Bibliothèques':          { keyword: 'bibliothèque médiathèque',   type: 'library' },
  'Zoos gratuits':          { keyword: 'zoo gratuit',                type: 'zoo' },
  "Fontaines & jets d'eau": { keyword: 'fontaine jet eau',           type: 'tourist_attraction' },

  // ── ANNIVERSAIRES ───────────────────────────────────────────────────────────
  'Bowling & laser game': { keyword: 'bowling laser game',       type: 'bowling_alley' },
  'Accrobranche':         { keyword: 'accrobranche aventure',    type: 'amusement_park' },
  'Restaurants fête':     { keyword: 'restaurant famille fête',  type: 'restaurant' },
  'Ateliers créatifs':    { keyword: 'atelier créatif enfants',  type: 'art_studio' },
  'Escape game':          { keyword: 'escape game',              type: 'amusement_center' },
  'Cinéma privatisé':     { keyword: 'cinéma privatisé',         type: 'movie_theater' },
  'Karting enfants':      { keyword: 'karting enfants',          type: 'amusement_park' },
  'Parcs aquatiques':     { keyword: 'parc aquatique',           type: 'water_park' },

  // ── PLUIE & INTÉRIEUR ───────────────────────────────────────────────────────
  'Cinéma':                       { keyword: 'cinéma',                        type: 'movie_theater' },
  'Bowling':                      { keyword: 'bowling',                        type: 'bowling_alley' },
  'Aquarium':                     { keyword: 'aquarium',                       type: 'aquarium' },
  'Trampoline':                   { keyword: 'trampoline parc',                type: 'amusement_center' },
  'Laser game':                   { keyword: 'laser game',                     type: 'amusement_center' },
  'Musées interactifs':           { keyword: 'musée interactif enfants',       type: 'museum' },
  'Piscines couvertes':           { keyword: 'piscine couverte',               type: 'swimming_pool' },
  'Bibliothèques & médiathèques': { keyword: 'bibliothèque médiathèque',       type: 'library' },
  'Cafés jeux':                   { keyword: 'café jeux société',              type: 'cafe' },

  // ── CULTURE ─────────────────────────────────────────────────────────────────
  'Châteaux & histoire':      { keyword: 'château histoire monument',   type: 'tourist_attraction' },
  "Musées d'art":             { keyword: 'musée art',                   type: 'museum' },
  'Théâtre enfants':          { keyword: 'théâtre enfants spectacle',   type: 'performing_arts_theater' },
  'Planétarium':              { keyword: 'planétarium',                 type: 'planetarium' },
  'Sciences & découverte':    { keyword: 'musée sciences cité découverte', type: 'museum' },
  'Patrimoine UNESCO':        { keyword: 'patrimoine UNESCO monument',  type: 'tourist_attraction' },
  'Visites guidées famille':  { keyword: 'visite guidée famille',       type: 'tourist_attraction' },
  'Cirque':                   { keyword: 'cirque spectacle',            type: 'performing_arts_theater' },

  // ── NATURE & ANIMAUX ────────────────────────────────────────────────────────
  'Forêts & randonnée':       { keyword: 'forêt randonnée nature',      type: 'park' },
  'Lacs & baignade':          { keyword: 'lac baignade plage',          type: 'natural_feature' },
  'Plages':                   { keyword: 'plage',                       type: 'natural_feature' },
  'Zoos & parcs animaliers':  { keyword: 'zoo parc animalier',          type: 'zoo' },
  'Fermes pédagogiques':      { keyword: 'ferme pédagogique animaux',   type: 'tourist_attraction' },
  'Cascades':                 { keyword: 'cascade chute eau',           type: 'natural_feature' },
  'Pêche en famille':         { keyword: 'pêche lac rivière famille',   type: 'park' },
  'Barbecue légal':           { keyword: 'aire barbecue pique-nique',   type: 'park' },
  'Cueillette fruits':        { keyword: 'cueillette fruits ferme',     type: 'tourist_attraction' },
  'Camping & picnic':         { keyword: 'camping picnic nature',       type: 'campground' },
  'Observation oiseaux':      { keyword: 'observation oiseaux nature',  type: 'park' },

  // ── SPORT ───────────────────────────────────────────────────────────────────
  'Vélo & VTT':           { keyword: 'vélo VTT piste cyclable',      type: 'park' },
  'Football & terrains':  { keyword: 'terrain football sport',        type: 'stadium' },
  'Piscines':             { keyword: 'piscine centre aquatique',      type: 'swimming_pool' },
  'Ski & glisse':         { keyword: 'station ski glisse',            type: 'ski_resort' },
  'Tennis & padel':       { keyword: 'tennis padel club',             type: 'sports_club' },
  'Accrobranche':         { keyword: 'accrobranche aventure forêt',   type: 'amusement_park' },
  'Skateparks':           { keyword: 'skatepark roller',              type: 'park' },
  'Patinoire':            { keyword: 'patinoire glace',               type: 'ice_skating_rink' },
  'Escalade':             { keyword: 'salle escalade bloc',           type: 'sports_club' },
  'Ping-pong':            { keyword: 'tennis de table ping-pong',     type: 'sports_club' },
  'Sports nautiques':     { keyword: 'sports nautiques base eau',     type: 'sports_club' },

  // ── ÉVÉNEMENTS ──────────────────────────────────────────────────────────────
  'Festivals famille':        { keyword: 'festival famille enfants',    type: 'event_venue' },
  'Fêtes & marchés':          { keyword: 'marché fête locale',          type: 'shopping_mall' },
  'Brocante':                 { keyword: 'brocante vide grenier',       type: 'flea_market' },
  'Spectacles':               { keyword: 'spectacle famille enfants',   type: 'performing_arts_theater' },
  'Expos temporaires':        { keyword: 'exposition temporaire musée', type: 'museum' },
  'Concerts gratuits':        { keyword: 'concert gratuit musique',     type: 'concert_hall' },
  "Feux d'artifice":          { keyword: 'feux artifice spectacle',     type: 'tourist_attraction' },
  'Événements saisonniers':   { keyword: 'événement saisonnier fête',   type: 'event_venue' },
  'Compétitions sportives':   { keyword: 'stade compétition sport',     type: 'stadium' },

  // ── HALTE GARDERIE ──────────────────────────────────────────────────────────
  'Sport avec garderie':    { keyword: 'sport garderie enfants',          type: 'sports_club' },
  'IKEA Småland':           { keyword: 'IKEA',                            type: 'furniture_store' },
  'Centres de loisirs':     { keyword: 'centre de loisirs enfants',       type: 'community_center' },
  'Ateliers sans parents':  { keyword: 'atelier enfants sans parents',    type: 'art_studio' },
  'Espaces kids galeries':  { keyword: 'espace enfants centre commercial',type: 'shopping_mall' },
  'Piscines avec garderie': { keyword: 'piscine garderie enfants',        type: 'swimming_pool' },
  'Associations locales':   { keyword: 'association locale famille',      type: 'community_center' },

  // ── ATELIERS CRÉATIFS ────────────────────────────────────────────────────────
  'Ateliers peinture':            { keyword: 'atelier peinture enfants',    type: 'art_studio' },
  'Poterie enfants':              { keyword: 'poterie atelier céramique',   type: 'art_studio' },
  'Cuisine créative':             { keyword: 'atelier cuisine enfants',     type: 'cooking_school' },
  'Ateliers musique':             { keyword: 'école musique atelier',       type: 'music_school' },
  'Ateliers science':             { keyword: 'atelier science enfants',     type: 'museum' },
  'Couture & DIY':                { keyword: 'atelier couture DIY créatif', type: 'art_studio' },
  'Ateliers numériques':          { keyword: 'atelier numérique enfants',   type: 'art_studio' },
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function normalizePlaceGoogle(place, centerLat, centerLng, subName) {
  const lat = place.geometry?.location?.lat ?? place.location?.latitude
  const lng = place.geometry?.location?.lng ?? place.location?.longitude
  if (!lat || !lng) return null

  const distKm = haversineKm(centerLat, centerLng, lat, lng)
  const distStr = distKm < 1
    ? `${Math.round(distKm * 1000)} m`
    : `${distKm.toFixed(1)} km`

  const rating = place.rating ? place.rating.toFixed(1) : '4.0'

  const types = (place.types ?? [])
    .filter(t => !['point_of_interest', 'establishment'].includes(t))
    .map(t => t.replace(/_/g, ' '))
    .slice(0, 2)

  return {
    id:          `google-${place.place_id ?? place.id ?? Math.random()}`,
    name:        place.name ?? place.displayName?.text ?? 'Sans nom',
    type:        subName,
    distance:    distStr,
    distanceKm:  Math.round(distKm * 10) / 10,
    address:     place.vicinity ?? place.formattedAddress ?? '',
    price:       'Voir sur place',
    priceNum:    1,
    isFree:      false,
    rating,
    openNow:     place.opening_hours?.open_now ?? place.currentOpeningHours?.openNow ?? null,
    hours:       null,
    description: types.length ? types.join(' · ') : '',
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

  const params = new URLSearchParams({
    lat,
    lng,
    radius:  radiusMeters,
    keyword: config.keyword,
    ...(config.type ? { type: config.type } : {}),
  })

  const res = await fetch(`/api/search?${params}`)
  if (!res.ok) throw new Error(`Erreur proxy Google: ${res.status}`)
  const data = await res.json()

  if (!data.results) {
    throw new Error(data.error_message || data.error || 'Google Places error')
  }

  const BUDGET_MAP = { 'Tous': null, 'Gratuit': 0, '-20€': 1, '-50€': 2, '-100€': 3 }
  const maxPrice = BUDGET_MAP[budget] ?? null

  return (data.results ?? [])
    .map(p => normalizePlaceGoogle(p, lat, lng, subName))
    .filter(Boolean)
    .filter(a => a.distanceKm <= radiusKm)
    .filter(a => maxPrice === null || a.priceNum <= maxPrice)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
