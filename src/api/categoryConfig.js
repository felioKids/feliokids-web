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
    // 🔧 Aquarium — type aquarium + mots-clés stricts, pas de tabac ni design
   'Aquarium': { source:'google', filters:[{type:'aquarium', keyword:'aquarium public visite'}] },
    'Trampoline':                   { source:'google', filters:[{keyword:'trampoline parc enfant'}] },
    'Laser game':                   { source:'google', filters:[{keyword:'laser game enfant'}] },
    'Musées interactifs':           { source:'google', filters:[{type:'museum', keyword:'musée interactif enfant'}] },
    'Piscines couvertes':           { source:'google', filters:[{type:'swimming_pool', keyword:'piscine couverte'}] },
    'Bibliothèques & médiathèques': { source:'google', filters:[{type:'library'}] },
    'Ateliers créatifs':            { source:'google', filters:[{keyword:'atelier créatif enfant'}] },
  },

  culture: {
    'Châteaux & histoire':  { source:'google', filters:[{keyword:'château histoire visite'}] },
    "Musées d'art":         { source:'google', filters:[{type:'art_gallery', keyword:'musée art'}] },
    // 🔧 Théâtre enfants — jeune public uniquement, pas adultes
    'Théâtre enfants':      { source:'google', filters:[{keyword:'théâtre jeune public spectacle enfant'}] },
    // 🔧 Planétarium — type museum + planétarium strict
    'Planétarium':          { source:'google', filters:[{type:'museum', keyword:'planétarium astronomie'}] },
    'Patrimoine UNESCO':    { source:'google', filters:[{keyword:'patrimoine UNESCO'}] },
    'Cirque':               { source:'google', filters:[{keyword:'cirque spectacle famille'}] },
  },

  nature: {
    'Forêts & randonnée':      { source:'google', filters:[{keyword:'forêt randonnée sentier'}] },
    'Lacs & baignade':         { source:'google', filters:[{keyword:'lac baignade base nautique'}] },
    'Plages':                  { source:'google', filters:[{keyword:'plage sable mer'}] },
    // 🔧 Zoos & parcs animaliers — type zoo strict, pas de parcs sans animaux
    'Zoos & parcs animaliers': { source:'google', filters:[{type:'zoo', keyword:'zoo parc animalier animaux'}] },
    'Fermes pédagogiques':     { source:'google', filters:[{keyword:'ferme pédagogique animaux enfant'}] },
    // 🔧 Cascades — type tourist_attraction + cascade strict, pas de voitures ni bistros
    'Cascades':                { source:'google', filters:[{type:'tourist_attraction', keyword:'cascade chute eau'}] },
    'Pêche en famille':        { source:'google', filters:[{keyword:'pêche lac rivière famille'}] },
    // 🔧 Barbecue légal — aire de pique-nique avec barbecue, pas restaurants BBQ
    'Barbecue légal':          { source:'google', filters:[{type:'park', keyword:'aire pique-nique barbecue parc'}] },
    'Cueillette':              { source:'google', filters:[{keyword:'cueillette fruits ferme'}] },
    'Camping & picnic':        { source:'google', filters:[{keyword:'camping aire pique-nique famille'}] },
    // 🔧 Observation oiseaux — réserve naturelle ornithologie, pas juste parcs
    'Observation oiseaux':     { source:'google', filters:[{keyword:'réserve naturelle ornithologie observation oiseaux'}] },
  },

  sport: {
    'Vélo & VTT':          { source:'google', filters:[{keyword:'vélo VTT location piste'}] },
    'Football & terrains': { source:'google', filters:[{keyword:'terrain football stade'}] },
    'Piscines':            { source:'google', filters:[{type:'swimming_pool', keyword:'piscine municipale'}] },
    'Ski & glisse':        { source:'google', filters:[{keyword:'ski station glisse luge'}] },
    'Tennis & padel':      { source:'google', filters:[{keyword:'tennis padel court club'}] },
    'Accrobranche':        { source:'google', filters:[{keyword:'accrobranche parc aventure'}] },
    'Skateparks':          { source:'google', filters:[{keyword:'skatepark roller bmx'}] },
    'Patinoire':           { source:'google', filters:[{keyword:'patinoire glace'}] },
    'Escalade':            { source:'google', filters:[{keyword:'escalade salle mur grimpe'}] },
    'Ping-pong':           { source:'google', filters:[{keyword:'ping pong tennis de table club'}] },
    'Sports nautiques':    { source:'google', filters:[{keyword:'sports nautiques kayak canoë voile'}] },
  },

  events: {
    'Festivals famille':      { source:'google', filters:[{keyword:'festival famille enfant'}] },
    'Fêtes & marchés':        { source:'google', filters:[{keyword:'marché artisanal fête locale'}] },
    'Brocante':               { source:'google', filters:[{keyword:'brocante vide grenier antiquités'}] },
    'Spectacles':             { source:'google', filters:[{keyword:'spectacle famille enfant salle'}] },
    'Expos temporaires':      { source:'google', filters:[{keyword:'exposition temporaire musée'}] },
    'Concerts gratuits':      { source:'google', filters:[{keyword:'concert gratuit plein air'}] },
    "Feux d'artifice":        { source:'google', filters:[{keyword:'feux artifice fête nationale'}] },
    'Événements saisonniers': { source:'google', filters:[{keyword:'événement saisonnier famille'}] },
    'Compétitions sportives': { source:'google', filters:[{keyword:'compétition sportive tournoi'}] },
  },

  // 🆕 RESTAURANTS FAMILLE
  resto: {
    'Pizzerias':          { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'pizzeria'}] },
    'Crêperies':          { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'crêperie'}] },
    'Burgers & grill':    { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'burger grill'}] },
    'Sushi & japonais':   { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'sushi japonais'}] },
    'Glaciers & glaces':  { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'glacier glaces'}] },
    'Cuisine locale':     { source:'google', textsearch:true, filters:[{type:'restaurant', keyword:'restaurant famille enfant'}] },
  },

  ateliers: {
    'Ateliers peinture':            { source:'google', filters:[{keyword:'atelier peinture enfant cours'}] },
    'Poterie enfants':              { source:'google', filters:[{keyword:'poterie céramique atelier enfant'}] },
    'Ateliers musique':             { source:'google', filters:[{keyword:'atelier musique éveil enfant'}] },
    'Bibliothèques & médiathèques': { source:'google', filters:[{type:'library'}] },
    'Ateliers science':             { source:'google', filters:[{keyword:'atelier science découverte enfant'}] },
    'Couture & DIY':                { source:'google', filters:[{keyword:'couture DIY atelier créatif'}] },
    'Théâtre enfants':              { source:'google', filters:[{keyword:'théâtre enfant cours atelier expression'}] },
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
