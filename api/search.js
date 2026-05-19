// api/search.js  (Vercel Serverless Function — plik w folderze /api/ w root projektu)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { lat, lng, radius, keyword, type } = req.query

  if (!lat || !lng || !radius || !keyword) {
    return res.status(400).json({ error: 'Paramètres manquants: lat, lng, radius, keyword' })
  }

  const apiKey = process.env.GOOGLE_PLACES_KEY || 'AIzaSyDzHGmtUPPLEp5gXJVZ3Eh_vqg9a3ntAWE'
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API Google manquante (GOOGLE_PLACES_KEY)' })
  }

  // Construction URL Google Places Nearby Search
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius:   String(radius),
    keyword:  String(keyword),
    language: 'fr',
    key:      apiKey,
  })

  // Si un type Google Places est fourni, on l'ajoute (améliore la précision)
  if (type) {
    params.set('type', String(type))
  }

  const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`

  try {
    const googleRes = await fetch(googleUrl)
    if (!googleRes.ok) {
      return res.status(502).json({ error: `Google API error: ${googleRes.status}` })
    }
    const data = await googleRes.json()

    // Statuts d'erreur Google
    if (data.status === 'REQUEST_DENIED') {
      return res.status(403).json({ error: 'Clé API invalide ou non autorisée', details: data.error_message })
    }
    if (data.status === 'OVER_QUERY_LIMIT') {
      return res.status(429).json({ error: 'Quota Google dépassé' })
    }

    // Statuts OK ou ZERO_RESULTS → on retourne les résultats (peut être vide)
    return res.status(200).json({
      results: data.results ?? [],
      status:  data.status,
    })
  } catch (err) {
    console.error('[api/search] Erreur:', err)
    return res.status(500).json({ error: 'Erreur serveur', details: err.message })
  }
}
