// src/components/ActivityCard.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import LazyImage from './LazyImage.jsx';
import { supabase } from '../lib/supabase.js';

const NO_RESERVER_TYPES = new Set([
  'shopping_mall', 'supermarket', 'department_store',
  'park', 'library', 'school', 'church', 'cemetery',
  'locality', 'neighborhood', 'route',
]);
const NO_RESERVER_CATS = new Set(['gratuit', 'nature', 'halte']);
const PAID_CATS = new Set(['anniversaire']);
const PAID_TYPES = new Set([
  'amusement_park', 'bowling_alley', 'movie_theater', 'aquarium', 'zoo',
]);
const PAID_KEYWORDS = [
  'cinéma', 'cinema', 'bowling', 'trampoline', 'laser', 'aquarium',
  'piscine', 'aquatique', 'karting', 'patinoire', 'escalade',
  'accrobranche', 'escape', 'karting', 'cirque', 'théâtre',
];

function isPaidActivity(activity) {
  if (NO_RESERVER_CATS.has(activity.catId)) return false;
  if (activity.types?.some(t => NO_RESERVER_TYPES.has(t))) return false;
  if (PAID_CATS.has(activity.catId)) return true;
  if (activity.types?.some(t => PAID_TYPES.has(t))) return true;
  const nameLower = (activity.name || '').toLowerCase();
  if (PAID_KEYWORDS.some(k => nameLower.includes(k))) return true;
  return false;
}

function isRestaurant(activity) { return activity.catId === 'resto'; }

function getMapsUrl(activity) {
  const lat = activity.geometry?.location?.lat ?? activity.lat;
  const lng = activity.geometry?.location?.lng ?? activity.lng;
  if (lat != null && lng != null) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const dest = encodeURIComponent(`${activity.name}, ${activity.address || ''}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

function getFunbookerUrl(activity) {
  return `https://www.funbooker.com/fr/recherche?q=${encodeURIComponent(activity.name || '')}&ref=feliokids`;
}

function getTheForkUrl(activity) {
  return `https://www.thefork.fr/recherche?q=${encodeURIComponent(activity.name || '')}&utm_source=feliokids`;
}

async function shareActivity(activity) {
  const text = `J'ai trouvé une super activité pour les enfants : ${activity.name}`;
  const url = `https://www.feliokids.com`;
  if (navigator.share) {
    try { await navigator.share({ title: activity.name, text, url }); } catch {}
  } else {
    await navigator.clipboard.writeText(`${text} – ${url}`);
    alert('Lien copié !');
  }
}

async function fetchPlaceDetails(placeId) {
  const cacheKey = `fk_phone_${placeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached !== null) return JSON.parse(cached);
  try {
    const res = await fetch(`/api/details?place_id=${encodeURIComponent(placeId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch { return null; }
}

async function fetchKidsRestaurants(lat, lng) {
  const keywords = ['McDonald', 'Burger King', 'KFC', 'Quick', 'Subway', 'pizza', 'crêperie', 'kebab', 'Brioche Dorée'];
  const allResults = [];
  const seen = new Set();
  await Promise.all(keywords.map(async (kw) => {
    try {
      const params = new URLSearchParams({ lat, lng, radius: 2000, type: 'restaurant', keyword: kw, language: 'fr' });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      (data.results || []).slice(0, 2).forEach(r => {
        if (!seen.has(r.place_id)) { seen.add(r.place_id); allResults.push(r); }
      });
    } catch {}
  }));
  if (allResults.length < 3) {
    try {
      const params = new URLSearchParams({ lat, lng, radius: 3000, type: 'restaurant', language: 'fr' });
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        (data.results || []).slice(0, 5).forEach(r => {
          if (!seen.has(r.place_id)) { seen.add(r.place_id); allResults.push(r); }
        });
      }
    } catch {}
  }
  return allResults.slice(0, 5);
}

async function fetchNearby(lat, lng, type) {
  const params = new URLSearchParams({ lat, lng, radius: 1000, type, language: 'fr' });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error('fetch failed');
  const data = await res.json();
  return (data.results || []).slice(0, 4);
}

function getDirectionsUrl(item) {
  let lat = item.geometry?.location?.lat;
  let lng = item.geometry?.location?.lng;
  if (typeof lat === 'function') lat = lat();
  if (typeof lng === 'function') lng = lng();
  if (lat == null) lat = item.lat;
  if (lng == null) lng = item.lng;
  const destinationText = [item.name, item.vicinity].filter(Boolean).join(', ');
  if (item.place_id && lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${item.place_id}`;
  if (item.place_id && destinationText)
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationText)}&destination_place_id=${item.place_id}`;
  if (lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationText)}`;
}

// ─── AI Description ────────────────────────────────────────────────────────────

const aiDescCache = {};

async function fetchAiDescription(name, catId, address) {
  const key = `fk_ai_${name}_${catId}`;
  if (aiDescCache[key]) return aiDescCache[key];
  const cached = sessionStorage.getItem(key);
  if (cached) { aiDescCache[key] = cached; return cached; }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Tu es un assistant pour FelioKids, une app française pour familles avec enfants.
Écris 2 phrases courtes et utiles sur ce lieu pour des parents avec enfants.
Lieu: "${name}"
Catégorie: "${catId}"
Adresse: "${address || 'France'}"

Règles:
- Maximum 2 phrases, 30 mots total
- Infos pratiques: âge recommandé, durée, ce qui est bien pour les enfants
- Ton chaleureux et familial
- En français
- PAS de "Je" ni de "Nous"
- Commence directement par l'info

Réponds UNIQUEMENT avec les 2 phrases, rien d'autre.`
        }],
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';
    if (text) {
      aiDescCache[key] = text;
      sessionStorage.setItem(key, text);
    }
    return text;
  } catch { return ''; }
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────

