// src/api/categoryConfig.js

export const CATEGORY_CONFIG = {

  // ── GRATUIT ──────────────────────────────────────────────────────────────────
  gratuit: {
    'Parcs & jardins':      { source:'osm', filters:[{ key:'leisure', value:'park' },{ key:'leisure', value:'garden' }] },
    'Forêts & balades':     { source:'osm', filters:[{ key:'landuse', value:'forest' },{ key:'natural', value:'wood' }] },
    'Plages & lacs':        { source:'osm', filters:[{ key:'natural', value:'beach' },{ key:'leisure', value:'bathing_place' }] },
    'Musées gratuits':      { source:'google', filters:[] },
    'Événements gratuits':  { source:'osm', filters:[{ key:'amenity', value:'events_venue' }] },
    'Pistes cyclables':     { source:'osm', filters:[{ key:'highway', value:'cycleway' }] },
    'Bibliothèques':        { source:'osm', filters:[{ key:'amenity', value:'library' }] },
    'Zoos gratuits':        { source:'google', filters:[] },
    "Fontaines & jets d'eau":{ source:'osm', filters:[{ key:'amenity', value:'fountain' }] },
  },

  // ── ANNIVERSAIRES ────────────────────────────────────────────────────────────
  anniversaire: {
    'Bowling & laser game': { source:'google', filters:[] },
    'Accrobranche':         { source:'google', filters:[] },
    'Restaurants fête':     { source:'google', filters:[] },
    'Ateliers créatifs':    { source:'osm', filters:[{ key:'amenity', value:'community_centre' }] },
    'Escape game':          { source:'google', filters:[] },
    'Cinéma privatisé':     { source:'google', filters:[] },
    'Karting enfants':      { source:'google', filters:[] },
    'Parcs aquatiques':     { source:'google', filters:[] },
  },

  // ── PLUIE & INTÉRIEUR ────────────────────────────────────────────────────────
  pluie: {
    'Cinéma':                       { source:'google', filters:[] },
    'Bowling':                       { source:'google', filters:[] },
    'Aquarium':                      { source:'google', filters:[] },
    'Trampoline':                    { source:'google', filters:[] },
    'Laser game':                    { source:'google', filters:[] },
    'Musées interactifs':            { source:'google', filters:[] },
    'Piscines couvertes':            { source:'google', filters:[] },
    'Bibliothèques & médiathèques': { source:'osm',    filters:[{ key:'amenity', value:'library' }] },
    'Cafés jeux':                   { source:'google', filters:[] },
    'Ateliers créatifs':            { source:'osm',    filters:[{ key:'amenity', value:'community_centre' }] },
  },

  // ── CULTURE & DÉCOUVERTE ─────────────────────────────────────────────────────
  culture: {
    'Châteaux & histoire':      { source:'osm',    filters:[{ key:'historic', value:'castle' },{ key:'historic', value:'ruins' }] },
    "Musées d'art":             { source:'google', filters:[] },
    'Théâtre enfants':          { source:'google', filters:[] },
    'Planétarium':              { source:'google', filters:[] },
    'Sciences & découverte':    { source:'google', filters:[] },
    'Patrimoine UNESCO':        { source:'osm',    filters:[{ key:'heritage', value:'world_heritage' }] },
    'Visites guidées famille':  { source:'osm',    filters:[{ key:'tourism', value:'attraction' }] },
    'Cirque':                   { source:'google', filters:[] },
  },

  // ── NATURE & ANIMAUX ─────────────────────────────────────────────────────────
  nature: {
    'Forêts & randonnée':       { source:'osm', filters:[{ key:'landuse', value:'forest' },{ key:'natural', value:'wood' }] },
    'Lacs & baignade':          { source:'osm', filters:[{ key:'natural', value:'water' },{ key:'leisure', value:'bathing_place' }] },
    'Plages':                   { source:'osm', filters:[{ key:'natural', value:'beach' }] },
    'Zoos & parcs animaliers':  { source:'google', filters:[] },
    'Fermes pédagogiques':      { source:'google', filters:[] },
    'Cascades':                 { source:'osm', filters:[{ key:'waterway', value:'waterfall' }] },
    'Pêche en famille':         { source:'osm', filters:[{ key:'leisure', value:'fishing' }] },
    'Barbecue légal':           { source:'osm', filters:[{ key:'amenity', value:'bbq' }] },
    'Cueillette fruits':        { source:'osm', filters:[{ key:'landuse', value:'orchard' }] },
    'Camping & picnic':         { source:'osm', filters:[{ key:'tourism', value:'camp_site' },{ key:'leisure', value:'picnic_table' }] },
    'Observation oiseaux':      { source:'osm', filters:[{ key:'leisure', value:'bird_hide' }] },
  },

  // ── SPORT & ACTIVITÉS ────────────────────────────────────────────────────────
  sport: {
    'Vélo & VTT':           { source:'osm',    filters:[{ key:'route', value:'bicycle' },{ key:'highway', value:'cycleway' }] },
    'Football & terrains':  { source:'osm',    filters:[{ key:'leisure', value:'pitch' },{ key:'sport', value:'football' }] },
    'Piscines':             { source:'google', filters:[] },
    'Ski & glisse':         { source:'google', filters:[] },
    'Tennis & padel':       { source:'google', filters:[] },
    'Accrobranche':         { source:'google', filters:[] },
    'Skateparks':           { source:'osm',    filters:[{ key:'leisure', value:'skate_park' }] },
    'Patinoire':            { source:'google', filters:[] },
    'Escalade':             { source:'google', filters:[] },
    'Ping-pong':            { source:'osm',    filters:[{ key:'sport', value:'table_tennis' }] },
    'Sports nautiques':     { source:'google', filters:[] },
  },

  // ── WEEKEND & ÉVÉNEMENTS ─────────────────────────────────────────────────────
  events: {
    'Festivals famille':        { source:'osm',    filters:[{ key:'amenity', value:'events_venue' }] },
    'Fêtes & marchés':          { source:'osm',    filters:[{ key:'amenity', value:'marketplace' }] },
    'Brocante':                 { source:'osm',    filters:[{ key:'amenity', value:'marketplace' }] },
    'Spectacles':               { source:'google', filters:[] },
    'Expos temporaires':        { source:'google', filters:[] },
    'Concerts gratuits':        { source:'google', filters:[] },
    "Feux d'artifice":          { source:'osm',    filters:[{ key:'leisure', value:'park' }] },
    'Événements saisonniers':   { source:'osm',    filters:[{ key:'amenity', value:'events_venue' }] },
    'Compétitions sportives':   { source:'google', filters:[] },
  },

  // ── HALTE GARDERIE ───────────────────────────────────────────────────────────
  halte: {
    'Sport avec garderie':              { source:'google', filters:[] },
    'IKEA Småland':                     { source:'google', filters:[] },
    'Centres de loisirs':               { source:'google', filters:[] },
    'Ateliers sans parents':            { source:'osm',    filters:[{ key:'amenity', value:'community_centre' }] },
    'Espaces kids galeries':            { source:'google', filters:[] },
    'Piscines avec garderie':           { source:'google', filters:[] },
    'Associations locales':             { source:'osm',    filters:[{ key:'amenity', value:'social_centre' }] },
  },

  // ── ATELIERS CRÉATIFS ─────────────────────────────────────────────────────────
  ateliers: {
    'Ateliers peinture':        { source:'google', filters:[] },
    'Poterie enfants':          { source:'google', filters:[] },
    'Cuisine créative':         { source:'google', filters:[] },
    'Ateliers musique':         { source:'google', filters:[] },
    'Bibliothèques & médiathèques': { source:'osm', filters:[{ key:'amenity', value:'library' }] },
    'Ateliers science':         { source:'google', filters:[] },
    'Couture & DIY':            { source:'osm',    filters:[{ key:'shop', value:'craft' }] },
    'Théâtre enfants':          { source:'google', filters:[] },
    'Ateliers numériques':      { source:'google', filters:[] },
  },
}

export function getSubConfig(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName] ?? null
}

export function getFiltersForSub(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName]?.filters ?? []
}

export function getSourceForSub(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName]?.source ?? 'osm'
}
