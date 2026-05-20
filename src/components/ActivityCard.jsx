// src/components/ActivityCard.jsx
// Karta aktywności z lazy-load zdjęcia (Google Photos lub Unsplash fallback)
// Zastąp/połącz z istniejącym komponentem kart w App.jsx

import LazyImage from './LazyImage.jsx';

/**
 * ActivityCard — karta pojedynczej aktywności
 *
 * Props:
 *   activity {Object} — obiekt aktywności z googlePlacesService
 *   onSelect {Function} — callback po kliknięciu karty
 *   distanceKm {number|null} — dystans od użytkownika w km
 */
export default function ActivityCard({ activity, onSelect, distanceKm }) {
  const {
    name,
    address,
    rating,
    ratingsTotal,
    photoReference,
    fallbackPhoto,
    catId,
  } = activity;

  function formatDistance(km) {
    if (!km && km !== 0) return null;
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }

  function formatRating(r, total) {
    if (!r) return null;
    const stars = '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
    return { stars, value: r.toFixed(1), total };
  }

  const dist = formatDistance(distanceKm);
  const ratingInfo = formatRating(rating, ratingsTotal);

  return (
    <article
      className="activity-card"
      onClick={() => onSelect?.(activity)}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#FFF8F1',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      }}
    >
      {/* Zdjęcie — lazy-loaded */}
      <LazyImage
        photoReference={photoReference}
        fallbackSrc={fallbackPhoto}
        alt={name}
        style={{ height: '180px', width: '100%' }}
      />

      {/* Treść karty */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '15px',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </h3>

        {address && (
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '12px',
              color: '#888',
              fontFamily: 'Outfit, sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            📍 {address}
          </p>
        )}

        {/* Ocena + dystans */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {ratingInfo && (
            <span
              style={{
                fontSize: '12px',
                color: '#FF6B4A',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
              }}
              title={`${ratingInfo.total} avis`}
            >
              ★ {ratingInfo.value}
              <span style={{ color: '#aaa', fontWeight: 400, marginLeft: '3px' }}>
                ({ratingInfo.total > 999 ? '999+' : ratingInfo.total})
              </span>
            </span>
          )}

          {dist && (
            <span
              style={{
                fontSize: '11px',
                background: '#FFE8E1',
                color: '#FF6B4A',
                padding: '2px 8px',
                borderRadius: '20px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {dist}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