async function ensurePlaceExists(placeId, name) {
  const { data } = await supabase.from('places').select('place_id').eq('place_id', placeId).single();
  if (!data) await supabase.from('places').insert({ place_id: placeId, name });
}

async function fetchFamilyData(placeId) {
  const [reviewsRes, quickRes] = await Promise.all([
    supabase.from('reviews').select('*').eq('place_id', placeId).eq('approved', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('quick_answers').select('*').eq('place_id', placeId).eq('approved', true),
  ]);
  return {
    reviews: reviewsRes.data || [],
    quickAnswers: quickRes.data || [],
  };
}

function aggregateQuickAnswers(quickAnswers) {
  if (!quickAnswers.length) return null;
  const total = quickAnswers.length;
  const parkingOui = quickAnswers.filter(q => q.parking === true).length;
  const poussetteOui = quickAnswers.filter(q => q.poussette === true).length;
  const ageMap = {};
  const timeMap = {};
  quickAnswers.forEach(q => {
    if (q.age_range) ageMap[q.age_range] = (ageMap[q.age_range] || 0) + 1;
    if (q.time_needed) timeMap[q.time_needed] = (timeMap[q.time_needed] || 0) + 1;
  });
  const topAge = Object.entries(ageMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topTime = Object.entries(timeMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { parking: total > 0 ? Math.round((parkingOui / total) * 100) : null, poussette: total > 0 ? Math.round((poussetteOui / total) * 100) : null, topAge, topTime, total };
}

// ─── Photo Carousel ────────────────────────────────────────────────────────────

function PhotoCarousel({ photoReferences, fallbackPhoto, name, familyPhotos }) {
  const [idx, setIdx] = useState(0);

  const familyUrls = (familyPhotos || []).map(p => p.image_url);
  const googleUrls = (photoReferences || []).filter(Boolean).map(ref => `/api/photo?photo_reference=${encodeURIComponent(ref)}&maxwidth=600`);
  const fallback = fallbackPhoto ? [fallbackPhoto] : [];
  const allPhotos = [...familyUrls, ...googleUrls, ...fallback].slice(0, 5);

  if (allPhotos.length === 0) return (
    <div style={{ height: '180px', background: '#f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '32px' }}>📍</span>
    </div>
  );

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + allPhotos.length) % allPhotos.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % allPhotos.length); };
  const isFamily = idx < familyUrls.length;

  return (
    <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#f0e8e0' }}>
      <img src={allPhotos[idx]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={e => { if (fallbackPhoto) e.target.src = fallbackPhoto; }} />

      {isFamily && (
        <span style={{ position: 'absolute', bottom: '34px', left: '10px', background: 'rgba(255,107,74,0.92)', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
          📸 Photo famille
        </span>
      )}

      {allPhotos.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>‹</button>
          <button onClick={next} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>›</button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {allPhotos.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: '3px', background: i === idx ? '#FF6B4A' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s', cursor: 'pointer' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── AI Description ───────────────────────────────────────────────────────────

function AiDescription({ name, catId, address }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchAiDescription(name, catId, address).then(d => { setDesc(d); setLoading(false); });
  }, [name, catId, address]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px', padding: '8px 10px', background: '#f5f0ea', borderRadius: '8px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #FFE8E1', borderTopColor: '#FF6B4A', animation: 'fk-spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Outfit, sans-serif' }}>Analyse du lieu...</span>
    </div>
  );

  if (!desc) return null;

  return (
    <div style={{ margin: '0 0 10px', padding: '8px 10px', background: '#f5f0ea', borderRadius: '8px', borderLeft: '3px solid #FF6B4A' }}>
      <span style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#FF6B4A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '3px' }}>✨ FelioKids</span>
      <p style={{ margin: 0, fontSize: '12px', color: '#555', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

// ─── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({ activity, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [quick, setQuick] = useState({ parking: null, poussette: null, age_range: null, time_needed: null });
  const [form, setForm] = useState({ nickname: '', age_of_children: '', rating: 5, review_text: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const handleQuickToggle = (field, value) => {
    setQuick(prev => ({ ...prev, [field]: prev[field] === value ? null : value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo trop grande (max 5MB)'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) return;
    setSubmitting(true);
    try {
      await ensurePlaceExists(activity.place_id, activity.name);

      const hasQuick = Object.values(quick).some(v => v !== null);
      if (hasQuick) {
        await supabase.from('quick_answers').insert({ place_id: activity.place_id, ...quick, approved: false });
      }

      if (form.review_text.trim() || form.rating) {
        await supabase.from('reviews').insert({
          place_id: activity.place_id,
          nickname: form.nickname.trim(),
          age_of_children: form.age_of_children.trim() || null,
          rating: form.rating,
          review_text: form.review_text.trim() || null,
          approved: false,
        });
      }

      if (photo) {
        const ext = photo.name.split('.').pop();
        const fileName = `${activity.place_id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos').upload(fileName, photo, { contentType: photo.type });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
          await supabase.from('photos').insert({
            place_id: activity.place_id,
            image_url: urlData.publicUrl,
            approved: true,
          });
        }
      }

      setSubmitted(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const btnBase = { border: '1.5px solid #e8e0d8', borderRadius: '20px', padding: '7px 14px', fontSize: '13px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: '#f5f0ea', color: '#555' };
  const btnActive = { ...btnBase, background: '#FFE8E1', borderColor: '#FF6B4A', color: '#FF6B4A' };
  const btnRed = { ...btnBase, background: '#fef2f2', borderColor: '#ef4444', color: '#ef4444' };

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#FFF8F1', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px', padding: '24px 20px 32px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌟</div>
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', color: '#1a1a1a', margin: '0 0 8px' }}>Merci pour ton avis !</h3>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', color: '#888', margin: 0 }}>Tu aides les familles ! Ton conseil sera visible très bientôt. 🙏</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '17px', color: '#1a1a1a', margin: 0 }}>Ton avis sur {activity.name}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>

            {step === 1 && (
              <>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', color: '#888', margin: '0 0 16px' }}>Réponds en 10 secondes — aide les autres familles ! 👇</p>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🅿️ Parking facile ?</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={quick.parking === true ? btnActive : btnBase} onClick={() => handleQuickToggle('parking', true)}>✅ Oui</button>
                    <button style={quick.parking === false ? btnRed : btnBase} onClick={() => handleQuickToggle('parking', false)}>❌ Non</button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👶 Accessible poussette ?</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={quick.poussette === true ? btnActive : btnBase} onClick={() => handleQuickToggle('poussette', true)}>✅ Oui</button>
                    <button style={quick.poussette === false ? btnRed : btnBase} onClick={() => handleQuickToggle('poussette', false)}>❌ Non</button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🧒 Pour quel âge ?</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['0-3', '4-6', '7-12'].map(age => (
                      <button key={age} style={quick.age_range === age ? btnActive : btnBase} onClick={() => handleQuickToggle('age_range', age)}>{age} ans</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏱️ Temps sur place ?</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['1h', '2h', 'Demi-journée'].map(t => (
                      <button key={t} style={quick.time_needed === t ? btnActive : btnBase} onClick={() => handleQuickToggle('time_needed', t)}>{t}</button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(2)} style={{ width: '100%', padding: '13px', background: '#FF6B4A', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
                  Continuer → Avis écrit + Photo
                </button>
                <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '10px', background: 'none', color: '#aaa', border: 'none', fontSize: '13px', fontFamily: 'Outfit, sans-serif', cursor: 'pointer', marginTop: '8px' }}>
                  Envoyer uniquement les réponses rapides
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Ton prénom ou pseudo *</label>
                  <input value={form.nickname} onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))} placeholder="ex: Maman de Lucas"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8e0d8', fontFamily: 'Outfit, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Âge de tes enfants</label>
                  <input value={form.age_of_children} onChange={e => setForm(p => ({ ...p, age_of_children: e.target.value }))} placeholder="ex: 3 et 7 ans"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8e0d8', fontFamily: 'Outfit, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Note</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))}
                        style={{ fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', opacity: form.rating >= s ? 1 : 0.3, transition: 'opacity 0.15s' }}>⭐</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Ton avis</label>
                  <textarea value={form.review_text} onChange={e => setForm(p => ({ ...p, review_text: e.target.value }))}
                    placeholder="Ce qui t'a plu, conseils pratiques pour les autres familles..."
                    rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8e0d8', fontFamily: 'Outfit, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>📸 Ajouter une photo (optionnel)</label>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  {photoPreview ? (
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '140px' }}>
                      <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: '#fff', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      style={{ width: '100%', padding: '16px', border: '2px dashed #e8e0d8', borderRadius: '10px', background: '#fafafa', color: '#aaa', fontFamily: 'Outfit, sans-serif', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                      📷 Appuyer pour ajouter une photo<br />
                      <span style={{ fontSize: '11px' }}>JPG, PNG ou WebP · max 5MB</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: '#f5f0ea', color: '#555', border: '1.5px solid #e8e0d8', borderRadius: '12px', fontSize: '14px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer' }}>← Retour</button>
                  <button onClick={handleSubmit} disabled={submitting || !form.nickname.trim()}
                    style={{ flex: 2, padding: '12px', background: form.nickname.trim() ? '#FF6B4A' : '#e8e0d8', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: form.nickname.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
                    {submitting ? 'Envoi...' : 'Envoyer mon avis 🌟'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Conseils des familles ─────────────────────────────────────────────────────

function ConseilsFamilles({ activity, onOpenModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!activity.place_id) return;
    fetchFamilyData(activity.place_id).then(d => { setData(d); setLoading(false); });
  }, [activity.place_id]);

  const agg = data ? aggregateQuickAnswers(data.quickAnswers) : null;
  const reviews = data?.reviews || [];

  const chipStyle = (color = '#FF6B4A', bg = '#FFE8E1') => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '4px 10px', borderRadius: '20px', background: bg, color,
    fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 700,
  });

  return (
    <div onClick={e => e.stopPropagation()} style={{ borderTop: '1px solid #f0e8e0', marginTop: '12px', paddingTop: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>👨‍👩‍👧 Conseils des familles</span>
        {reviews.length > 0 && <span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'Outfit, sans-serif' }}>{reviews.length} avis</span>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #FFE8E1', borderTopColor: '#FF6B4A', animation: 'fk-spin 0.7s linear infinite' }} />
          <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Outfit, sans-serif' }}>Chargement...</span>
        </div>
      ) : (
        <>
          {agg && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {agg.parking !== null && (
                <span style={chipStyle(agg.parking >= 60 ? '#22c55e' : '#ef4444', agg.parking >= 60 ? '#f0fdf4' : '#fef2f2')}>
                  🅿️ {agg.parking >= 60 ? 'Parking facile' : 'Parking difficile'}
                </span>
              )}
              {agg.poussette !== null && (
                <span style={chipStyle(agg.poussette >= 60 ? '#22c55e' : '#ef4444', agg.poussette >= 60 ? '#f0fdf4' : '#fef2f2')}>
                  👶 {agg.poussette >= 60 ? 'Poussette OK' : 'Poussette difficile'}
                </span>
              )}
              {agg.topAge && <span style={chipStyle()}>🧒 {agg.topAge} ans</span>}
              {agg.topTime && <span style={chipStyle('#7c3aed', '#f5f3ff')}>⏱️ {agg.topTime}</span>}
            </div>
          )}

          {reviews.length === 0 ? (
            <button onClick={() => onOpenModal()}
              style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #FF6B4A, #ff8c6b)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
              🌟 Sois la première famille à donner ton avis !
            </button>
          ) : (
            <>
              {(expanded ? reviews : reviews.slice(0, 1)).map(review => (
                <div key={review.id} style={{ background: '#fff', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', border: '1px solid #f0e8e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 700, color: '#1a1a1a' }}>
                      {review.nickname}
                      {review.age_of_children && <span style={{ fontWeight: 400, color: '#aaa' }}> · {review.age_of_children}</span>}
                    </span>
                    <span style={{ fontSize: '11px', color: '#FF6B4A' }}>{'⭐'.repeat(review.rating || 5)}</span>
                  </div>
                  {review.review_text && <p style={{ margin: 0, fontSize: '12px', color: '#555', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>{review.review_text}</p>}
                </div>
              ))}
              {reviews.length > 1 && (
                <button onClick={() => setExpanded(e => !e)}
                  style={{ background: 'none', border: 'none', color: '#FF6B4A', fontSize: '12px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', padding: '2px 0', marginBottom: '6px' }}>
                  {expanded ? '▲ Voir moins' : `▼ Voir ${reviews.length - 1} avis de plus`}
                </button>
              )}
              <button onClick={() => onOpenModal()}
                style={{ width: '100%', padding: '9px', background: '#f5f0ea', color: '#FF6B4A', border: '1.5px solid #FFE8E1', borderRadius: '12px', fontSize: '12px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
                + Ajouter ton avis
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── MiniList ─────────────────────────────────────────────────────────────────

function MiniList({ items, type, onClose, loading }) {
  const isParking = type === 'parking';
  const icon = isParking ? '🅿️' : '🍔';
  const title = isParking ? 'Parkings à proximité' : 'Manger à proximité';
  return (
    <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 100, padding: '12px', maxHeight: '220px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: '#1a1a1a' }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#aaa', padding: '0 2px' }}>✕</button>
      </div>
      <style>{`@keyframes fk-spin { to { transform: rotate(360deg); } }`}</style>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #FFE8E1', borderTopColor: '#FF6B4A', animation: 'fk-spin 0.7s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Outfit, sans-serif' }}>Recherche en cours...</span>
        </div>
      ) : items.length === 0 && isParking ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
          <span style={{ fontSize: '16px' }}>🅿️</span>
          <span style={{ fontSize: '12px', color: '#555', fontFamily: 'Outfit, sans-serif', fontStyle: 'italic' }}>Parking probablement disponible sur place</span>
        </div>
      ) : items.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#aaa', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Aucun résultat trouvé.</p>
      ) : items.map((item, i) => (
        <a key={item.place_id || i} href={getDirectionsUrl(item)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 0', borderTop: i === 0 ? 'none' : '1px solid #f0e8e0', textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
            {item.vicinity && <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.vicinity}</div>}
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            {item.rating && <span style={{ fontSize: '11px', color: '#FF6B4A', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>★ {item.rating}</span>}
            {item.opening_hours?.open_now !== undefined && (
              <span style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: item.opening_hours.open_now ? '#22c55e' : '#ef4444', whiteSpace: 'nowrap' }}>
                {item.opening_hours.open_now ? '● Ouvert' : '● Fermé'}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────

function ActionBtn({ emoji, label, onClick, href, loading, active, style = {} }) {
  const base = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 4px', background: active ? '#FFE8E1' : '#f5f0ea', border: active ? '1.5px solid #FF6B4A' : '1.5px solid transparent', borderRadius: '10px', cursor: 'pointer', flex: 1, transition: 'background 0.15s, border-color 0.15s', textDecoration: 'none', ...style };
  const inner = (
    <>
      <span style={{ fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>{loading ? '⏳' : emoji}</span>
      <span style={{ fontSize: '9.5px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: active ? '#FF6B4A' : '#555', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{label}</span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onClick={e => e.stopPropagation()}>{inner}</a>;
  return <button style={base} onClick={e => { e.stopPropagation(); onClick?.(); }}>{inner}</button>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActivityCard({ activity, onSelect, distanceKm }) {
  const { name, address, rating, ratingsTotal, photoReference, photoReferences, fallbackPhoto, openNow } = activity;
  const [parkingData, setParkingData] = useState(null);
  const [mangerData, setMangerData] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [phone, setPhone] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [familyPhotos, setFamilyPhotos] = useState([]);

  const [isFav, setIsFav] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_favs') || '[]').some(f => f.place_id === activity.place_id); }
    catch { return false; }
  });

  const toggleFav = useCallback((e) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('fk_favs') || '[]');
      const exists = favs.some(f => f.place_id === activity.place_id);
      const next = exists
        ? favs.filter(f => f.place_id !== activity.place_id)
        : [...favs, { place_id: activity.place_id, name: activity.name, address: activity.address, rating: activity.rating, photoReference: activity.photoReference, fallbackPhoto: activity.fallbackPhoto, catId: activity.catId, geometry: activity.geometry, types: activity.types }];
      localStorage.setItem('fk_favs', JSON.stringify(next));
      setIsFav(!exists);
    } catch {}
  }, [activity]);

  const cardRef = useRef(null);
  const lat = activity.geometry?.location?.lat ?? activity.lat;
  const lng = activity.geometry?.location?.lng ?? activity.lng;
  const paid = isPaidActivity(activity);
  const resto = isRestaurant(activity);
  const isAnniversaire = activity.catId === 'anniversaire';
  const openStatus = openNow ?? activity.opening_hours?.open_now ?? null;

  useEffect(() => {
    if (!isAnniversaire || !activity.place_id || phone !== null) return;
    fetchPlaceDetails(activity.place_id).then(details => setPhone(details?.phone || ''));
  }, [isAnniversaire, activity.place_id, phone]);

  useEffect(() => {
    if (!activePanel) return;
    function handleOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) setActivePanel(null);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePanel]);

  useEffect(() => {
    if (!activity.place_id) return;
    supabase.from('photos').select('image_url').eq('place_id', activity.place_id).eq('approved', true).limit(3)
      .then(({ data }) => setFamilyPhotos(data || []));
  }, [activity.place_id, reviewKey]);

  const handleParking = useCallback(async () => {
    if (activePanel === 'parking') { setActivePanel(null); return; }
    setActivePanel('parking');
    if (parkingData !== null) return;
    setParkingData('loading');
    try { setParkingData(await fetchNearby(lat, lng, 'parking')); }
    catch { setParkingData([]); }
  }, [lat, lng, activePanel, parkingData]);

  const handleManger = useCallback(async () => {
    if (activePanel === 'manger') { setActivePanel(null); return; }
    setActivePanel('manger');
    if (mangerData !== null) return;
    setMangerData('loading');
    try { setMangerData(await fetchKidsRestaurants(lat, lng)); }
    catch { setMangerData([]); }
  }, [lat, lng, activePanel, mangerData]);

  function formatDistance(km) {
    if (!km && km !== 0) return null;
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }
  const dist = formatDistance(distanceKm);

  function renderAppelerBtn() {
    if (!isAnniversaire) return null;
    if (phone === null) return <ActionBtn emoji="📞" label="Appeler" loading={true} onClick={() => {}} />;
    if (phone) return <ActionBtn emoji="📞" label="Appeler" href={`tel:${phone.replace(/\s/g, '')}`} style={{ background: '#e8f5e9', border: '1.5px solid #22c55e' }} />;
    return <ActionBtn emoji="📞" label="Appeler" href={`https://www.google.com/maps/place/?q=place_id:${activity.place_id}`} />;
  }

  return (
    <>
      <article ref={cardRef} className="activity-card" onClick={() => onSelect?.(activity)}
        style={{ borderRadius: '16px', overflow: 'visible', background: '#FFF8F1', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative', marginBottom: '16px' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
      >
        <div style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
          <PhotoCarousel photoReferences={photoReferences} fallbackPhoto={fallbackPhoto} name={name} familyPhotos={familyPhotos} />

          {openStatus !== null && (
            <span style={{ position: 'absolute', top: '10px', right: '10px', background: openStatus ? 'rgba(34,197,94,0.92)' : 'rgba(239,68,68,0.88)', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.03em', backdropFilter: 'blur(4px)' }}>
              {openStatus ? '● Ouvert' : '● Fermé'}
            </span>
          )}

          <button onClick={toggleFav}
            style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            {isFav ? '❤️' : '🤍'}
          </button>

          {isAnniversaire && (
            <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,107,74,0.92)', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.03em', backdropFilter: 'blur(4px)' }}>
              🎂 Anniversaires
            </span>
          )}
        </div>

        <div style={{ padding: '14px 16px 12px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </h3>
          {address && (
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontFamily: 'Outfit, sans-serif', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              📍 {address}
            </p>
          )}

          {isAnniversaire && phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '0 0 8px', fontSize: '13px', color: '#22c55e', fontFamily: 'Outfit, sans-serif', fontWeight: 600, textDecoration: 'none' }}>
              📞 {phone}
            </a>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {rating && (
              <span style={{ fontSize: '12px', color: '#FF6B4A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }} title={`${ratingsTotal} avis`}>
                ★ {rating.toFixed(1)}
                <span style={{ color: '#aaa', fontWeight: 400, marginLeft: '3px' }}>({ratingsTotal > 999 ? '999+' : ratingsTotal})</span>
              </span>
            )}
            {dist && (
              <span style={{ fontSize: '11px', background: '#FFE8E1', color: '#FF6B4A', padding: '2px 8px', borderRadius: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {dist}
              </span>
            )}
          </div>

          <AiDescription name={name} catId={activity.catId} address={address} />

          <div style={{ position: 'relative' }}>
            {activePanel === 'parking' && <MiniList items={parkingData || []} type="parking" loading={parkingData === 'loading'} onClose={() => setActivePanel(null)} />}
            {activePanel === 'manger' && <MiniList items={mangerData || []} type="manger" loading={mangerData === 'loading'} onClose={() => setActivePanel(null)} />}

            <div style={{ display: 'flex', gap: '6px' }}>
              <ActionBtn emoji="🗺️" label="Itinéraire" href={getMapsUrl(activity)} />
              {renderAppelerBtn()}
              <ActionBtn emoji="🅿️" label="Parking" loading={parkingData === 'loading'} active={activePanel === 'parking'} onClick={handleParking} />
              {resto ? (
                <ActionBtn emoji="🍴" label="Réserver" href={getTheForkUrl(activity)} style={{ background: '#E8734A', border: '1.5px solid #E8734A' }} />
              ) : (
                <ActionBtn emoji="🍔" label="Manger" loading={mangerData === 'loading'} active={activePanel === 'manger'} onClick={handleManger} />
              )}
              <ActionBtn
                emoji={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>}
                label="Partager" onClick={() => shareActivity(activity)} />
              {paid && !resto && (
                <ActionBtn emoji="🎟️" label="Réserver" href={getFunbookerUrl(activity)} style={{ background: '#FF6B4A', border: '1.5px solid #FF6B4A' }} />
              )}
            </div>
          </div>

          {activity.place_id && (
            <ConseilsFamilles key={reviewKey} activity={activity} onOpenModal={() => setShowModal(true)} />
          )}
        </div>
      </article>

      {showModal && (
        <ReviewModal activity={activity} onClose={() => setShowModal(false)} onSuccess={() => setReviewKey(k => k + 1)} />
      )}
    </>
  );
}
