// src/components/LazyImage.jsx
// Lazy-load zdjęć przez IntersectionObserver
// Przeglądarka automatycznie cache'uje /api/photo URLs (Cache-Control: max-age=86400)
// — identyczny URL nigdy nie wywoła drugiego requestu do Google

import { useState, useEffect, useRef, memo } from 'react';
import { buildPhotoUrl } from '../api/googlePlacesService.js';
import { logRequest, logCacheHit } from '../api/requestLogger.js';

// Moduł-level Set śledzi które photo_reference już zostały załadowane
// w tej sesji JS. Przeżywa re-rendery, resetuje się przy F5.
// Uzupełnia cache przeglądarki (który jest niewidoczny dla JS).
const loadedRefs = new Set();

// Globalne style shimmer — wstrzyknij RAZ na poziomie modułu, nie w każdym <style>
if (typeof document !== 'undefined' && !document.getElementById('fk-shimmer-style')) {
  const s = document.createElement('style');
  s.id = 'fk-shimmer-style';
  s.textContent = `
    @keyframes fkShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `;
  document.head.appendChild(s);
}

/**
 * LazyImage
 *
 * Props:
 *   photoReference  {string|null}  — photo_reference z Google Places
 *   fallbackSrc     {string}       — URL fallback (Unsplash kategoriowy)
 *   alt             {string}
 *   style           {Object}       — styl wrappera (zwykle height + width)
 *   maxwidth        {number}       — szerokość zdjęcia w px (domyślnie 600)
 */
const LazyImage = memo(function LazyImage({
  photoReference,
  fallbackSrc,
  alt = '',
  style = {},
  maxwidth = 600,
}) {
  // targetSrc = URL który zostanie ustawiony na <img> gdy karta wejdzie w viewport
  // Oblicz raz przy mount — nigdy nie zmienia się dla tej samej karty
  const targetSrc = useRef(
    photoReference ? buildPhotoUrl(photoReference, maxwidth) : fallbackSrc
  );

  const [visible, setVisible]   = useState(false); // czy IO odpalił
  const [loaded, setLoaded]     = useState(false);  // czy img.onLoad
  const [useFallback, setUseFallback] = useState(false);
  const wrapperRef = useRef(null);

  // ── Intersection Observer ─────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || visible) return; // już widoczny — nie zakładaj ponownie

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setVisible(true);

        // Loguj tylko jeśli to naprawdę nowy request do photo API
        if (photoReference) {
          const photoUrl = targetSrc.current;
          if (loadedRefs.has(photoReference)) {
            logCacheHit('photo', photoReference, { source: 'js-memory' });
          } else {
            // Przeglądarka może mieć to w HTTP cache — JS tego nie wie,
            // więc logujemy jako "prawdopodobny fetch" (sieć to rozstrzygnie)
            logRequest('photo', photoReference);
            loadedRefs.add(photoReference);
          }
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // puste deps — efekt tylko przy mount, visible jest ref-tracked przez guard

  function handleLoad() {
    setLoaded(true);
  }

  function handleError() {
    if (!useFallback && fallbackSrc && targetSrc.current !== fallbackSrc) {
      setUseFallback(true);
      setLoaded(false);
    } else {
      // Fallback też się nie załadował — pokaż emoji
      setLoaded(true);
    }
  }

  const imgSrc = useFallback ? fallbackSrc : targetSrc.current;

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', overflow: 'hidden', background: '#f0e8e0', ...style }}
    >
      {/* Shimmer skeleton — dopóki img nie załadowane */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0e8e0 25%, #e8ddd4 50%, #f0e8e0 75%)',
            backgroundSize: '200% 100%',
            animation: 'fkShimmer 1.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Obrazek — montuj dopiero gdy karta widoczna (visible) */}
      {visible && imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
});

export default LazyImage;
