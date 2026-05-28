// api/details.js — pobiera szczegóły miejsca (telefon, strona www) z Google Places Details

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return res.status(500).json({ error: 'Brak klucza API' });

  const { place_id } = req.query;
  if (!place_id) return res.status(400).json({ error: 'Brak place_id' });

  try {
    const fields = 'formatted_phone_number,international_phone_number,website,url';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=${fields}&language=fr&key=${key}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);

    const data = await response.json();
    const result = data.result || {};

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600'); // cache 1h — telefon się nie zmienia często
    return res.status(200).json({
      phone: result.formatted_phone_number || result.international_phone_number || null,
      website: result.website || null,
      google_url: result.url || null,
    });

  } catch (err) {
    console.error('[details proxy] błąd:', err);
    return res.status(500).json({ error: 'Błąd serwera proxy' });
  }
}
