// api/photo.js — proxy Vercel dla zdjęć Google Places
// Ukrywa klucz API przed frontendem

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { photo_reference, maxwidth = '600' } = req.query;

  if (!photo_reference) {
    return res.status(400).json({ error: 'Brak photo_reference' });
  }

  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Brak klucza API' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photo_reference)}&key=${key}`;

  try {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Błąd Google Places Photo API' });
    }

    // Przekaż nagłówki cache i content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    // Cache na 24h — zdjęcia rzadko się zmieniają
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');

    // Strumieniuj zdjęcie bezpośrednio
    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[photo proxy] błąd:', err);
    return res.status(500).json({ error: 'Błąd serwera proxy' });
  }
}
