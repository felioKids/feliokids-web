// src/components/WeekendPanel.jsx
// Panel "Ce week-end près de vous" — otwiera się po kliknięciu przycisku Weekend
// Pokazuje brocantes, festiwale, marchés z datami z OpenAgenda

import { useState, useEffect, useRef } from 'react';
import { fetchNearbyEvents, formatEventDate, getCategoryEmoji } from '../api/eventsService.js';

// ─── Karta wydarzenia ─────────────────────────────────────────────────────────
function EventCard({ event }) {
  const emoji = getCategoryEmoji(event.category);
  const dateStr = formatEventDate(event.dateStart);

  const categoryLabels = {
    brocante: 'Brocante',
    festival: 'Festival',
    marche: 'Marché',
    concert: 'Concert',
    evenement: 'Événement',
  };
  const categoryLabel = categoryLabels[event.category] || 'Événement';

  const mapsUrl = event.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address + ', ' + event.city)}`
    : null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      border: '1px solid #F0EBE3',
      marginBottom: '10px',
    }}>
      {/* Image si disponible */}
      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}

      <div style={{ padding: '12px 14px 14px' }}>
        {/* Badge catégorie + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            background: '#FFE8E1', color: '#FF6B4A',
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {emoji} {categoryLabel}
          </span>
          {dateStr && (
            <span style={{
              fontSize: '11px', fontWeight: 600,
              fontFamily: 'Outfit, sans-serif', color: '#5A6A82',
            }}>
              📅 {dateStr}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 style={{
          margin: '0 0 4px', fontSize: '14px', fontWeight: 700,
          fontFamily: 'Bricolage Grotesque, sans-serif',
          color: '#1B2B4B', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.title}
        </h3>

        {/* Adresse */}
        {(event.address || event.city) && (
          <p style={{
            margin: '0 0 8px', fontSize: '12px', color: '#9AAABB',
            fontFamily: 'Outfit, sans-serif',
            display: '-webkit-box', WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            📍 {[event.address, event.city].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Description */}
        {event.description && (
          <p style={{
            margin: '0 0 10px', fontSize: '12px', color: '#7A8A9A',
            fontFamily: 'Outfit, sans-serif', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.description}
          </p>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', borderRadius: '8px',
              background: '#f5f0ea', border: '1.5px solid transparent',
              fontSize: '11px', fontWeight: 600, color: '#555',
              fontFamily: 'Outfit, sans-serif', textDecoration: 'none',
              flex: 1, justifyContent: 'center',
            }}>
              🗺️ Itinéraire
            </a>
          )}
          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '8px',
            background: '#f5f0ea', border: '1.5px solid transparent',
            fontSize: '11px', fontWeight: 600, color: '#555',
            fontFamily: 'Outfit, sans-serif', textDecoration: 'none',
            flex: 1, justifyContent: 'center',
          }}>
            ℹ️ Détails
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function WeekendPanel({ lat, lng, isOpen, onClose }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('tous'); // tous | brocante | festival | marche
  const panelRef = useRef(null);

  // Charger les événements quand le panel s'ouvre
  useEffect(() => {
    if (!isOpen || !lat || !lng) return;
    if (events.length > 0) return; // déjà chargé

    setLoading(true);
    setError(null);

    fetchNearbyEvents({ lat, lng, radiusKm: 20, days: 7 })
      .then(data => setEvents(data))
      .catch(err => {
        console.error('[WeekendPanel]', err);
        setError('Impossible de charger les événements. Réessayez.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, lat, lng]);

  // Fermer en cliquant en dehors
  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = filter === 'tous'
    ? events
    : events.filter(e => e.category === filter);

  const filters = [
    { id: 'tous',     label: 'Tous',      emoji: '🗓️' },
    { id: 'brocante', label: 'Brocantes', emoji: '🏺' },
    { id: 'festival', label: 'Festivals', emoji: '🎪' },
    { id: 'marche',   label: 'Marchés',   emoji: '🛒' },
  ];

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(27,43,75,0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
      }} />

      {/* Panel */}
      <div ref={panelRef} style={{
        position: 'fixed',
        bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px',
        background: '#FFF8F1',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(27,43,75,0.18)',
        zIndex: 201,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid #EDE8E1',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#1B2B4B', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                ✨ Ce week-end près de vous
              </div>
              <div style={{ fontSize: '12px', color: '#9AAABB', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>
                {loading ? 'Chargement...' : `${events.length} événement${events.length !== 1 ? 's' : ''} trouvé${events.length !== 1 ? 's' : ''}`}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: '#F0EBE3', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '6px 12px', borderRadius: '99px',
                fontSize: '11px', fontWeight: 700, flexShrink: 0,
                fontFamily: 'Outfit, sans-serif',
                background: filter === f.id ? '#FF6B4A' : '#F0EBE3',
                color: filter === f.id ? '#fff' : '#5A6A82',
                border: 'none', cursor: 'pointer',
                transition: 'all .15s',
              }}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '14px 14px 24px' }}>

          {/* Spinner */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <style>{`@keyframes fk-spin2 { to { transform: rotate(360deg); } }`}</style>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid #FFE8E1', borderTopColor: '#FF6B4A',
                animation: 'fk-spin2 0.7s linear infinite',
                margin: '0 auto 12px',
              }} />
              <div style={{ fontSize: '13px', color: '#9AAABB', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Recherche des événements...
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div style={{
              padding: '16px', background: '#FFF3F0', borderRadius: '12px',
              border: '1px solid #FFCFC4', fontSize: '13px', color: '#B03A2E',
              fontFamily: 'Outfit, sans-serif', textAlign: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Aucun résultat */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎪</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1B2B4B', fontFamily: 'Bricolage Grotesque, sans-serif', marginBottom: '8px' }}>
                Bientôt disponible !
              </div>
              <div style={{ fontSize: '13px', color: '#9AAABB', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6, marginBottom: '16px' }}>
                Les brocantes, festivals et marchés<br/>près de chez vous arrivent très bientôt.
              </div>
              <div style={{ background: '#FFF3F0', border: '1px solid #FFE0D6', borderRadius: '12px', padding: '12px 16px', fontSize: '12px', color: '#FF6B4A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                🔔 Activez les alertes pour être notifié en premier !
              </div>
            </div>
          )}

          {/* Liste événements */}
          {!loading && filtered.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </>
  );
}
