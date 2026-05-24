// api/events.js — proxy Vercel dla eventów
// Źródło: public.opendatasoft.com — dataset evenements-publics-openagenda
// Darmowe, bez klucza API, pokrywa całą Francję

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 30, days = 14 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Coordonnées lat/lng manquantes' });

  const now = new Date();
  const dateFrom = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const dateTo = new Date(now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  const radiusMeters = parseInt(radius) * 1000;

  // Filtre date_fin >= aujourd'hui ET date_debut <= dateTo
  // + filtre géographique
  const where = `date_fin>="${dateFrom}" AND date_debut<="${dateTo}"`;

  const params = new URLSearchParams({
    dataset: 'evenements-publics-openagenda',
    rows: 50,
    lang: 'fr',
    'geofilter.distance': `${lat},${lng},${radiusMeters}`,
    where,
  });

  const url = `https://public.opendatasoft.com/api/records/1.0/search/?${params}`;
  console.log('[events] URL:', url);

  try {
    const r = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'FelioKids/1.0' }
    });

    const text = await r.text();
    console.log('[events] status:', r.status, 'preview:', text.slice(0, 500));

    if (!r.ok) {
      return res.status(r.status).json({ error: `API erreur ${r.status}`, detail: text.slice(0, 200) });
    }

    const data = JSON.parse(text);
    const records = data.records || [];
    console.log('[events] records reçus:', records.length);

    // Log premier record pour debug
    if (records.length > 0) {
      console.log('[events] premier record fields:', JSON.stringify(Object.keys(records[0].fields)));
    }

    const normalized = records.map(r => normalizeRecord(r)).filter(Boolean);
    normalized.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300');
    return res.status(200).json({ events: normalized, total: normalized.length });

  } catch (err) {
    console.error('[events] erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
}

function normalizeRecord(record) {
  if (!record?.fields) return null;
  const f = record.fields;

  const title = f.title_fr || f.title || f.titre || '';
  if (!title) return null;

  const description = f.description_fr || f.description || f.resume || f.longdescription_fr || '';

  // Dates
  const dateStart = f.firstdate_begin || f.date_debut || null;
  const dateEnd = f.lastdate_end || f.date_fin || null;

  // Localisation — cherche tous les champs possibles
  const geo = f.location_coordinates || f.latlon || f.geo_point_2d || null;
  const lat = geo ? (Array.isArray(geo) ? geo[0] : geo.lat) : (f.latitude || null);
  const lng = geo ? (Array.isArray(geo) ? geo[1] : geo.lon) : (f.longitude || null);

  const city = f.location_city || f.city || f.ville || f.placename || '';
  const address = f.location_address || f.address || f.adresse || city || '';
  const postalCode = f.location_postalcode || f.postalcode || f.code_postal || '';

  // Image
  let image = null;
  if (f.image_href) image = f.image_href;
  else if (f.image) image = typeof f.image === 'string' ? f.image : null;

  // Catégorie
  const titleLower = title.toLowerCase();
  const tags = (f.tags || f.keywords || '').toLowerCase();
  let category = 'evenement';
  if (titleLower.includes('brocante') || titleLower.includes('vide-grenier') || titleLower.includes('vide grenier') || titleLower.includes('puces') || tags.includes('brocante')) {
    category = 'brocante';
  } else if (titleLower.includes('festival') || titleLower.includes('fête') || titleLower.includes('fete') || tags.includes('festival')) {
    category = 'festival';
  } else if (titleLower.includes('marché') || titleLower.includes('marche') || tags.includes('marche')) {
    category = 'marche';
  } else if (titleLower.includes('concert') || titleLower.includes('musique') || tags.includes('concert')) {
    category = 'concert';
  } else if (titleLower.includes('spectacle') || titleLower.includes('théâtre') || titleLower.includes('cirque')) {
    category = 'spectacle';
  }

  const slug = f.slug || record.recordid || '';

  return {
    id: `ods_${record.recordid || slug}`,
    title,
    description: (description || '').slice(0, 200),
    dateStart,
    dateEnd,
    address,
    city,
    postalCode,
    lat,
    lng,
    image,
    category,
    source: 'openagenda',
    sourceUrl: f.canonicalurl || f.url || `https://openagenda.com`,
  };
}
