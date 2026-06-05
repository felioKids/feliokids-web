// src/api/overpassService.js

import { getFiltersForSub, getSourceForSub } from './categoryConfig.js'
import { searchActivitiesGoogle } from './googlePlacesService.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
const OVERPASS_URL  = '/api/overpass'

export async function geocodeCity(cityName) {
  const params = new URLSearchParams({
    q: cityName, format: 'json', limit: '1',
    countrycodes: 'fr', addressdetails: '1',
  })
  const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    headers: { 'User-Agent': 'FelioKids/1.0 (contact.feliokids@gmail.com)', 'Accept-Language': 'fr' },
  })
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)
  const data = await res.json()
  if (!data.length) throw new Error(`Ville introuvable : "${cityName}"`)
  const { lat, lon, display_name } = data[0]
  return { lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name }
}

function buildQuery(lat, lng, radiusMeters, filters) {
  const OSM_TYPES = ['node', 'way', 'relation']
  const lines = filters.flatMap(({ key, value }) =>
    OSM_TYPES.map(t => `${t}["${key}"="${value}"](around:${radiusMeters},${lat},${lng});`)
  )
  return `[out:json][timeout:20];\n(\n${lines.join('\n')}\n);\nout body center 60;`
}

async function fetchOverpass(query) {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`)
  const data = await res.json()
  return data.elements ?? []
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function estimatePrice(tags = {}) {
  if (tags.fee === 'no' || tags.access === 'yes') return 'Gratuit'
  if (tags.fee === 'yes') {
    const amount = parseFloat((tags.charge || tags['fee:amount'] || '').replace(/[^\d.]/g, ''))
    if (!isNaN(amount)) return amount === 0 ? 'Gratuit' : `${amount}€`
    return 'Voir sur place'
  }
  return 'Gratuit'
}

function estimatePriceNum(tags = {}) {
  if (tags.fee === 'no' || tags.access === 'yes') return 0
  if (tags.fee === 'yes') {
    const amount = parseFloat((tags.charge || tags['fee:amount'] || '').replace(/[^\d.]/g, ''))
    if (!isNaN(amount)) {
      if (amount === 0)  return 0
      if (amount <= 20)  return 1
      if (amount <= 50)  return 2
      return 3
    }
    return 1
  }
  return 0
}

const BUDGET_MAP = { 'Tous': null, 'Gratuit': 0, '-20€': 1, '-50€': 2, '-100€': 3 }

function normalizeElement(el, centerLat, centerLng, subName) {
  const tags = el.tags || {}
  const name = tags.name || tags['name:fr'] || tags.brand || null
  if (!name) return null

  const lat = el.lat ?? el.center?.lat ?? null
  const lng = el.lon ?? el.center?.lon ?? null
  if (!lat || !lng) return null

  const distKm  = haversineKm(centerLat, centerLng, lat, lng)
  const distStr = distKm < 1
    ? `${Math.round(distKm * 1000)} m`
    : `${distKm.toFixed(1)} km`

  const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
    .filter(Boolean).join(' ')

  const readableTags = [tags.leisure, tags.tourism, tags.amenity, tags.sport, tags.natural, subName]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  return {
    id:          `osm-${el.type}-${el.id}`,
    name,
    type:        subName,
    distance:    distStr,
    distanceKm:  Math.round(distKm * 10) / 10,
    address:     address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    price:       estimatePrice(tags),
    priceNum:    estimatePriceNum(tags),
    isFree:      estimatePriceNum(tags) === 0,
    rating:      '4.0',
    openNow:     null,
    hours:       tags.opening_hours || null,
    description: tags.description || tags['description:fr'] || tags.note || '',
    tags:        readableTags,
    restaurants: [],
    lat, lng,
    website:     tags.website || tags['contact:website'] || null,
    phone:       tags.phone   || tags['contact:phone']   || null,
  }
}

export async function searchActivities({ city, radiusKm, budget, catId, subName, userLat, userLng }) {
  const source = getSourceForSub(catId, subName)

  if (source === 'google') {
    const coords = userLat && userLng 
      ? { lat: userLat, lng: userLng }
      : await geocodeCity(city)
    const filters = getFiltersForSub(catId, subName)
    const googleType = filters.find(f => f.type)?.type || null
  const googleKeyword = filters.find(f => f.keyword)?.keyword || subName
const googleTextsearch = filters.find(f => f.textsearch) ? true : false
return searchActivitiesGoogle({
  lat: coords.lat,
  lng: coords.lng,
  radius: radiusKm * 1000,
  catId,
  type: googleType,
  keyword: googleKeyword,
  textsearch: googleTextsearch,
})
  }

  // OSM / Overpass
  const coords  = await geocodeCity(city)
  const filters = getFiltersForSub(catId, subName)
  if (!filters.length) throw new Error(`Aucun filtre OSM pour "${catId} > ${subName}"`)

  const query    = buildQuery(coords.lat, coords.lng, radiusKm * 1000, filters)
  const elements = await fetchOverpass(query)

  const maxPrice = BUDGET_MAP[budget] ?? null
  return elements
    .map(el => normalizeElement(el, coords.lat, coords.lng, subName))
    .filter(Boolean)
    .filter(a => maxPrice === null || a.priceNum <= maxPrice)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
