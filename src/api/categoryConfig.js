// src/api/categoryConfig.js

export const CATEGORY_CONFIG = {

  // ── GRATUIT ──────────────────────────────────────────────────────────────────
  gratuit: {
    'Parcs & jardins':        { source:'google', filters:[{type:'park'}] },
    'Forêts & balades':       { source:'google', filters:[{keyword:'forêt randonnée'}] },
    'Plages & lacs':          { source:'google', filters:[{keyword:'plage lac baignade'}] },
    'Musées gratuits':        { source:'google', filters:[{type:'museum', keyword:'musée gratuit'}] },
    'Pistes cyclables':       { source:'google', filters:[{keyword:'piste cyclable vélo'}] },
    'Bibliothèques':          { source:'google', filters:[{type:'library'}] },
    "Fontaines & jets d'eau": { source:'google', filters:[{keyword:'fontaine jet eau'}] },
  },

  // ── ANNIVERSAIRE ─────────────────────────────────────────────────────────────
  // Każda podkategoria ma precyzyjne słowa kluczowe
  // + requirePhone: true → ActivityCard pobierze telefon i pokaże przycisk Appeler
  anniversaire: {
    'Bowling & laser game': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'bowling anniversaire enfant' },
        { keyword: 'laser game enfant' },
        { keyword: 'laser quest' },
      ],
    },
    'Accrobranche': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'accrobranche anniversaire enfant' },
        { keyword: 'parc aventure accrobranche' },
      ],
    },
    'Ateliers créatifs': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'atelier anniversaire enfant créatif' },
        { keyword: 'atelier peinture anniversaire enfant' },
        { keyword: 'salle fête enfant atelier' },
      ],
    },
    'Escape game': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'escape game enfant' },
        { keyword: 'escape room famille enfant' },
      ],
    },
    'Karting enfants': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'karting enfant anniversaire' },
        { keyword: 'karting indoor enfant' },
      ],
    },
    'Trampoline': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'parc trampoline anniversaire enfant' },
        { keyword: 'trampoline park enfant' },
        { keyword: 'saut trampoline enfant' },
      ],
    },
    'Piscine privée': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'piscine anniversaire enfant' },
        { keyword: 'parc aquatique anniversaire enfant' },
      ],
    },
    'Salle de fête': {
      source: 'google',
      requirePhone: true,
      filters: [
        { keyword: 'salle anniversaire enfant location' },
        { keyword: 'salle fête enfant' },
        { keyword: 'espace anniversaire enfant' },
      ],
    },
  },

  pluie: {
    'Cinéma':                       { source:'google', filters:[{type:'movie_theater'}] },
    'Bowling':                      { source:'google', filters:[{keyword:'bowling'}] },
    'Aquarium':                     { source:'google', filters:[{keyword:'aquarium'}] },
    'Trampoline':                   { source:'google', filters:[{keyword:'trampoline parc'}] },
    'Laser game':                   { source:'google', filters:[{keyword:'laser game'}] },
    'Musées interactifs':           { source:'google', filters:[{type:'museum', keyword:'musée interactif enfant'}] },
    'Piscines couvertes':           { source:'google', filters:[{keyword:'piscine couverte'}] },
    'Bibliothèques & médiathèques': { source:'google', filters:[{type:'library'}] },
    'Ateliers créatifs':            { source:'google', filters:[{keyword:'atelier créatif enfant'}] },
  },

  culture: {
    'Châteaux & histoire':  { source:'google', filters:[{keyword:'château histoire'}] },
    "Musées d'art":         { source:'google', filters:[{type:'art_gallery', keyword:'musée art'}] },
    'Théâtre enfants':      { source:'google', filters:[{keyword:'théâtre enfant jeune public'}] },
    'Planétarium':          { source:'google', filters:[{keyword:'planétarium'}] },
    'Patrimoine UNESCO':    { source:'google', filters:[{keyword:'patrimoine UNESCO'}] },
    'Cirque':               { source:'google', filters:[{keyword:'cirque spectacle'}] },
  },

  nature: {
    'Forêts & randonnée':      { source:'google', filters:[{keyword:'forêt randonnée'}] },
    'Lacs & baignade':         { source:'google', filters:[{keyword:'lac baignade'}] },
    'Plages':                  { source:'google', filters:[{keyword:'plage'}] },
    'Zoos & parcs animaliers': { source:'google', filters:[{keyword:'zoo parc animalier'}] },
    'Fermes pédagogiques':     { source:'google', filters:[{keyword:'ferme pédagogique'}] },
    'Cascades':                { source:'google', filters:[{keyword:'cascade'}] },
    'Pêche en famille':        { source:'google', filters:[{keyword:'pêche famille'}] },
    'Barbecue légal':          { source:'google', filters:[{keyword:'barbecue parc'}] },
    'Cueillette':              { source:'google', filters:[{keyword:'cueillette'}] },
    'Camping & picnic':        { source:'google', filters:[{keyword:'camping picnic'}] },
    'Observation oiseaux':     { source:'google', filters:[{keyword:'observation oiseaux nature'}] },
  },

  sport: {
    'Vélo & VTT':          { source:'google', filters:[{keyword:'vélo VTT location'}] },
    'Football & terrains': { source:'google', filters:[{keyword:'terrain football'}] },
    'Piscines':            { source:'google', filters:[{type:'swimming_pool', keyword:'piscine'}] },
    'Ski & glisse':        { source:'google', filters:[{keyword:'ski station glisse'}] },
    'Tennis & padel':      { source:'google', filters:[{keyword:'tennis padel court'}] },
    'Accrobranche':        { source:'google', filters:[{keyword:'accrobranche'}] },
    'Skateparks':          { source:'google', filters:[{keyword:'skatepark'}] },
    'Patinoire':           { source:'google', filters:[{keyword:'patinoire'}] },
    'Escalade':            { source:'google', filters:[{keyword:'escalade mur'}] },
    'Ping-pong':           { source:'google', filters:[{keyword:'ping pong tennis de table'}] },
    'Sports nautiques':    { source:'google', filters:[{keyword:'sports nautiques kayak'}] },
  },

  events: {
    'Festivals famille':      { source:'google', filters:[{keyword:'festival famille'}] },
    'Fêtes & marchés':        { source:'google', filters:[{keyword:'marché fête'}] },
    'Brocante':               { source:'google', filters:[{keyword:'brocante vide grenier'}] },
    'Spectacles':             { source:'google', filters:[{keyword:'spectacle famille'}] },
    'Expos temporaires':      { source:'google', filters:[{keyword:'exposition temporaire'}] },
    'Concerts gratuits':      { source:'google', filters:[{keyword:'concert gratuit'}] },
    "Feux d'artifice":        { source:'google', filters:[{keyword:'feux artifice'}] },
    'Événements saisonniers': { source:'google', filters:[{keyword:'événement saisonnier'}] },
    'Compétitions sportives': { source:'google', filters:[{keyword:'compétition sportive'}] },
  },

  // 🆕 RESTAURANTS FAMILLE
  resto: {
    'Pizzerias':          { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'pizzeria'}] },
    'Crêperies':          { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'crêperie'}] },
    'Burgers & grill':    { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'burger grill'}] },
    'Sushi & japonais':   { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'sushi'}] },
    'Glaciers & glaces':  { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'glacier glaces'}] },
    'Cuisine locale':     { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'restaurant famille'}] },
  },

  ateliers: {
    'Ateliers peinture':            { source:'google', filters:[{keyword:'atelier peinture enfant'}] },
    'Poterie enfants':              { source:'google', filters:[{keyword:'poterie céramique enfant'}] },
    'Ateliers musique':             { source:'google', filters:[{keyword:'atelier musique enfant'}] },
    'Bibliothèques & médiathèques': { source:'google', filters:[{type:'library'}] },
    'Ateliers science':             { source:'google', filters:[{keyword:'atelier science enfant'}] },
    'Couture & DIY':                { source:'google', filters:[{keyword:'couture DIY atelier'}] },
    'Théâtre enfants':              { source:'google', filters:[{keyword:'théâtre enfant cours'}] },
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
