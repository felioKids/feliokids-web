// api/search.js — proxy Vercel dla Google Places
// Z filtrem haversine po stronie backendu + paginacja + multi-query dla resto

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);
  return res.json();
}

async function fetchAllPages(url) {
  const results = [];
  let data = await fetchPage(url);
  (data.results || []).forEach(r => results.push(r));

  // Strona 2
  if (data.next_page_token) {
    await new Promise(r => setTimeout(r, 2000)); // Google wymaga 2s przed next_page
    const url2 = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${url.match(/key=([^&]+)/)[1]}`;
    data = await fetchPage(url2);
    (data.results || []).forEach(r => results.push(r));
  }

  // Strona 3
  if (data.next_page_token) {
    await new Promise(r => setTimeout(r, 2000));
    const url3 = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${url.match(/key=([^&]+)/)[1]}`;
    data = await fetchPage(url3);
    (data.results || []).forEach(r => results.push(r));
  }

  return results;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return res.status(500).json({ error: 'Brak klucza API' });

  const { lat, lng, radius, type, keyword, language = 'fr', textsearch } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Brak współrzędnych lat/lng' });

  const radiusNum = Number(radius || 10000);
  const latNum = Number(lat);
  const lngNum = Number(lng);

  const fields = [
    'place_id', 'name', 'vicinity', 'geometry',
    'rating', 'user_ratings_total', 'photos',
    'types', 'business_status', 'opening_hours',
  ].join(',');

  try {
    let allResults = [];
    const seen = new Set();

    const addResults = (results) => {
      (results || []).forEach(r => {
        if (!seen.has(r.place_id)) {
          seen.add(r.place_id);
          allResults.push(r);
        }
      });
    };

    if (textsearch === 'true' && keyword) {
      // Multi-query dla restauracji — Text Search + Nearby
      const queries = [
  // Text Search z keyword
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=${radiusNum}&language=${language}&key=${key}${type ? `&type=${encodeURIComponent(type)}` : ''}`,
  // Nearby Search z keyword
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusNum}&language=${language}&key=${key}${type ? `&type=${encodeURIComponent(type)}` : ''}&keyword=${encodeURIComponent(keyword)}`,
  // Trzecia linia tylko dla restauracji — nie dla wyszukiwarki tekstowej
  ...(type === 'restaurant' ? [`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusNum}&language=${language}&key=${key}&type=restaurant`] : []),
];

      const responses = await Promise.allSettled(queries.map(q => fetchPage(q)));
      responses.forEach(r => {
        if (r.status === 'fulfilled') addResults(r.value.results);
      });

    } else {
      // Normalny Nearby Search z paginacją
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusNum}&language=${language}&fields=${fields}&key=${key}`;
      if (type) url += `&type=${encodeURIComponent(type)}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

      const results = await fetchAllPages(url);
      addResults(results);
    }

    // ── Twardy filtr po dystansie — Google decyduje o kandydatach, MY decydujemy co pokazać
    const filtered = allResults
      .filter(place => place.business_status !== 'CLOSED_PERMANENTLY')
      .filter(place => {
        const pLat = place.geometry?.location?.lat;
        const pLng = place.geometry?.location?.lng;
        if (!pLat || !pLng) return false;
        const dist = haversineMeters(latNum, lngNum, pLat, pLng);
        return dist <= radiusNum;
      })
      .map(place => ({
        ...place,
        distance_m: Math.round(haversineMeters(latNum, lngNum, place.geometry.location.lat, place.geometry.location.lng)),
      }))
      .sort((a, b) => a.distance_m - b.distance_m);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=120');
    return res.status(200).json({ status: 'OK', results: filtered });

  } catch (err) {
    console.error('[search proxy] błąd:', err);
    return res.status(500).json({ error: 'Błąd serwera proxy' });
  }
}
