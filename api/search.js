// api/search.js — Vercel Function
// Request do Google Places idzie z serwera, nie z przeglądarki — brak CORS

export default async function handler(req, res) {
  // CORS headers — pozwala na requesty z localhost i Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { lat, lng, radius, keyword } = req.query
  const API_KEY = 'AIzaSyDzHGmtUPPLEp5gXJVZ3Eh_vqg9a3ntAWE'

  if (!lat || !lng || !keyword) {
    return res.status(400).json({ error: 'Paramètres manquants: lat, lng, keyword' })
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Clé API manquante côté serveur' })
  }

  try {
    const response = await fetch(
  'https://places.googleapis.com/v1/places:searchText',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask':
        'places.displayName,places.formattedAddress,places.location'
    },
    body: JSON.stringify({
  textQuery: keyword,
  languageCode: 'fr',
  maxResultCount: 10,
  locationBias: {
    circle: {
      center: {
        latitude: Number(lat),
        longitude: Number(lng)
      },
      radius: Number(radius || 5000)
    }
  }
})
  }
)

const data = await response.json()
const places = data.places ?? data.results ?? []
return res.status(200).json({ results: places })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}