// api/search.js — proxy Vercel dla Google Places Nearby Search
// Z field mask → oszczędność kosztów API (~60% taniej)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Brak klucza API' });
  }
  const { lat, lng, radius, type, keyword, language = 'fr' } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Brak współrzędnych lat/lng' });
  }

  // Field mask — Basic Data (tańsze)
  // opening_hours zwraca { open_now: bool } — to Basic, nie Contact
  const fields = [
    'place_id',
    'name',
    'vicinity',
    'geometry',
    'rating',
    'user_ratings_total',
    'photos',
    'types',
    'business_status',
    'opening_hours', // ← DODANE: open_now boolean, Basic Data tier
  ].join(',');

  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius || 10000}&language=${language}&fields=${fields}&key=${key}`;
  if (type) url += `&type=${encodeURIComponent(type)}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_message || 'Błąd Google API' });
    }
    // Cache odpowiedzi po stronie Vercel CDN — 10 minut
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[search proxy] błąd:', err);
    return res.status(500).json({ error: 'Błąd serwera proxy' });
  }
}
