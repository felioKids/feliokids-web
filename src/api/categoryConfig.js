// src/api/categoryConfig.js
// Wszystkie kategorie przez Google Places — zero Overpass/OSM

export const CATEGORY_CONFIG = {

  // ── GRATUIT ──────────────────────────────────────────────────────────────────
  gratuit: {
   'Parcs & jardins':        { source:'google', filters:[] },
   'Aires de jeux':          { source:'google', filters:[{type:'playground'}] },
    'Forêts & balades':       { source:'google', filters:[] },
    'Plages & lacs':          { source:'google', filters:[] },
    'Musées gratuits':        { source:'google', filters:[] },
    'Événements gratuits':    { source:'google', filters:[] },
    'Pistes cyclables':       { source:'google', filters:[] },
    'Bibliothèques':          { source:'google', filters:[] },
    'Zoos gratuits':          { source:'google', filters:[] },
    "Fontaines & jets d'eau": { source:'google', filters:[] },
  },

  anniversaire: {
    'Bowling & laser game': { source:'google', filters:[] },
    'Accrobranche':         { source:'google', filters:[] },
    'Restaurants fête':     { source:'google', filters:[] },
    'Ateliers créatifs':    { source:'google', filters:[] },
    'Escape game':          { source:'google', filters:[] },
    'Cinéma privatisé':     { source:'google', filters:[] },
    'Karting enfants':      { source:'google', filters:[] },
    'Parcs aquatiques':     { source:'google', filters:[] },
  },

  pluie: {
    'Cinéma':                       { source:'google', filters:[] },
    'Bowling':                      { source:'google', filters:[] },
    'Aquarium':                     { source:'google', filters:[] },
    'Trampoline':                   { source:'google', filters:[] },
    'Laser game':                   { source:'google', filters:[] },
    'Musées interactifs':           { source:'google', filters:[] },
    'Piscines couvertes':           { source:'google', filters:[] },
    'Bibliothèques & médiathèques': { source:'google', filters:[] },
    'Cafés jeux':                   { source:'google', filters:[] },
    'Ateliers créatifs':            { source:'google', filters:[] },
  },

  culture: {
    'Châteaux & histoire':      { source:'google', filters:[] },
    "Musées d'art":             { source:'google', filters:[] },
    'Théâtre enfants':          { source:'google', filters:[] },
    'Planétarium':              { source:'google', filters:[] },
    'Sciences & découverte':    { source:'google', filters:[] },
    'Patrimoine UNESCO':        { source:'google', filters:[] },
    'Visites guidées famille':  { source:'google', filters:[] },
    'Cirque':                   { source:'google', filters:[] },
  },

  nature: {
    'Forêts & randonnée':       { source:'google', filters:[] },
 'Aires de jeux':            { source:'google', filters:[{type:'playground'}] },
    'Lacs & baignade':          { source:'google', filters:[] },
    'Plages':                   { source:'google', filters:[] },
    'Zoos & parcs animaliers':  { source:'google', filters:[] },
    'Fermes pédagogiques':      { source:'google', filters:[] },
    'Cascades':                 { source:'google', filters:[] },
    'Pêche en famille':         { source:'google', filters:[] },
    'Barbecue légal':           { source:'google', filters:[] },
    'Cueillette fruits':        { source:'google', filters:[] },
    'Camping & picnic':         { source:'google', filters:[] },
    'Observation oiseaux':      { source:'google', filters:[] },
  },

  sport: {
    'Vélo & VTT':           { source:'google', filters:[] },
    'Football & terrains':  { source:'google', filters:[] },
    'Piscines':             { source:'google', filters:[] },
    'Ski & glisse':         { source:'google', filters:[] },
    'Tennis & padel':       { source:'google', filters:[] },
    'Accrobranche':         { source:'google', filters:[] },
    'Skateparks':           { source:'google', filters:[] },
    'Patinoire':            { source:'google', filters:[] },
    'Escalade':             { source:'google', filters:[] },
    'Ping-pong':            { source:'google', filters:[] },
    'Sports nautiques':     { source:'google', filters:[] },
  },

  events: {
    'Festivals famille':        { source:'google', filters:[] },
    'Fêtes & marchés':          { source:'google', filters:[] },
    'Brocante':                 { source:'google', filters:[] },
    'Spectacles':               { source:'google', filters:[] },
    'Expos temporaires':        { source:'google', filters:[] },
    'Concerts gratuits':        { source:'google', filters:[] },
    "Feux d'artifice":          { source:'google', filters:[] },
    'Événements saisonniers':   { source:'google', filters:[] },
    'Compétitions sportives':   { source:'google', filters:[] },
  },

  halte: {
    'Sport avec garderie':    { source:'google', filters:[] },
    'IKEA Småland':           { source:'google', filters:[] },
    'Centres de loisirs':     { source:'google', filters:[] },
    'Ateliers sans parents':  { source:'google', filters:[] },
    'Espaces kids galeries':  { source:'google', filters:[] },
    'Piscines avec garderie': { source:'google', filters:[] },
    'Associations locales':   { source:'google', filters:[] },
  },

  ateliers: {
    'Ateliers peinture':            { source:'google', filters:[] },
    'Poterie enfants':              { source:'google', filters:[] },
    'Cuisine créative':             { source:'google', filters:[] },
    'Ateliers musique':             { source:'google', filters:[] },
    'Bibliothèques & médiathèques': { source:'google', filters:[] },
    'Ateliers science':             { source:'google', filters:[] },
    'Couture & DIY':                { source:'google', filters:[] },
    'Théâtre enfants':              { source:'google', filters:[] },
    'Ateliers numériques':          { source:'google', filters:[] },
  },
}

export function getSubConfig(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName] ?? null
}

export function getFiltersForSub(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName]?.filters ?? []
}

export function getSourceForSub(catId, subName) {
  return CATEGORY_CONFIG[catId]?.[subName]?.source ?? 'google'
}
