/* =========================================================
   Mes Objectifs du Mois
   Toutes les données sont gardées dans le navigateur (localStorage).
   ========================================================= */
(() => {
  'use strict';

  const KEY = 'mes-objectifs-v1';

  // Synchro entre appareils : les données sont gardées dans un gist secret du compte GitHub
  const SYNC_KEY = 'mes-objectifs-sync';           // clé + infos de synchro (jamais exportées)
  const GIST_FILE = 'mes-objectifs.json';
  const GIST_DESC = 'Mes Objectifs du Mois : données (ne pas supprimer)';
  const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Mes%20Objectifs%20synchro';

  const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
    'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.',
    'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  // Les 114 sourates, dans l'ordre du Coran
  const SOURATES = [
    'Al-Fatiha', 'Al-Baqara', 'Al-Imran', 'An-Nisa', "Al-Ma'ida", "Al-An'am", "Al-A'raf",
    'Al-Anfal', 'At-Tawba', 'Yunus', 'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr',
    'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha', 'Al-Anbiya', 'Al-Hajj',
    "Al-Mu'minun", 'An-Nur', 'Al-Furqan', "Ash-Shu'ara", 'An-Naml', 'Al-Qasas',
    'Al-Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajda', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin',
    'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf',
    'Ad-Dukhan', 'Al-Jathiya', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
    'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', "Al-Waqi'a", 'Al-Hadid',
    'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahana', 'As-Saff', "Al-Jumu'a", 'Al-Munafiqun',
    'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqa', "Al-Ma'arij",
    'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddathir', 'Al-Qiyama', 'Al-Insan', 'Al-Mursalat',
    'An-Naba', "An-Nazi'at", 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin',
    'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', "Al-A'la", 'Al-Ghashiya', 'Al-Fajr', 'Al-Balad',
    'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr',
    'Al-Bayyina', 'Az-Zalzala', 'Al-Adiyat', "Al-Qari'a", 'At-Takathur', 'Al-Asr',
    'Al-Humaza', 'Al-Fil', 'Quraysh', "Al-Ma'un", 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
    'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
  ];

  // Catégories de dépenses (la couleur suit toujours la catégorie : --cat-1 … --cat-7, gris pour « Autre »)
  const CATS = [
    { id: 'food', name: 'Bouffe', slot: 1 },
    { id: 'out', name: 'Sorties', slot: 2 },
    { id: 'transport', name: 'Transport', slot: 3 },
    { id: 'shop', name: 'Shopping', slot: 4 },
    { id: 'fun', name: 'Jeux / loisirs', slot: 5 },
    { id: 'health', name: 'Santé / sport', slot: 6 },
    { id: 'subs', name: 'Abonnements', slot: 7 },
    { id: 'other', name: 'Autre', slot: 0 }
  ];
  const catOf = id => CATS.find(c => c.id === id) || CATS[CATS.length - 1];
  const catColor = id => `var(--cat-${catOf(id).slot})`;

  // Rangs (style RPG) et points d'XP
  const RANKS = [
    { lvl: 0, name: 'Débutant', jp: '初心者' },
    { lvl: 3, name: 'Apprenti', jp: '見習い' },
    { lvl: 6, name: 'Combattant', jp: '戦士' },
    { lvl: 10, name: 'Samouraï', jp: '侍' },
    { lvl: 15, name: 'Maître', jp: '師範' },
    { lvl: 22, name: 'Légende', jp: '伝説' }
  ];
  const XP = {
    session: 15,      // séance de salle
    surah: 40,        // sourate apprise
    episode: 3,       // épisode vu
    animeGoal: 20,    // objectif d'épisodes du mois atteint
    animeDone: 50,    // anime terminé
    todo: 10,         // autre objectif coché
    lift: 25,         // objectif de perf atteint
    saveGoal: 30,     // objectif d'épargne du mois atteint
    per10eur: 1,      // 1 XP par tranche de 10 € mis de côté
    perfect: 100,     // mois validé à 100 %
    habit: 5,         // habitude faite un jour
    review: 5,        // sourate révisée
    chapter: 1,       // chapitre de manga lu
    mangaGoal: 20,    // objectif de chapitres du mois atteint
    mangaDone: 50,    // manga terminé
    quest: 40,        // quête de la semaine réussie
    skillTier: 30,    // figure de callisthénie réussie : 30 XP × son niveau (30 à 150)
    workout: 20,      // séance type terminée
    per10pages: 1,    // 1 XP par tranche de 10 pages lues
    bookDone: 50,     // livre fini
    per10min: 1,      // 1 XP par tranche de 10 min de révision
    mood: 2,          // humeur notée
    sleep: 2          // nuit notée
  };

  // Réglages propres à cet appareil (jamais synchronisés)
  const LOCK_KEY = 'mes-objectifs-code';        // empreinte du code secret
  const TIMER_KEY = 'mes-objectifs-minuteur';   // minuteur en cours
  const SESSION_KEY = 'mes-objectifs-seance';   // séance type en cours
  const PREFS_KEY = 'mes-objectifs-reglages';   // repos par défaut, etc.

  const PALETTES = [
    { id: 'classique', name: 'Classique', colors: ['#f3ede1', '#17130e', '#e0352b'] },
    { id: 'sakura', name: 'Sakura', colors: ['#fbeef1', '#2b1a20', '#e64980'] },
    { id: 'shonen', name: 'Shōnen', colors: ['#fff3dc', '#1a1208', '#ff4b1f'] },
    { id: 'seinen', name: 'Seinen', colors: ['#ecebe8', '#111111', '#5c5c5c'] },
    { id: 'ocean', name: 'Océan', colors: ['#e9f3f4', '#0d1b24', '#1c7ed6'] }
  ];

  const MOODS = [
    { v: 1, face: '(╥﹏╥)', name: 'Très mal' },
    { v: 2, face: '(︶︹︺)', name: 'Pas top' },
    { v: 3, face: '(・_・)', name: 'Bof' },
    { v: 4, face: '(^‿^)', name: 'Bien' },
    { v: 5, face: '(≧▽≦)', name: 'Super' }
  ];

  // Séances proposées (on peut les modifier ensuite)
  const WORKOUT_TEMPLATES = [
    { name: 'Push (pecs, épaules, triceps)', ex: [['Pompes', 4, '12'], ['Dips', 3, '10'], ['Développé militaire', 3, '10'], ['Pompes diamant', 3, '10']] },
    { name: 'Pull (dos, biceps)', ex: [['Tractions', 4, '6'], ['Rowing', 3, '10'], ['Tractions australiennes', 3, '12'], ['Curl biceps', 3, '12']] },
    { name: 'Jambes', ex: [['Squats', 4, '15'], ['Fentes', 3, '12'], ['Pistol squat assisté', 3, '6'], ['Mollets', 4, '20']] },
    { name: 'Full body callisthénie', ex: [['Tractions', 3, '5'], ['Dips', 3, '8'], ['Pompes', 3, '12'], ['Squats', 3, '15'], ['L-sit', 3, '10 s']] }
  ];
  const CALI = window.CALI || { TIERS: [], SKILLS: [], svg: () => '' };

  // Animes et mangas partagent le même affichage
  const KINDS = {
    anime: { list: 'animes', unit: 'ÉP.', one: 'épisode', many: 'épisodes', short: 'ép.', body: '#animeBody', alType: 'ANIME', count: 'episodes', step: 12 },
    manga: { list: 'mangas', unit: 'CH.', one: 'chapitre', many: 'chapitres', short: 'ch.', body: '#mangaBody', alType: 'MANGA', count: 'chapters', step: 20 }
  };

  // Habitudes proposées quand la liste est vide
  const HABIT_IDEAS = [
    { name: 'Prières', target: 5 },
    { name: "Boire 1,5 L d'eau", target: 1 },
    { name: 'Dormir avant minuit', target: 1 },
    { name: 'Lire 10 min', target: 1 },
    { name: 'Marcher 30 min', target: 1 }
  ];
  const QUEST_KEY = 'mes-objectifs-quetes';    // quêtes déjà fêtées sur cet appareil
  const BADGE_KEY = 'mes-objectifs-succes';    // succès déjà fêtés sur cet appareil
  const LEVEL_KEY = 'mes-objectifs-niveau';   // dernier niveau vu sur cet appareil (pour l'animation)
  const levelNeed = l => 50 * l * (l + 1);    // XP total pour atteindre le niveau l
  const levelOf = xp => { let l = 0; while (levelNeed(l + 1) <= xp) l++; return l; };
  const rankOf = l => RANKS.filter(r => r.lvl <= l).pop();

  // Infos d'animes (affiches, épisodes, dates de sortie) : API publique AniList
  const ANILIST = 'https://graphql.anilist.co';
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  /* ---------- Petits outils ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const avg = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const num = (v, fallback = 0) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const round2 = n => Math.round(n * 100) / 100;
  const eur = n => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: Number.isInteger(round2(n)) ? 0 : 2, maximumFractionDigits: 2
  }).format(round2(n));

  const keyOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const partsOf = k => { const [y, m] = k.split('-').map(Number); return { y, m }; };
  const shiftKey = (k, delta) => { const { y, m } = partsOf(k); return keyOf(new Date(y, m - 1 + delta, 1)); };
  const labelOf = k => { const { y, m } = partsOf(k); return `${MOIS[m - 1].toLowerCase()} ${y}`; };

  /* ---------- État ---------- */
  let state = load();
  let sync = loadSync();
  let current = keyOf(new Date());
  let quranSearch = '';
  let moneyType = 'save';    // 'save' = mis de côté, 'spend' = dépense
  let lastCat = 'food';      // dernière catégorie de dépense choisie
  let lastGlobal = null;
  const fresh = new Set();   // éléments qui viennent d'être validés (pour l'animation du tampon)
  const added = new Set();   // éléments qui viennent d'être ajoutés
  const barMemo = {};        // largeur précédente des barres (pour les animer)

  function emptyMonth() {
    return {
      animes: [], quranGoal: 0, gym: { goal: 12, days: [], lifts: [] }, todos: [], notes: '',
      money: { saveGoal: 0, budget: 0, entries: [] }, mangas: [], habits: {}
    };
  }

  function fixMonth(m) {
    m = (m && typeof m === 'object') ? m : emptyMonth();
    m.animes = Array.isArray(m.animes) ? m.animes : [];
    m.quranGoal = num(m.quranGoal, 0);
    m.gym = (m.gym && typeof m.gym === 'object') ? m.gym : {};
    m.gym.goal = num(m.gym.goal, 12);
    m.gym.days = Array.isArray(m.gym.days) ? m.gym.days : [];
    m.gym.lifts = Array.isArray(m.gym.lifts) ? m.gym.lifts : [];
    m.todos = Array.isArray(m.todos) ? m.todos : [];
    m.notes = typeof m.notes === 'string' ? m.notes : '';
    m.money = (m.money && typeof m.money === 'object') ? m.money : {};
    m.money.saveGoal = num(m.money.saveGoal, 0);
    m.money.budget = num(m.money.budget, 0);
    m.money.entries = Array.isArray(m.money.entries)
      ? m.money.entries.filter(e => e && typeof e === 'object' && num(e.amount, 0) > 0) : [];
    m.money.entries.forEach(e => { if (e.type === 'spend' && !e.cat) e.cat = 'other'; });
    if (!Array.isArray(m.money.subsDone)) delete m.money.subsDone;
    m.mangas = Array.isArray(m.mangas) ? m.mangas : [];
    m.habits = (m.habits && typeof m.habits === 'object' && !Array.isArray(m.habits)) ? m.habits : {};
    return m;
  }

  function normalize(s) {
    s = (s && typeof s === 'object') ? s : {};
    s.months = (s.months && typeof s.months === 'object') ? s.months : {};
    Object.keys(s.months).forEach(k => { s.months[k] = fixMonth(s.months[k]); });
    s.quran = (s.quran && typeof s.quran === 'object') ? s.quran : {};
    s.quran.learned = (s.quran.learned && typeof s.quran.learned === 'object') ? s.quran.learned : {};
    s.quran.order = s.quran.order === 'asc' ? 'asc' : 'desc';
    s.quran.filter = ['all', 'todo', 'done'].includes(s.quran.filter) ? s.quran.filter : 'all';
    s.jars = Array.isArray(s.jars) ? s.jars.filter(j => j && typeof j === 'object') : [];
    s.subs = Array.isArray(s.subs) ? s.subs.filter(x => x && typeof x === 'object') : [];
    s.watchlist = Array.isArray(s.watchlist) ? s.watchlist.filter(x => x && typeof x === 'object') : [];
    s.activity = (s.activity && typeof s.activity === 'object') ? s.activity : {};
    s.habits = Array.isArray(s.habits) ? s.habits.filter(h => h && typeof h === 'object') : [];
    s.daily = (s.daily && typeof s.daily === 'object') ? s.daily : {};   // épisodes, chapitres, objectifs du jour
    s.quran.reviews = (s.quran.reviews && typeof s.quran.reviews === 'object') ? s.quran.reviews : {};   // date → sourates révisées
    s.quran.learnedOn = (s.quran.learnedOn && typeof s.quran.learnedOn === 'object') ? s.quran.learnedOn : {};
    s.questWeeks = (s.questWeeks && typeof s.questWeeks === 'object') ? s.questWeeks : {};   // quêtes tirées pour chaque semaine
    s.cali = (s.cali && typeof s.cali === 'object') ? s.cali : {};   // figure → { s: 'work' | 'done', rec, at }
    const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
    const arr = v => Array.isArray(v) ? v.filter(x => x && typeof x === 'object') : [];
    s.weights = obj(s.weights);         // date → poids (kg)
    s.liftLog = obj(s.liftLog);         // exercice → { date → valeur }
    s.workouts = arr(s.workouts);       // séances types
    s.workoutLog = arr(s.workoutLog);   // { date, wid, name }
    s.mood = obj(s.mood);               // date → 1..5
    s.sleep = obj(s.sleep);             // date du réveil → { bed, wake }
    s.books = arr(s.books);
    s.study = obj(s.study);             // date → minutes de révision
    s.countdowns = arr(s.countdowns);
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* données illisibles : on repart de zéro */ }
    return normalize({});
  }

  // Les données à enregistrer (sans les mois juste visités mais restés vides)
  function serializable() {
    const blank = JSON.stringify(emptyMonth());
    const months = {};
    Object.keys(state.months).forEach(k => {
      if (JSON.stringify(state.months[k]) !== blank) months[k] = state.months[k];
    });
    return { ...state, months };
  }

  function persistLocal() {
    localStorage.setItem(KEY, JSON.stringify(serializable()));
  }

  // À appeler après chaque modification : enregistre ici et prévient la synchro
  function save() {
    state.updatedAt = Math.max(Date.now(), num(sync.remoteAt, 0) + 1);
    try {
      persistLocal();
      const tag = $('#savedTag');
      if (tag) { tag.classList.remove('flash'); void tag.offsetWidth; tag.classList.add('flash'); }
    } catch (e) { toast("Oups, impossible d'enregistrer dans le navigateur."); }
    scheduleSync();
  }

  const snapshot = () => JSON.stringify(state);

  function M() {
    if (!state.months[current]) state.months[current] = emptyMonth();
    return state.months[current];
  }

  function isEmpty(m) {
    return !m || (!m.animes.length && !m.mangas.length && !m.todos.length && !m.gym.lifts.length &&
      !m.gym.days.length && !m.quranGoal && !m.notes.trim() &&
      !m.money.entries.length && !m.money.saveGoal && !m.money.budget);
  }

  /* ---------- Calculs de progression ---------- */
  function animePct(a) {
    const span = a.goal - a.start;
    if (span <= 0) return a.ep >= a.goal ? 1 : 0;
    return clamp01((a.ep - a.start) / span);
  }

  function liftPct(l) {
    const span = l.target - l.start;
    if (span === 0) return l.cur === l.target ? 1 : 0;
    return clamp01((l.cur - l.start) / span);
  }

  const learnedIn = k => Object.values(state.quran.learned).filter(v => v === k).length;
  const learnedTotal = () => Object.keys(state.quran.learned).length;

  // Argent
  const moneySum = (mo, type) => round2(mo.entries.reduce((s, e) => e.type === type ? s + e.amount : s, 0));
  const allEntries = () => Object.values(state.months).flatMap(mo => mo.money.entries);
  const totalSaved = () => round2(allEntries().reduce((s, e) => e.type === 'save' ? s + e.amount : s, 0));
  const jarSaved = id => round2(allEntries().reduce((s, e) => e.type === 'save' && e.jar === id ? s + e.amount : s, 0));
  const jarPct = id => {
    const j = state.jars.find(x => x.id === id);
    return j && j.target > 0 ? clamp01(jarSaved(id) / j.target) : 0;
  };

  // Habitudes : nombre de fois coché un jour donné, et si c'est complet
  const habitCount = (m, id, d) => (m && m.habits[id] && m.habits[id][d]) || 0;
  const habitDone = (m, h, d) => habitCount(m, h.id, d) >= (h.target || 1);
  function elapsedDays(k) {
    const nowKey = keyOf(new Date());
    if (k > nowKey) return 0;
    if (k < nowKey) { const { y, m } = partsOf(k); return new Date(y, m, 0).getDate(); }
    return new Date().getDate();
  }
  function habitsPct(m, k) {
    const days = elapsedDays(k);
    if (!state.habits.length || !days) return null;
    let done = 0;
    state.habits.forEach(h => { for (let d = 1; d <= days; d++) if (habitDone(m, h, d)) done++; });
    return done / (state.habits.length * days);
  }

  function sections(m, k = current) {
    const out = {};
    if (m.animes.length) out.anime = avg(m.animes.map(animePct));
    if (m.mangas.length) out.manga = avg(m.mangas.map(animePct));
    const hp = habitsPct(m, k);
    if (hp !== null) out.habits = hp;
    if (m.quranGoal > 0) out.quran = clamp01(learnedIn(k) / m.quranGoal);
    const g = [];
    if (m.gym.goal > 0) g.push(clamp01(m.gym.days.length / m.gym.goal));
    m.gym.lifts.forEach(l => g.push(liftPct(l)));
    if (g.length) out.gym = avg(g);
    if (m.todos.length) out.todos = m.todos.filter(t => t.done).length / m.todos.length;
    if (m.money.saveGoal > 0) out.money = clamp01(moneySum(m.money, 'save') / m.money.saveGoal);
    return out;
  }

  const monthPct = (m, k) => {
    const v = Object.values(sections(m, k));
    return v.length ? Math.round(avg(v) * 100) : 0;
  };

  /* ---------- Morceaux d'interface ---------- */
  function bar(key, pct, extra = '') {
    const w = Math.round(pct * 1000) / 10;
    const from = barMemo[key] ?? 0;
    return `<div class="bar ${extra}"><i data-key="${key}" data-w="${w}" style="width:${from}%"></i></div>`;
  }

  function emptyBox(title, text) {
    return `<div class="empty"><b>${title}</b>${text}</div>`;
  }

  /* ---------- En-tête ---------- */
  let pctRaf = 0;
  let shownPct = 0;

  function animatePct(to) {
    const el = $('#globalPct');
    cancelAnimationFrame(pctRaf);
    if (reducedMotion) { shownPct = to; el.textContent = to + '%'; return; }
    const from = shownPct;
    const t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      shownPct = Math.round(from + (to - from) * e);
      el.textContent = shownPct + '%';
      if (k < 1) pctRaf = requestAnimationFrame(step);
    };
    pctRaf = requestAnimationFrame(step);
  }

  function renderHeader() {
    const { y, m } = partsOf(current);
    const now = new Date();
    const nowKey = keyOf(now);

    $('#kanji').textContent = `${m}月`;
    $('#monthName').textContent = MOIS[m - 1];
    $('#monthYear').textContent = y;

    let left = '';
    if (current === nowKey) {
      const d = new Date(y, m, 0).getDate() - now.getDate();
      left = d === 0 ? 'Dernier jour du mois !' : `Plus que ${d} jour${d > 1 ? 's' : ''}`;
    } else {
      left = current < nowKey ? 'Mois terminé' : 'Mois à venir';
    }
    $('#daysLeft').textContent = left;

    const mo = M();
    const secs = sections(mo);
    const vals = Object.values(secs);
    const pct = vals.length ? Math.round(avg(vals) * 100) : 0;
    animatePct(pct);
    $('#globalLabel').textContent = vals.length ? 'du mois accompli' : 'ajoute tes objectifs';

    document.querySelectorAll('[data-chip]').forEach(c => {
      const v = secs[c.dataset.chip];
      c.textContent = v === undefined ? '—' : Math.round(v * 100) + '%';
    });

    $('#todayBtn').hidden = current === nowKey;
    const prev = state.months[shiftKey(current, -1)];
    $('#copyBtn').classList.toggle('pulse', isEmpty(mo) && !isEmpty(prev));
    if (lastGlobal !== null && lastGlobal < 100 && pct === 100) megaCelebration();
    lastGlobal = pct;
    renderHud();
    renderQuests();
    renderCountdowns();
    updateInstallBtn();
  }

  /* ---------- Animes ---------- */
  const picked = { anime: null, watch: null, manga: null, book: null };   // choisi dans la liste de suggestions
  const suggResults = { anime: [], watch: [], manga: [], book: [] };
  let suggTimer = 0;
  let pendingAnimeRender = false;

  function coverImg(al, name, cls = 'cover') {
    if (al && al.cover) {
      return `<img class="${cls}" src="${esc(al.cover)}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
    }
    return `<span class="${cls} cover-empty" aria-hidden="true">${esc(String(name || '?').trim().charAt(0).toUpperCase() || '?')}</span>`;
  }

  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const hhmm = d => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  function dayLabel(d) {
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    if (sameDay(d, today)) return "aujourd'hui";
    if (sameDay(d, tomorrow)) return 'demain';
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
  }

  const fmtAir = at => { const d = new Date(at * 1000); return `${dayLabel(d)} à ${hhmm(d)}`; };

  function fmtStart(s) {
    if (!s || !s.y) return 'date pas encore connue';
    if (s.m && s.d) return `${s.d} ${MOIS_COURT[s.m - 1]} ${s.y}`;
    if (s.m) return `${MOIS[s.m - 1].toLowerCase()} ${s.y}`;
    return String(s.y);
  }

  // Ligne d'infos sous le nom : prochain épisode, date de sortie, épisodes déjà sortis à rattraper
  function airLine(al, ep) {
    if (!al) return '';
    const bits = [];
    const nextOk = al.next && al.next.at * 1000 > Date.now();
    if (al.status === 'NOT_YET_RELEASED') {
      bits.push(nextOk ? `Sortie : ép. 1 ${fmtAir(al.next.at)}` : `Sortie : ${fmtStart(al.start)}`);
    } else if (nextOk) {
      bits.push(`Prochain : ép. ${al.next.ep} ${fmtAir(al.next.at)}`);
    } else if (al.status === 'FINISHED') {
      bits.push(`Diffusion terminée${al.episodes ? ` · ${al.episodes} ép.` : ''}`);
    }
    let behind = 0;
    if (typeof ep === 'number') {
      const out = al.status === 'FINISHED' ? al.episodes : (nextOk ? al.next.ep - 1 : 0);
      behind = out ? out - ep : 0;
    }
    if (!bits.length && behind <= 0) return '';
    return `<p class="air">${esc(bits.join(' · '))}${behind > 0 ? ` <b class="behind">${behind} ép. dispo à regarder</b>` : ''}</p>`;
  }

  // Ligne d'infos pour un manga : parution et chapitres à lire
  function mangaLine(al, ch) {
    if (!al) return '';
    const bits = [];
    if (al.status === 'RELEASING') bits.push('En cours de parution');
    else if (al.status === 'FINISHED') bits.push(`Terminé${al.chapters ? ` · ${al.chapters} ch.` : ''}${al.volumes ? ` · ${al.volumes} tomes` : ''}`);
    else if (al.status === 'NOT_YET_RELEASED') bits.push(`Sortie : ${fmtStart(al.start)}`);
    else if (al.status === 'HIATUS') bits.push('En pause');
    const behind = al.status === 'FINISHED' && al.chapters ? al.chapters - ch : 0;
    if (!bits.length && behind <= 0) return '';
    return `<p class="air">${esc(bits.join(' · '))}${behind > 0 ? ` <b class="behind">${behind} ch. à lire</b>` : ''}</p>`;
  }

  function animeCard(a, kind = 'anime') {
    const K = KINDS[kind];
    const p = animePct(a);
    const done = p >= 1;
    const finished = a.total > 0 && a.ep >= a.total;
    const seen = Math.max(0, a.ep - a.start);
    const need = Math.max(0, a.goal - a.start);
    const rating = finished ? `
      <div class="rating" role="group" aria-label="Ta note sur 10">
        <span>Ta note :</span>
        ${Array.from({ length: 10 }, (_, i) => i + 1).map(n =>
          `<button type="button" class="${a.rating >= n ? 'on' : ''}" data-act="anime-rate" data-v="${n}" aria-label="${n} sur 10">${n}</button>`).join('')}
        ${a.rating ? `<b>${a.rating}/10</b>` : ''}
      </div>` : '';
    return `
      <article class="card anime ${done ? 'is-done' : ''} ${added.has(a.id) ? 'is-new' : ''}" data-id="${a.id}" data-kind="${kind}">
        <div class="anime-row">
          ${coverImg(a.al, a.name)}
          <div class="anime-main">
            <div class="anime-top">
              <input class="ghost name" data-act="anime-name" value="${esc(a.name)}" aria-label="Nom">
              ${finished ? '<span class="tag">TERMINÉ</span>' : ''}
              <button class="x" data-act="anime-del" aria-label="Supprimer ${esc(a.name)}" title="Supprimer">×</button>
            </div>
            ${kind === 'manga' ? mangaLine(a.al, a.ep) : airLine(a.al, a.ep)}
            <div class="anime-mid">
              <button class="step" data-act="anime-minus" aria-label="Retirer un ${K.one}">−</button>
              <div class="ep"><small>${K.unit}</small><span class="ep-num">${a.ep}</span></div>
              <button class="step plus" data-act="anime-plus" aria-label="Un ${K.one} de plus">+1</button>
              <div class="anime-goal">
                <label>Objectif : ${K.short} <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-goal" value="${a.goal}"></label>
                <label class="muted">sur <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-total" value="${a.total || ''}" placeholder="?"> au total</label>
              </div>
            </div>
          </div>
        </div>
        ${bar(kind + '-' + a.id, p)}
        <div class="foot"><span>${seen} / ${need} ${need > 1 ? K.many : K.one} ce mois</span><b>${Math.round(p * 100)}%</b></div>
        ${rating}
        ${done ? `<span class="hanko ${fresh.has(a.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
      </article>`;
  }

  // Planning : les épisodes qui sortent dans les 7 prochains jours
  function planningHtml() {
    const nowS = Date.now() / 1000;
    const seenIds = new Set();
    const items = [];
    const realMonth = state.months[keyOf(new Date())];
    const pool = [...(realMonth ? realMonth.animes : []), ...state.watchlist];
    pool.forEach(x => {
      const al = x.al;
      if (!al || !al.next || seenIds.has(al.id)) return;
      if (al.next.at < nowS - 3600 || al.next.at > nowS + 7 * 86400) return;
      seenIds.add(al.id);
      items.push({ name: x.name, al, at: al.next.at, ep: al.next.ep, later: !('ep' in x) });
    });
    if (!items.length) {
      return '<p class="empty-line">Aucun épisode prévu dans les 7 prochains jours pour tes animes. Les dates viennent d\'AniList et se mettent à jour toutes seules.</p>';
    }
    items.sort((a, b) => a.at - b.at);
    const groups = [];
    items.forEach(i => {
      const d = new Date(i.at * 1000);
      const label = dayLabel(d);
      let g = groups.find(x => x.label === label);
      if (!g) { g = { label, list: [] }; groups.push(g); }
      g.list.push(i);
    });
    return `
      <div class="planning">${groups.map(g => `
        <div class="plan-day">
          <h4>${g.label.charAt(0).toUpperCase() + g.label.slice(1)}</h4>
          ${g.list.map(i => `
            <div class="plan-item">
              ${coverImg(i.al, i.name, 'cover xs')}
              <span class="plan-time">${hhmm(new Date(i.at * 1000))}</span>
              <span class="plan-name">${esc(i.name)}${i.later ? ' <em class="e-tag">à voir</em>' : ''}</span>
              <b>ép. ${i.ep}</b>
            </div>`).join('')}
        </div>`).join('')}
      </div>
      <p class="hint">Heure de sortie au Japon, convertie à ton heure. Sur Crunchyroll, l'épisode arrive souvent un peu après.</p>`;
  }

  function watchStatus(al) {
    if (!al) return '';
    const nextOk = al.next && al.next.at * 1000 > Date.now();
    if (al.status === 'NOT_YET_RELEASED') return nextOk ? `Sortie : ép. 1 ${fmtAir(al.next.at)}` : `Sortie : ${fmtStart(al.start)}`;
    if (al.status === 'RELEASING') return nextOk ? `En cours · ép. ${al.next.ep} ${fmtAir(al.next.at)}` : 'En cours de diffusion';
    if (al.status === 'FINISHED') return `Terminé${al.episodes ? ` · ${al.episodes} ép.` : ''}${al.year ? ` · ${al.year}` : ''}`;
    if (al.status === 'HIATUS') return 'En pause';
    return '';
  }

  function suggestField(type, placeholder) {
    return `
      <div class="sugg-wrap wide">
        <input name="name" placeholder="${placeholder}" required maxlength="80" aria-label="${placeholder}" aria-autocomplete="list">
        <div class="sugg" data-sugg="${type}" hidden></div>
      </div>`;
  }

  function renderAnime() {
    pendingAnimeRender = false;
    const m = M();
    const cards = m.animes.map(a => animeCard(a, 'anime')).join('');
    const isNow = current === keyOf(new Date());

    const watch = state.watchlist.map(w => `
      <div class="watch-card ${added.has(w.id) ? 'is-new' : ''}" data-id="${w.id}">
        ${coverImg(w.al, w.name, 'cover md')}
        <div class="w-info">
          <b title="${esc(w.name)}">${esc(w.name)}</b>
          <small>${esc(watchStatus(w.al))}</small>
        </div>
        <div class="w-actions">
          <button type="button" class="btn sm" data-act="watch-start">Commencer</button>
          <button type="button" class="x" data-act="watch-del" aria-label="Retirer ${esc(w.name)}" title="Retirer">×</button>
        </div>
      </div>`).join('');

    $('#animeBody').innerHTML =
      (cards ? `<div class="stack">${cards}</div>`
        : emptyBox('Aucun anime pour ce mois.', "Ajoute ce que tu veux regarder : tape le nom et choisis-le dans la liste, l'affiche et le nombre d'épisodes arrivent tout seuls.")) + `
      <form class="add" data-form="anime" autocomplete="off">
        ${suggestField('anime', "Nom de l'anime")}
        <input name="ep" type="number" min="0" inputmode="numeric" placeholder="Ép. actuel">
        <input name="goal" type="number" min="0" inputmode="numeric" placeholder="Objectif ép.">
        <input name="total" type="number" min="0" inputmode="numeric" placeholder="Total ép.">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>

      ${isNow ? `<h3 class="sub">Planning de la semaine</h3>${planningHtml()}` : ''}

      <h3 class="sub">À regarder plus tard</h3>
      ${watch ? `<div class="watch-grid">${watch}</div>`
        : '<p class="empty-line">Garde ici les animes que tu veux voir un jour. Tu verras leur date de sortie, et « Commencer » les ajoute au mois.</p>'}
      <form class="add" data-form="watch" autocomplete="off">
        ${suggestField('watch', 'Anime à voir plus tard')}
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
  }

  // Re-dessine les animes (et mangas) sans casser une saisie en cours
  function softRenderAnime() {
    if ($('#animeBody').contains(document.activeElement) || $('#mangaBody').contains(document.activeElement)) {
      pendingAnimeRender = true;
      return;
    }
    renderAnime();
    renderManga();
    afterRender();
  }

  /* ---------- Études : révision et livres ---------- */
  const OPENLIB = 'https://openlibrary.org/search.json';
  const olCache = new Map();

  async function olSearch(text) {
    const k = norm(text);
    if (olCache.has(k)) return olCache.get(k);
    const url = `${OPENLIB}?q=${encodeURIComponent(text)}&limit=6&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Open Library ' + res.status);
    const j = await res.json();
    const list = (j.docs || []).map(d => ({
      title: d.title || '',
      author: (d.author_name || []).slice(0, 2).join(', '),
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '',
      pages: d.number_of_pages_median || 0,
      year: d.first_publish_year || null
    }));
    olCache.set(k, list);
    return list;
  }

  function studyStats() {
    const today = dateKey(new Date());
    const week = weekDates(mondayKey(new Date()));
    const monthPrefix = keyOf(new Date());
    let w = 0, m = 0;
    Object.entries(state.study).forEach(([d, v]) => {
      if (week.includes(d)) w += v;
      if (d.startsWith(monthPrefix)) m += v;
    });
    return { today: state.study[today] || 0, week: w, month: m };
  }
  const hmin = m => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);

  function bookCard(b) {
    const p = b.pages ? clamp01(b.page / b.pages) : 0;
    const done = b.status === 'done';
    const st = [['todo', 'À lire'], ['reading', 'En cours'], ['done', 'Fini']];
    return `
      <div class="book card ${done ? 'is-done' : ''} ${added.has(b.id) ? 'is-new' : ''}" data-book="${b.id}">
        <div class="anime-row">
          ${coverImg(b, b.title)}
          <div class="anime-main">
            <div class="anime-top">
              <input class="ghost name" data-act="book-title" value="${esc(b.title)}" aria-label="Titre" maxlength="100">
              <button type="button" class="x" data-act="book-del" aria-label="Supprimer ${esc(b.title)}" title="Supprimer">×</button>
            </div>
            ${b.author ? `<p class="air">${esc(b.author)}</p>` : ''}
            <div class="seg book-seg" role="group" aria-label="Où tu en es">${st.map(([v, l]) =>
              `<button type="button" data-act="book-status" data-v="${v}" class="${b.status === v ? 'on' : ''}">${l}</button>`).join('')}</div>
            ${b.status !== 'todo' ? `
              <div class="book-pages">
                <span>Page</span>
                <input class="num-in" type="number" min="0" inputmode="numeric" data-act="book-page" value="${b.page || 0}" aria-label="Page actuelle">
                <span>/</span>
                <input class="num-in" type="number" min="0" inputmode="numeric" data-act="book-total" value="${b.pages || ''}" placeholder="?" aria-label="Nombre de pages">
                ${!done ? '<button type="button" class="btn sm" data-act="book-plus" data-v="10">+10 p.</button>' : ''}
              </div>` : ''}
          </div>
        </div>
        ${b.status !== 'todo' && b.pages ? bar('book-' + b.id, p, 'thin') : ''}
        ${done ? `
          <div class="rating" role="group" aria-label="Ta note sur 10">
            <span>Ta note :</span>
            ${Array.from({ length: 10 }, (_, i) => i + 1).map(n =>
              `<button type="button" class="${b.rating >= n ? 'on' : ''}" data-act="book-rate" data-v="${n}" aria-label="${n} sur 10">${n}</button>`).join('')}
            ${b.rating ? `<b>${b.rating}/10</b>` : ''}
          </div>` : ''}
        ${done ? `<span class="hanko sm ${fresh.has('b' + b.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
      </div>`;
  }

  function renderStudy() {
    const s = studyStats();
    // Les 7 derniers jours en petites barres
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
    const vals = days.map(d => state.study[dateKey(d)] || 0);
    const mx = Math.max(30, ...vals);
    const bars7 = `
      <div class="mini-bars viz" aria-label="Révision des 7 derniers jours">${days.map((d, i) => `
        <div class="mb" data-tip="${JOURS[d.getDay()]} ${d.getDate()} : ${hmin(vals[i])}">
          <i style="height:${Math.max(vals[i] ? 6 : 0, (vals[i] / mx) * 100)}%"></i>
          <small>${JOURS[d.getDay()].charAt(0).toUpperCase()}</small>
        </div>`).join('')}
      </div>`;

    const order = { reading: 0, todo: 1, done: 2 };
    const books = state.books.slice().sort((a, b) => order[a.status] - order[b.status]);
    const active = books.filter(b => b.status !== 'done');
    const finished = books.filter(b => b.status === 'done');

    $('#studyBody').innerHTML = `
      <div class="study-btns">
        <button type="button" class="btn primary" data-act="study-start" data-v="25">Réviser 25 min</button>
        <button type="button" class="btn" data-act="study-start" data-v="50">50 min</button>
        <button type="button" class="btn" data-act="break-start" data-v="5">Pause 5 min</button>
      </div>
      <div class="study-stats">
        <div><b>${hmin(s.today)}</b><small>aujourd'hui</small></div>
        <div><b>${hmin(s.week)}</b><small>cette semaine</small></div>
        <div><b>${hmin(s.month)}</b><small>ce mois</small></div>
      </div>
      ${bars7}
      <form class="add" data-form="study" autocomplete="off">
        <label class="day-lbl">J'ai révisé <input name="min" type="number" min="1" max="600" inputmode="numeric" placeholder="30"> min</label>
        <button class="btn" type="submit">Ajouter</button>
      </form>
      <p class="hint">Le minuteur s'affiche en bas de l'écran. Les minutes faites comptent même si tu arrêtes avant la fin.</p>

      <h3 class="sub">Livres</h3>
      ${active.length ? `<div class="stack">${active.map(bookCard).join('')}</div>`
        : '<p class="empty-line">Ajoute un livre : tape le titre et choisis-le, la couverture et le nombre de pages arrivent tout seuls.</p>'}
      <form class="add" data-form="book" autocomplete="off">
        ${suggestField('book', 'Titre du livre')}
        <button class="btn primary" type="submit">Ajouter</button>
      </form>
      ${finished.length ? `
        <details class="done-books">
          <summary>Livres finis (${finished.length})</summary>
          <div class="stack">${finished.map(bookCard).join('')}</div>
        </details>` : ''}`;
  }

  /* ---------- Mangas ---------- */
  function renderManga() {
    const m = M();
    const cards = m.mangas.map(x => animeCard(x, 'manga')).join('');
    $('#mangaBody').innerHTML =
      (cards ? `<div class="stack">${cards}</div>`
        : emptyBox('Aucun manga pour ce mois.', 'Tape le nom et choisis-le dans la liste : la couverture et le nombre de chapitres arrivent tout seuls.')) + `
      <form class="add" data-form="manga" autocomplete="off">
        ${suggestField('manga', 'Nom du manga')}
        <input name="ep" type="number" min="0" inputmode="numeric" placeholder="Ch. actuel">
        <input name="goal" type="number" min="0" inputmode="numeric" placeholder="Objectif ch.">
        <input name="total" type="number" min="0" inputmode="numeric" placeholder="Total ch.">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
  }

  /* ---------- Callisthénie ---------- */
  const caliOpen = new Map();   // niveau → ouvert / fermé à la main

  const fmtDay = dk => { if (!dk) return ''; const [y, m, d] = dk.split('-').map(Number); return `${d} ${MOIS_COURT[m - 1]} ${y}`; };

  function renderCali() {
    const st = id => state.cali[id] || {};
    const done = CALI.SKILLS.filter(s => st(s.id).s === 'done');
    const next = CALI.SKILLS.find(s => st(s.id).s !== 'done');
    const working = CALI.SKILLS.filter(s => st(s.id).s === 'work');
    const openTier = next ? next.tier : 0;
    $('#caliChip').textContent = `${done.length}/${CALI.SKILLS.length}`;

    const card = s => {
      const x = st(s.id);
      const isDone = x.s === 'done';
      const isWork = x.s === 'work';
      return `
        <article class="skill ${isDone ? 'done' : ''} ${isWork ? 'work' : ''}" data-skill="${s.id}">
          <div class="skill-img">${CALI.svg(s)}</div>
          <div class="skill-info">
            <div class="skill-title"><span class="skill-num">${CALI.SKILLS.indexOf(s) + 1}</span><b>${esc(s.name)}</b></div>
            <small class="skill-en">${esc(s.en)} · +${s.tier * XP.skillTier} XP</small>
            <p class="skill-goal">Objectif : <b>${esc(s.goal)}</b></p>
            <details class="skill-tip"><summary>Conseil</summary><p>${esc(s.tip)}</p></details>
            <input class="ghost skill-rec" data-act="skill-rec" value="${esc(x.rec || '')}" placeholder="Ton record (ex : 6 s, 3 reps)" maxlength="30" aria-label="Ton record">
            <div class="skill-actions">
              ${goalSeconds(s) ? '<button type="button" class="btn sm" data-act="skill-chrono">Chrono</button>' : ''}
              ${isDone
                ? `<span class="skill-date">Réussi le ${fmtDay(x.at)}</span><button type="button" class="btn sm" data-act="skill-undo">Annuler</button>`
                : `<button type="button" class="btn sm ${isWork ? 'on' : ''}" data-act="skill-work" aria-pressed="${isWork}">${isWork ? 'En cours ✓' : 'Je travaille'}</button>
                   <button type="button" class="btn sm primary" data-act="skill-done">Réussi !</button>`}
            </div>
          </div>
          ${isDone ? `<span class="hanko sm ${fresh.has('k' + s.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
        </article>`;
    };

    const tiers = CALI.TIERS.map(t => {
      const list = CALI.SKILLS.filter(s => s.tier === t.n);
      const d = list.filter(s => st(s.id).s === 'done').length;
      const open = caliOpen.has(t.n) ? caliOpen.get(t.n) : t.n === openTier;
      return `
        <details class="tier" data-tier="${t.n}" ${open ? 'open' : ''} style="--tier: var(--tier-${t.n})">
          <summary>
            <span class="tier-n">Niv. ${t.n}</span>
            <b>${t.name}</b>
            <span class="jp" lang="ja">${t.jp}</span>
            <span class="tier-count ${d === list.length ? 'full' : ''}">${d}/${list.length}</span>
          </summary>
          <div class="skill-list">${list.map(card).join('')}</div>
        </details>`;
    }).join('');

    $('#caliBody').innerHTML = `
      <div class="cali-stats">
        <div class="q-stat"><span class="big">${done.length}</span><span class="of">/ ${CALI.SKILLS.length} figures réussies</span></div>
        <p class="cali-next">${next ? `Prochain défi : <b>${esc(next.name)}</b> · ${esc(next.goal.toLowerCase())}` : '<b>Toutes les figures sont réussies. Légende !</b>'}</p>
      </div>
      ${bar('cali', CALI.SKILLS.length ? done.length / CALI.SKILLS.length : 0)}
      ${working.length ? `<p class="hint">En cours : ${working.map(s => esc(s.name)).join(', ')}</p>` : ''}
      <div class="tiers">${tiers}</div>
      <p class="hint">De la plus facile à la plus dure. Touche « Réussi ! » quand tu tiens l'objectif proprement, et note ton record pour voir tes progrès.</p>`;
  }

  /* ---------- Habitudes du jour ---------- */
  function setHabit(m, id, d, c) {
    if (!m.habits[id]) m.habits[id] = {};
    if (c > 0) m.habits[id][d] = c; else delete m.habits[id][d];
    if (!Object.keys(m.habits[id]).length) delete m.habits[id];
  }

  function habitStreak(h) {
    const d = new Date();
    const at = x => habitDone(state.months[keyOf(x)], h, x.getDate());
    if (!at(d)) d.setDate(d.getDate() - 1);
    let n = 0;
    while (n < 3660 && at(d)) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function habitForm() {
    return `
      <form class="add" data-form="habit" autocomplete="off">
        <input class="wide" name="name" placeholder="Nouvelle habitude" required maxlength="40">
        <label class="day-lbl"><input name="target" type="number" min="1" max="10" value="1" inputmode="numeric"> fois / jour</label>
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
  }

  function renderHabits() {
    const oldScroll = $('#habitBody .hg-scroll');
    const prevLeft = oldScroll && oldScroll.dataset.month === current ? oldScroll.scrollLeft : null;
    drawHabits();
    // Sur petit écran, la grille défile : on garde la position, ou on montre aujourd'hui
    const sc = $('#habitBody .hg-scroll');
    if (!sc) return;
    sc.dataset.month = current;
    if (prevLeft !== null) { sc.scrollLeft = prevLeft; return; }
    const td = sc.querySelector('.hg-cell.today');
    if (td) {
      const over = td.getBoundingClientRect().right - sc.getBoundingClientRect().right;
      if (over > 0) sc.scrollLeft += over + 90;
    }
  }

  /* ---------- Humeur et sommeil ---------- */
  function sleepMinutes(s) {
    if (!s || !s.bed || !s.wake) return 0;
    const [bh, bm] = s.bed.split(':').map(Number);
    const [wh, wm] = s.wake.split(':').map(Number);
    let m = (wh * 60 + wm) - (bh * 60 + bm);
    if (m <= 0) m += 1440;
    return m;
  }
  const hm = m => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;

  function moodSleepHtml() {
    const today = dateKey(new Date());
    const mood = state.mood[today] || 0;
    const sl = state.sleep[today] || {};
    const d = new Date();
    const mins = [];
    for (let i = 0; i < 7; i++) { const v = sleepMinutes(state.sleep[dateKey(d)]); if (v) mins.push(v); d.setDate(d.getDate() - 1); }
    const avg7 = mins.length ? Math.round(avg(mins)) : 0;
    const dur = sleepMinutes(sl);
    return `
      <div class="daycheck">
        <div class="dc-block">
          <span class="dc-label">Humeur du jour</span>
          <div class="moods">${MOODS.map(m => `<button type="button" class="mood ${mood === m.v ? 'on' : ''}" data-act="mood" data-v="${m.v}" title="${m.name}" aria-label="${m.name}" aria-pressed="${mood === m.v}">${m.face}</button>`).join('')}</div>
        </div>
        <div class="dc-block">
          <span class="dc-label">Nuit dernière</span>
          <div class="sleep-row">
            <label>Couché <input type="time" data-act="sleep-bed" value="${esc(sl.bed || '')}"></label>
            <label>Levé <input type="time" data-act="sleep-wake" value="${esc(sl.wake || '')}"></label>
            <b class="sleep-dur ${dur && dur < 360 ? 'short' : ''}">${dur ? hm(dur) : '—'}</b>
          </div>
          ${avg7 ? `<small class="hint">Moyenne sur 7 nuits : <b>${hm(avg7)}</b></small>` : ''}
        </div>
      </div>`;
  }

  // Lignes « Humeur » et « Sommeil » au-dessus des habitudes dans la grille du mois
  function moodSleepRows(dim, isNow, today, nowKey) {
    const dk = d => `${current}-${String(d).padStart(2, '0')}`;
    const has = Array.from({ length: dim }, (_, i) => dk(i + 1)).some(k => state.mood[k] || state.sleep[k]);
    if (!has) return '';
    const moodCells = Array.from({ length: dim }, (_, i) => {
      const v = state.mood[dk(i + 1)] || 0;
      const f = v ? MOODS[v - 1] : null;
      return `<span class="hg-cell mood-cell ${v ? 'm' + v : ''} ${isNow && i + 1 === today ? 'today' : ''}" title="${i + 1} : ${f ? f.name : 'pas noté'}"></span>`;
    }).join('');
    const sleepCells = Array.from({ length: dim }, (_, i) => {
      const m = sleepMinutes(state.sleep[dk(i + 1)]);
      return `<span class="hg-cell sleep-cell ${m ? (m < 360 ? 'short' : 'ok') : ''} ${isNow && i + 1 === today ? 'today' : ''}" title="${i + 1} : ${m ? hm(m) : 'pas noté'}">${m ? Math.round(m / 60) : ''}</span>`;
    }).join('');
    return `
      <div class="hg-row hg-extra"><span class="hg-name"><b>Humeur</b></span>${moodCells}<span class="hg-stat"></span></div>
      <div class="hg-row hg-extra"><span class="hg-name"><b>Sommeil (h)</b></span>${sleepCells}<span class="hg-stat"></span></div>`;
  }

  function drawHabits() {
    const m = M();
    const { y, m: mon } = partsOf(current);
    const dim = new Date(y, mon, 0).getDate();
    const now = new Date();
    const nowKey = keyOf(now);
    const isNow = nowKey === current;
    const today = now.getDate();
    const days = elapsedDays(current);
    const ideasLeft = HABIT_IDEAS.map((h, i) => ({ h, i })).filter(({ h }) => !state.habits.some(x => x.name === h.name));

    const daycheck = isNow ? moodSleepHtml() : '';

    if (!state.habits.length) {
      $('#habitBody').innerHTML = daycheck +
        emptyBox('Aucune habitude pour le moment.', 'Ce sont les petits trucs à faire tous les jours. Choisis-en dans la liste ou crée la tienne.') + `
        <div class="habit-ideas">${HABIT_IDEAS.map((h, i) =>
          `<button type="button" class="btn sm" data-act="habit-idea" data-i="${i}">+ ${esc(h.name)}${h.target > 1 ? ` (${h.target} fois)` : ''}</button>`).join('')}</div>
        ${habitForm()}`;
      return;
    }

    // Aujourd'hui : grosses cases à toucher
    const todayHtml = isNow ? `
      <div class="habit-today">${state.habits.map(h => {
        const t = h.target || 1;
        const c = habitCount(m, h.id, today);
        const done = c >= t;
        return `
          <div class="h-card ${done ? 'done' : ''} ${fresh.has('h' + h.id) ? 'fresh' : ''}" data-id="${h.id}">
            <button type="button" class="h-main" data-act="habit-tap" aria-pressed="${done}">
              <span class="h-check" aria-hidden="true">済</span>
              <span class="h-name">${esc(h.name)}</span>
              ${t > 1 ? `<span class="h-count">${c}/${t}</span>` : ''}
            </button>
            ${t > 1 ? `<div class="h-dots">${Array.from({ length: t }, (_, i) =>
              `<button type="button" class="${i < c ? 'on' : ''}" data-act="habit-dot" data-v="${i + 1}" aria-label="${i + 1} sur ${t}"></button>`).join('')}</div>` : ''}
          </div>`;
      }).join('')}</div>` : '';

    // Le mois : une ligne par habitude, une case par jour
    const head = `<div class="hg-row hg-head"><span class="hg-name"></span>${Array.from({ length: dim }, (_, i) =>
      `<span class="hg-day ${isNow && i + 1 === today ? 'today' : ''}">${i + 1}</span>`).join('')}<span class="hg-stat"></span></div>`;
    const rows = state.habits.map(h => {
      const t = h.target || 1;
      let doneDays = 0;
      const cells = Array.from({ length: dim }, (_, i) => {
        const d = i + 1;
        const c = habitCount(m, h.id, d);
        const future = current > nowKey || (isNow && d > today);
        if (c >= t) doneDays++;
        const cls = c >= t ? 'full' : c > 0 ? 'part' : '';
        return `<button type="button" class="hg-cell ${cls} ${isNow && d === today ? 'today' : ''}" data-act="habit-cell" data-day="${d}"
          ${future ? 'disabled' : ''} title="${d} ${MOIS_COURT[mon - 1]} : ${c}/${t}" aria-label="${d} ${MOIS_COURT[mon - 1]}"
          ${cls === 'part' ? `style="--p:${Math.round((c / t) * 100)}%"` : ''}></button>`;
      }).join('');
      const st = habitStreak(h);
      return `
        <div class="hg-row" data-id="${h.id}">
          <span class="hg-name">
            <input class="ghost" data-act="habit-name" value="${esc(h.name)}" aria-label="Nom de l'habitude" maxlength="40">
            <button type="button" class="x" data-act="habit-del" aria-label="Supprimer ${esc(h.name)}" title="Supprimer">×</button>
          </span>
          ${cells}
          <span class="hg-stat"><b>${doneDays}</b>/${days || dim}${st ? ` <span class="mini-flame">${FLAME}${st}</span>` : ''}</span>
        </div>`;
    }).join('');

    $('#habitBody').innerHTML = `
      ${daycheck}
      ${todayHtml}
      <h3 class="sub">${isNow ? 'Le mois' : 'Le mois en cases'}</h3>
      <div class="hg-scroll"><div class="hg" style="--days:${dim}">${head}${moodSleepRows(dim, isNow, today, nowKey)}${rows}</div></div>
      <p class="hint">Clique sur une case pour cocher ou décocher un jour. Le nombre à droite = jours réussis.</p>
      ${habitForm()}
      ${ideasLeft.length ? `<div class="habit-ideas">${ideasLeft.map(({ h, i }) =>
        `<button type="button" class="btn sm" data-act="habit-idea" data-i="${i}">+ ${esc(h.name)}${h.target > 1 ? ` (${h.target} fois)` : ''}</button>`).join('')}</div>` : ''}`;
  }

  /* ---------- Sourates ---------- */
  function renderQuran() {
    const old = $('#surahGrid');
    const scroll = old ? old.scrollTop : 0;
    const m = M();
    const thisMonth = learnedIn(current);
    const total = learnedTotal();
    const p = m.quranGoal > 0 ? clamp01(thisMonth / m.quranGoal) : 0;
    const f = state.quran.filter;

    $('#quranBody').innerHTML = `
      <div class="q-stats">
        <div class="q-stat">
          <span class="big">${thisMonth}</span>
          <span class="of">/ <input type="number" min="0" max="114" inputmode="numeric" data-act="quran-goal" value="${m.quranGoal || ''}" placeholder="?" aria-label="Objectif de sourates ce mois"> ce mois</span>
        </div>
        <div class="q-total">
          <div class="q-stat"><span class="big sm">${total}</span><span class="of">/ 114 apprises</span></div>
          <div class="mini" title="Progression sur tout le Coran"><i style="width:${(total / 114) * 100}%"></i></div>
        </div>
      </div>
      ${bar('quran-' + current, p)}
      ${m.quranGoal > 0 ? '' : '<p class="hint">Écris combien de sourates tu veux apprendre ce mois-ci (à côté de « ce mois »).</p>'}
      ${reviewHtml()}
      <div class="q-tools">
        <input class="search" type="search" data-act="quran-search" placeholder="Chercher (nom ou numéro)…" value="${esc(quranSearch)}" aria-label="Chercher une sourate">
        <div class="seg" role="group" aria-label="Filtre">
          <button type="button" data-act="quran-filter" data-v="all" class="${f === 'all' ? 'on' : ''}">Toutes</button>
          <button type="button" data-act="quran-filter" data-v="todo" class="${f === 'todo' ? 'on' : ''}">À apprendre</button>
          <button type="button" data-act="quran-filter" data-v="done" class="${f === 'done' ? 'on' : ''}">Apprises</button>
        </div>
        <button type="button" class="btn sm" data-act="quran-order" title="Changer l'ordre">${state.quran.order === 'desc' ? '114 → 1' : '1 → 114'}</button>
      </div>
      <div class="surah-grid" id="surahGrid"></div>
      <div class="legend">
        <span><i class="l-now"></i>Apprise ce mois</span>
        <span><i class="l-old"></i>Apprise avant</span>
        <span>Clique sur une sourate quand tu la connais par cœur.</span>
      </div>`;

    renderSurahGrid();
    $('#surahGrid').scrollTop = scroll;
  }

  function renderSurahGrid() {
    const grid = $('#surahGrid');
    if (!grid) return;
    const scroll = grid.scrollTop;
    const q = norm(quranSearch);
    const f = state.quran.filter;
    const nums = Array.from({ length: 114 }, (_, i) => i + 1);
    if (state.quran.order === 'desc') nums.reverse();

    const html = nums.filter(n => {
      const learned = Boolean(state.quran.learned[n]);
      if (f === 'todo' && learned) return false;
      if (f === 'done' && !learned) return false;
      if (!q) return true;
      return String(n) === q || norm(SOURATES[n - 1]).includes(q);
    }).map(n => {
      const k = state.quran.learned[n];
      const cls = k ? (k === current ? 'learned now' : 'learned') : '';
      const title = k ? `Apprise en ${labelOf(k)}` : 'Pas encore apprise';
      return `<button type="button" class="surah ${cls} ${fresh.has('s' + n) ? 'fresh' : ''}" data-act="surah" data-n="${n}" title="${title}" aria-pressed="${Boolean(k)}"><b>${n}</b><span>${SOURATES[n - 1]}</span></button>`;
    }).join('');

    grid.innerHTML = html || '<p class="empty-line">Aucune sourate trouvée.</p>';
    grid.scrollTop = scroll;
  }

  /* ---------- Révision des sourates ---------- */
  function lastReviews() {
    const last = {};
    Object.keys(state.quran.reviews).sort().forEach(d => (state.quran.reviews[d] || []).forEach(n => { last[n] = d; }));
    return last;
  }

  const daysSince = dk => Math.round((new Date(dateKey(new Date()) + 'T12:00:00') - new Date(dk + 'T12:00:00')) / 86400000);
  const mondayKey = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dateKey(x); };

  // Les 7 dates (lundi → dimanche) de la semaine qui commence au lundi "mk"
  function weekDates(mk) {
    const start = new Date(mk + 'T12:00:00');
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(start); x.setDate(start.getDate() + i); return dateKey(x); });
  }

  function reviewHtml() {
    const learned = Object.keys(state.quran.learned).map(Number);
    if (!learned.length) {
      return '<p class="hint review-empty">Quand tu auras appris des sourates, je te proposerai ici celles à réviser.</p>';
    }
    const last = lastReviews();
    const today = dateKey(new Date());
    const todayList = state.quran.reviews[today] || [];
    const ref = n => last[n] || state.quran.learnedOn[n] || (state.quran.learned[n] + '-01');
    const todo = learned.filter(n => !todayList.includes(n))
      .sort((a, b) => (ref(a) < ref(b) ? -1 : ref(a) > ref(b) ? 1 : b - a))
      .slice(0, 5);
    const week = weekDates(mondayKey(new Date())).reduce((t, d) => t + (state.quran.reviews[d] || []).length, 0);

    return `
      <div class="review">
        <div class="review-head">
          <b>À réviser</b>
          <span class="hint">cette semaine : ${week} révision${week > 1 ? 's' : ''}</span>
        </div>
        ${todo.length ? `<div class="review-list">${todo.map(n => {
          const l = last[n];
          const ago = l ? daysSince(l) : null;
          const when = l ? (ago <= 0 ? "aujourd'hui" : ago === 1 ? 'hier' : `il y a ${ago} jours`) : 'jamais révisée';
          return `
            <div class="review-item ${l && ago < 7 ? '' : 'late'}">
              <b class="r-num">${n}</b>
              <span class="r-name">${SOURATES[n - 1]}<small>${when}</small></span>
              <button type="button" class="btn sm" data-act="review" data-n="${n}">✓ Révisée</button>
            </div>`;
        }).join('')}</div>` : '<p class="hint">Tout est révisé aujourd\'hui, bravo !</p>'}
        ${todayList.length ? `<p class="review-today">Révisées aujourd'hui : ${todayList.map(n =>
          `<button type="button" class="chip-undo" data-act="review" data-n="${n}" title="Annuler cette révision">${SOURATES[n - 1]} ×</button>`).join(' ')}</p>` : ''}
      </div>`;
  }

  /* ---------- Salle ---------- */
  function renderGym() {
    const g = M().gym;
    const { y, m } = partsOf(current);
    const dim = new Date(y, m, 0).getDate();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;   // lundi = 0
    const now = new Date();
    const isNow = keyOf(now) === current;

    let cal = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span class="dow">${d}</span>`).join('');
    cal += '<span></span>'.repeat(offset);
    for (let d = 1; d <= dim; d++) {
      const on = g.days.includes(d);
      const cls = [on ? 'on' : '', isNow && d === now.getDate() ? 'today' : '', fresh.has('day' + d) ? 'fresh' : ''].join(' ');
      cal += `<button type="button" class="day ${cls}" data-act="gym-day" data-day="${d}" aria-pressed="${on}" aria-label="${d} ${MOIS[m - 1]}">${d}</button>`;
    }

    const sp = g.goal > 0 ? clamp01(g.days.length / g.goal) : 0;

    const lifts = g.lifts.map(l => {
      const p = liftPct(l);
      return `
        <div class="card lift ${p >= 1 ? 'is-done' : ''} ${added.has(l.id) ? 'is-new' : ''}" data-id="${l.id}">
          <div class="lift-top">
            <input class="ghost name" data-act="lift-name" value="${esc(l.name)}" aria-label="Nom de l'objectif">
            <button class="x" data-act="lift-del" aria-label="Supprimer ${esc(l.name)}" title="Supprimer">×</button>
          </div>
          <div class="lift-vals">
            <span class="lbl">MAINTENANT</span>
            <button class="step sm" data-act="lift-minus" aria-label="Moins">−</button>
            <input class="num-in" type="number" step="any" data-act="lift-cur" value="${l.cur}" aria-label="Valeur actuelle">
            <button class="step sm" data-act="lift-plus" aria-label="Plus">+</button>
            <span class="arrow">→</span>
            <span class="lbl">BUT</span>
            <input class="num-in" type="number" step="any" data-act="lift-target" value="${l.target}" aria-label="Objectif">
            <input class="ghost unit" data-act="lift-unit" value="${esc(l.unit)}" placeholder="unité" aria-label="Unité" maxlength="10">
          </div>
          ${bar('lift-' + l.id, p, 'thin')}
          ${p >= 1 ? `<span class="hanko sm ${fresh.has(l.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
        </div>`;
    }).join('');

    $('#gymBody').innerHTML = `
      <div class="sessions-head">
        <div class="count">
          <span class="big">${g.days.length}</span>
          <span class="of">/ <input type="number" min="0" max="31" inputmode="numeric" data-act="gym-goal" value="${g.goal}" aria-label="Objectif de séances"> séances</span>
        </div>
        <p class="hint">Clique sur le jour où tu es allé à la salle.</p>
      </div>
      ${gymStreakHtml()}
      <div class="cal">${cal}</div>
      ${bar('gym-' + current, sp)}
      <div class="rest-row">
        <span>Minuteur de repos :</span>
        ${[60, 90, 120, 180].map(s => `<button type="button" class="btn sm" data-act="rest-start" data-v="${s}">${s < 120 ? s + ' s' : s / 60 + ' min'}</button>`).join('')}
      </div>

      <h3 class="sub">Mes séances</h3>
      ${workoutsHtml()}

      <h3 class="sub">Objectifs de perf</h3>
      ${lifts ? `<div class="stack">${lifts}</div>`
        : '<p class="empty-line">Exemples : Développé couché 60 → 70 kg, Tractions 8 → 12 reps, Poids 75 → 72 kg…</p>'}
      <form class="add" data-form="lift" autocomplete="off">
        <input class="wide" name="name" placeholder="Exercice ou objectif" required maxlength="60">
        <input name="cur" type="number" step="any" placeholder="Actuel">
        <input name="target" type="number" step="any" placeholder="Objectif">
        <input name="unit" placeholder="kg, reps…" value="kg" maxlength="10">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>
      ${liftChartHtml()}
      ${weightHtml()}`;
  }

  /* ---------- Séances types ---------- */
  let editingWorkout = null;
  let liftChartSel = '';

  function loadSession() {
    try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); return s && s.wid ? s : null; }
    catch (e) { return null; }
  }
  function saveSession(s) {
    try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }
    catch (e) { /* rien */ }
  }

  function workoutsHtml() {
    const session = loadSession();
    const running = session && byId(state.workouts, session.wid);
    const lastDone = wid => state.workoutLog.filter(x => x.wid === wid).map(x => x.date).sort().pop();
    const cards = state.workouts.map(w => {
      const editing = editingWorkout === w.id;
      const last = lastDone(w.id);
      const editor = `
        <input class="ghost wk-name" data-act="wk-name" value="${esc(w.name)}" aria-label="Nom de la séance" maxlength="40">
        <div class="wk-edit">${w.ex.map(e => `
          <div class="wk-ex" data-ex="${e.id}">
            <input class="ghost" data-act="wkex-name" value="${esc(e.name)}" aria-label="Exercice" maxlength="40">
            <input class="num-in" type="number" min="1" max="20" inputmode="numeric" data-act="wkex-sets" value="${e.sets}" aria-label="Séries">
            <span>×</span>
            <input class="num-in" type="text" data-act="wkex-reps" value="${esc(e.reps)}" aria-label="Répétitions" maxlength="10">
            <button type="button" class="x" data-act="wkex-del" aria-label="Enlever ${esc(e.name)}">×</button>
          </div>`).join('')}
        </div>
        <button type="button" class="btn sm" data-act="wkex-add">+ Exercice</button>`;
      return `
        <div class="wk ${editing ? 'editing' : ''} ${added.has(w.id) ? 'is-new' : ''}" data-wid="${w.id}">
          ${editing ? editor : `
            <div class="wk-top"><b>${esc(w.name)}</b><small>${w.ex.length} exercice${w.ex.length > 1 ? 's' : ''}${last ? ` · dernière fois : ${fmtDay(last)}` : ''}</small></div>
            <p class="wk-list">${w.ex.map(e => `${esc(e.name)} <b>${e.sets}×${esc(e.reps)}</b>`).join(' · ') || 'Aucun exercice'}</p>`}
          <div class="wk-actions">
            <button type="button" class="btn sm primary" data-act="wk-start">${running && running.id === w.id ? 'Reprendre' : 'Commencer'}</button>
            <button type="button" class="btn sm" data-act="wk-edit">${editing ? 'Fini' : 'Modifier'}</button>
            <button type="button" class="x" data-act="wk-del" aria-label="Supprimer ${esc(w.name)}" title="Supprimer">×</button>
          </div>
        </div>`;
    }).join('');
    const ideas = WORKOUT_TEMPLATES.map((t, i) => ({ t, i })).filter(({ t }) => !state.workouts.some(w => w.name === t.name));
    return `
      ${running ? `<p class="wk-running">Séance en cours : <b>${esc(running.name)}</b> <button type="button" class="btn sm primary" data-act="wk-start" data-wid="${running.id}">Reprendre</button></p>` : ''}
      ${cards ? `<div class="stack">${cards}</div>` : '<p class="empty-line">Une séance type = ta liste d\'exercices (séries × répétitions). Tu la lances, tu coches chaque série, et le repos se lance tout seul.</p>'}
      <div class="habit-ideas">
        ${ideas.map(({ t, i }) => `<button type="button" class="btn sm" data-act="wk-template" data-i="${i}">+ ${esc(t.name)}</button>`).join('')}
        <button type="button" class="btn sm" data-act="wk-new">+ Séance vide</button>
      </div>`;
  }

  function renderWorkout() {
    const s = loadSession();
    const w = s && byId(state.workouts, s.wid);
    if (!w) { $('#workoutModal').hidden = true; return; }
    const total = w.ex.reduce((t, e) => t + e.sets, 0);
    const done = w.ex.reduce((t, e) => t + Math.min(e.sets, s.sets[e.id] || 0), 0);
    $('#workoutTitle').textContent = w.name;
    $('#workoutBody').innerHTML = `
      <p class="hint">Coche chaque série quand tu l'as faite : le repos (${restSeconds()} s) se lance tout seul.</p>
      ${bar('wk-run', total ? done / total : 0)}
      <p class="wr-count"><b>${done}</b> / ${total} séries</p>
      <div class="wk-run">${w.ex.map(e => {
        const n = s.sets[e.id] || 0;
        return `
          <div class="wr-ex ${n >= e.sets ? 'full' : ''}" data-ex="${e.id}">
            <div class="wr-name"><b>${esc(e.name)}</b><small>${e.sets} × ${esc(e.reps)}</small></div>
            <div class="wr-sets">${Array.from({ length: e.sets }, (_, i) =>
              `<button type="button" class="${i < n ? 'on' : ''}" data-act="wr-set" data-v="${i + 1}" aria-label="Série ${i + 1}">${i + 1}</button>`).join('')}</div>
          </div>`;
      }).join('')}</div>
      <div class="sync-actions">
        <button type="button" class="btn primary" data-act="wk-finish">Terminer la séance</button>
        <button type="button" class="btn" data-act="wk-cancel">Abandonner</button>
      </div>`;
    afterRender();
  }

  /* ---------- Courbes : charges et poids ---------- */
  function logLift(l) {
    const k = norm(l.name) || l.id;
    const entry = state.liftLog[k] || (state.liftLog[k] = { name: l.name, pts: {} });
    entry.name = l.name;
    entry.unit = l.unit;
    entry.pts[dateKey(new Date())] = l.cur;
  }

  // Petit graphique en ligne. points = [{ d: 'AAAA-MM-JJ', v }]
  function lineChart(points, { color = 'var(--accent)', unit = '', title = '' } = {}) {
    if (!points.length) return '';
    const W = 320, H = 150, L = 38, R = 14, T = 16, B = 22;
    const iw = W - L - R, ih = H - T - B;
    const ts = points.map(p => new Date(p.d + 'T12:00:00').getTime());
    const t0 = Math.min(...ts), t1 = Math.max(...ts);
    const vs = points.map(p => p.v);
    let lo = Math.min(...vs), hi = Math.max(...vs);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.15;
    lo -= pad; hi += pad;
    const X = t => L + (t1 === t0 ? iw / 2 : ((t - t0) / (t1 - t0)) * iw);
    const Y = v => T + ih - ((v - lo) / (hi - lo)) * ih;
    const f = v => String(Math.round(v * 10) / 10).replace('.', ',');
    let grid = '';
    [lo, (lo + hi) / 2, hi].forEach((g, i) => {
      grid += `<line class="grid${i === 0 ? ' base' : ''}" x1="${L}" x2="${W - R}" y1="${Y(g)}" y2="${Y(g)}"/>
        <text class="tick" x="${L - 5}" y="${Y(g) + 3}" text-anchor="end">${f(g)}</text>`;
    });
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${X(ts[i]).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const dots = points.map((p, i) => `
      <circle class="ln-dot" cx="${X(ts[i]).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.5" style="fill:${color}"/>
      <circle class="hit" cx="${X(ts[i]).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="10" data-tip="${esc(fmtDay(p.d))} : ${f(p.v)}${esc(unit)}"/>`).join('');
    const last = points[points.length - 1];
    const lab = (d, x, anchor) => `<text class="tick" x="${x}" y="${H - 6}" text-anchor="${anchor}">${esc(fmtDay(d).replace(/ \d{4}$/, ''))}</text>`;
    return `
      <figure class="chart viz">
        ${title ? `<figcaption>${esc(title)}</figcaption>` : ''}
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title || 'Courbe')}">
          ${grid}
          <path class="ln" d="${path}" style="stroke:${color}"/>
          ${dots}
          <text class="val" x="${X(ts[ts.length - 1])}" y="${Y(last.v) - 8}" text-anchor="end">${f(last.v)}${esc(unit)}</text>
          ${lab(points[0].d, L, 'start')}${points.length > 1 ? lab(last.d, W - R, 'end') : ''}
        </svg>
      </figure>`;
  }

  function liftChartHtml() {
    const keys = Object.keys(state.liftLog).filter(k => Object.keys(state.liftLog[k].pts).length);
    if (!keys.length) return '';
    if (!keys.includes(liftChartSel)) liftChartSel = keys[0];
    const e = state.liftLog[liftChartSel];
    const pts = Object.keys(e.pts).sort().map(d => ({ d, v: e.pts[d] }));
    return `
      <h3 class="sub">Courbe de progression</h3>
      ${keys.length > 1 ? `<select class="chart-select" data-act="lift-chart" aria-label="Exercice">${keys.map(k =>
        `<option value="${esc(k)}" ${k === liftChartSel ? 'selected' : ''}>${esc(state.liftLog[k].name)}</option>`).join('')}</select>` : ''}
      ${lineChart(pts, { color: 'var(--c-gym)', unit: e.unit ? ' ' + e.unit : '', title: e.name })}
      ${pts.length < 2 ? '<p class="hint">La courbe se dessine quand tu changes ta valeur avec − / + au fil des jours.</p>' : ''}`;
  }

  function weightHtml() {
    const today = dateKey(new Date());
    const days = Object.keys(state.weights).sort();
    const pts = days.slice(-60).map(d => ({ d, v: state.weights[d] }));
    const f = v => String(Math.round(v * 10) / 10).replace('.', ',');
    let diff = '';
    if (days.length > 1) {
      const d0 = state.weights[days[0]], d1 = state.weights[days[days.length - 1]];
      const dv = Math.round((d1 - d0) * 10) / 10;
      diff = ` · ${dv > 0 ? '+' : ''}${f(dv)} kg depuis le ${fmtDay(days[0])}`;
    }
    return `
      <h3 class="sub">Poids du corps</h3>
      <form class="add weight-form" data-form="weight" autocomplete="off">
        <input name="kg" type="text" inputmode="decimal" placeholder="Ton poids aujourd'hui (kg)" value="${state.weights[today] ? f(state.weights[today]) : ''}" required maxlength="6" aria-label="Poids en kg">
        <button class="btn primary" type="submit">Noter</button>
      </form>
      ${days.length
        ? `<p class="hint">Dernier : <b>${f(state.weights[days[days.length - 1]])} kg</b>${diff}</p>${lineChart(pts, { color: 'var(--c-gym)', unit: ' kg' })}`
        : '<p class="empty-line">Note ton poids de temps en temps (par exemple chaque lundi matin) pour voir ta courbe.</p>'}`;
  }

  /* ---------- Argent ---------- */
  function renderMoney() {
    const mo = M().money;
    const { y, m: mon } = partsOf(current);
    const dim = new Date(y, mon, 0).getDate();
    const now = new Date();
    const dayDefault = keyOf(now) === current ? now.getDate() : 1;

    const saved = moneySum(mo, 'save');
    const spent = moneySum(mo, 'spend');
    const sp = mo.saveGoal > 0 ? clamp01(saved / mo.saveGoal) : 0;
    const over = mo.budget > 0 && spent > mo.budget;
    const bp = mo.budget > 0 ? clamp01(spent / mo.budget) : 0;
    const left = round2(mo.budget - spent);
    const jarName = id => (state.jars.find(j => j.id === id) || {}).name || '';

    const isNowMonth = keyOf(now) === current;

    // Historique du mois (le plus récent en haut)
    const entries = mo.entries.slice()
      .sort((a, b) => b.day - a.day || (b.t || 0) - (a.t || 0))
      .map(e => {
        const jn = e.type === 'save' && e.jar ? jarName(e.jar) : '';
        const base = e.label || (jn ? '' : (e.type === 'save' ? 'Mis de côté' : 'Dépense'));
        const label = base + (jn ? (base ? ' → ' : 'Cagnotte ') + jn : '');
        const planned = isNowMonth && e.day > now.getDate();
        const dot = e.type === 'spend'
          ? `<i class="cat-dot" style="background:${catColor(e.cat)}" title="${esc(catOf(e.cat).name)}"></i>` : '';
        return `
          <li class="entry ${e.type} ${added.has(e.id) ? 'is-new' : ''} ${planned ? 'planned' : ''}" data-id="${e.id}">
            <span class="e-day">${e.day} ${MOIS_COURT[mon - 1]}</span>
            <span class="e-label" title="${esc(label)}">${dot}${esc(label)}${e.sub ? ' <em class="e-tag">abonnement</em>' : ''}${planned ? ' <em class="e-tag">prévu</em>' : ''}</span>
            <span class="e-amt">${e.type === 'save' ? '+' : '−'}${eur(e.amount)}</span>
            <button type="button" class="x" data-act="money-del" aria-label="Supprimer" title="Supprimer">×</button>
          </li>`;
      }).join('');

    // Où part l'argent : camembert par catégorie
    const breakdown = mo.entries.some(e => e.type === 'spend') ? `
      <h3 class="sub">Où part ton argent ?</h3>
      ${donutChart(mo)}` : '';

    // Abonnements (communs à tous les mois, ajoutés tout seuls aux dépenses)
    const subsTotal = round2(state.subs.filter(s => s.active !== false).reduce((t, s) => t + s.amount, 0));
    const subs = state.subs.map(s => `
      <div class="sub-row ${s.active === false ? 'paused' : ''} ${added.has(s.id) ? 'is-new' : ''}" data-id="${s.id}">
        <i class="cat-dot" style="background:${catColor(s.cat)}"></i>
        <input class="ghost name" data-act="sub-name" value="${esc(s.name)}" aria-label="Nom de l'abonnement" maxlength="40">
        <span class="sub-amt"><input class="num-in" type="text" inputmode="decimal" data-act="sub-amount" value="${String(s.amount).replace('.', ',')}" aria-label="Prix par mois"> €</span>
        <span class="sub-day">le <input class="num-in" type="number" min="1" max="31" inputmode="numeric" data-act="sub-day" value="${s.day}" aria-label="Jour du prélèvement"></span>
        <button type="button" class="btn sm" data-act="sub-toggle">${s.active === false ? 'Reprendre' : 'Pause'}</button>
        <button type="button" class="x" data-act="sub-del" aria-label="Supprimer ${esc(s.name)}" title="Supprimer">×</button>
      </div>`).join('');
    const catOptions = sel => CATS.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('');

    // Cagnottes (projets d'épargne, communes à tous les mois)
    const jars = state.jars.map(j => {
      const s = jarSaved(j.id);
      const p = jarPct(j.id);
      return `
        <div class="card jar ${p >= 1 ? 'is-done' : ''} ${added.has(j.id) ? 'is-new' : ''}" data-id="${j.id}">
          <div class="lift-top">
            <input class="ghost name" data-act="jar-name" value="${esc(j.name)}" aria-label="Nom de la cagnotte" maxlength="40">
            <button type="button" class="x" data-act="jar-del" aria-label="Supprimer ${esc(j.name)}" title="Supprimer">×</button>
          </div>
          <div class="jar-vals">
            <span class="big sm">${eur(s)}</span>
            <span class="of">/ <input class="num-in" type="text" inputmode="decimal" data-act="jar-target" value="${j.target ? String(j.target).replace('.', ',') : ''}" placeholder="?" aria-label="Objectif de la cagnotte"> €</span>
            <button type="button" class="btn sm" data-act="jar-add">+ Ajouter</button>
          </div>
          ${bar('jar-' + j.id, p, 'thin')}
          ${p >= 1 ? `<span class="hanko sm ${fresh.has(j.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
        </div>`;
    }).join('');

    const jarSelect = state.jars.length ? `
      <select name="jar" class="jar-select" aria-label="Cagnotte" ${moneyType === 'save' ? '' : 'hidden'}>
        <option value="">Sans cagnotte</option>
        ${state.jars.map(j => `<option value="${j.id}">${esc(j.name)}</option>`).join('')}
      </select>` : '';

    $('#moneyBody').innerHTML = `
      <div class="money-stats">
        <div class="m-stat">
          <span class="lbl">MIS DE CÔTÉ CE MOIS</span>
          <div class="q-stat">
            <span class="big sm">${eur(saved)}</span>
            <span class="of">/ <input type="text" inputmode="decimal" data-act="money-goal" value="${mo.saveGoal ? String(mo.saveGoal).replace('.', ',') : ''}" placeholder="?" aria-label="Objectif d'épargne du mois"> €</span>
          </div>
          ${bar('save-' + current, sp)}
        </div>
        <div class="m-stat ${over ? 'is-over' : ''}">
          <span class="lbl">DÉPENSÉ CE MOIS</span>
          <div class="q-stat">
            <span class="big sm">${eur(spent)}</span>
            <span class="of">/ <input type="text" inputmode="decimal" data-act="money-budget" value="${mo.budget ? String(mo.budget).replace('.', ',') : ''}" placeholder="?" aria-label="Budget maximum du mois"> € max</span>
          </div>
          ${bar('spend-' + current, bp)}
          ${mo.budget > 0 ? `<p class="hint">${over ? `Budget dépassé de ${eur(-left)}` : `Il te reste ${eur(left)} à dépenser`}</p>` : ''}
        </div>
      </div>
      ${(!mo.saveGoal && !mo.budget) ? '<p class="hint">Remplace les « ? » : combien tu veux mettre de côté ce mois-ci, et ton budget maximum de dépenses.</p>' : ''}
      <div class="piggy">
        <span class="piggy-ico" aria-hidden="true">€</span>
        Tirelire totale : <b>${eur(totalSaved())}</b>
        <small>tout ce que tu as mis de côté depuis le début</small>
      </div>

      <h3 class="sub">Enregistrer</h3>
      <form class="add money-form" data-form="money" autocomplete="off">
        <div class="seg type-seg" role="group" aria-label="Type">
          <button type="button" data-act="money-type" data-v="save" class="${moneyType === 'save' ? 'on' : ''}">+ Mis de côté</button>
          <button type="button" data-act="money-type" data-v="spend" class="${moneyType === 'spend' ? 'on' : ''}">− Dépense</button>
        </div>
        <input name="amount" type="text" inputmode="decimal" placeholder="Montant €" required aria-label="Montant" maxlength="10">
        <input class="wide" name="label" placeholder="${moneyType === 'save' ? 'Note (optionnel)' : 'Pour quoi ? (resto, courses…)'}" maxlength="60" aria-label="Description">
        ${jarSelect}
        <select name="cat" class="cat-select" aria-label="Catégorie" ${moneyType === 'spend' ? '' : 'hidden'}>${catOptions(lastCat)}</select>
        <label class="day-lbl">Jour <input name="day" type="number" min="1" max="${dim}" value="${dayDefault}" inputmode="numeric"></label>
        <button class="btn primary" type="submit">Enregistrer</button>
      </form>

      <h3 class="sub">Historique du mois</h3>
      ${entries ? `<ul class="ledger">${entries}</ul>`
        : "<p class=\"empty-line\">Rien d'enregistré pour l'instant. Chaque fois que tu mets de l'argent de côté ou que tu dépenses quelque chose, note-le juste au-dessus.</p>"}
      ${breakdown}

      <h3 class="sub">Abonnements <small class="sub-note">ajoutés tout seuls chaque mois</small></h3>
      ${subs ? `<div class="sub-list">${subs}</div><p class="hint">Total : <b>${eur(subsTotal)} / mois</b></p>`
        : '<p class="empty-line">Netflix, Crunchyroll, la salle, Spotify… Ajoute-les une fois : ils seront mis dans tes dépenses tous les mois, au bon jour.</p>'}
      <form class="add" data-form="sub" autocomplete="off">
        <input class="wide" name="name" placeholder="Nom (Netflix…)" required maxlength="40">
        <input name="amount" type="text" inputmode="decimal" placeholder="Prix €/mois" required maxlength="10">
        <label class="day-lbl">Le <input name="day" type="number" min="1" max="31" value="${dayDefault}" inputmode="numeric"></label>
        <select name="cat" aria-label="Catégorie">${catOptions('subs')}</select>
        <button class="btn primary" type="submit">Ajouter</button>
      </form>

      <h3 class="sub">Cagnottes</h3>
      ${jars ? `<div class="stack">${jars}</div>`
        : '<p class="empty-line">Une cagnotte = un projet pour lequel tu économises (PS5, voyage, permis…). Elle se remplit quand tu la choisis en enregistrant « Mis de côté ».</p>'}
      <form class="add" data-form="jar" autocomplete="off">
        <input class="wide" name="name" placeholder="Nom du projet" required maxlength="40">
        <input name="target" type="text" inputmode="decimal" placeholder="Objectif €" maxlength="10">
        <button class="btn primary" type="submit">Créer</button>
      </form>`;
  }

  function setMoneyType(type) {
    moneyType = type;
    const form = $('#moneyBody form[data-form="money"]');
    if (!form) return form;
    form.querySelectorAll('[data-act="money-type"]').forEach(b => b.classList.toggle('on', b.dataset.v === type));
    const sel = $('.jar-select', form);
    if (sel) sel.hidden = type !== 'save';
    $('.cat-select', form).hidden = type !== 'spend';
    $('[name="label"]', form).placeholder = type === 'save' ? 'Note (optionnel)' : 'Pour quoi ? (resto, courses…)';
    return form;
  }

  /* ---------- Autres objectifs ---------- */
  function renderTodos() {
    const m = M();
    const items = m.todos.map(t => `
      <li class="todo ${t.done ? 'done' : ''} ${fresh.has(t.id) ? 'fresh' : ''} ${added.has(t.id) ? 'is-new' : ''}" data-id="${t.id}">
        <button type="button" class="check" data-act="todo-toggle" aria-pressed="${t.done}" aria-label="${t.done ? 'Marquer comme pas fait' : 'Marquer comme fait'}"><span class="mark" aria-hidden="true">済</span></button>
        <input class="ghost" data-act="todo-text" value="${esc(t.text)}" aria-label="Objectif">
        <button type="button" class="x" data-act="todo-del" aria-label="Supprimer" title="Supprimer">×</button>
      </li>`).join('');

    $('#todoBody').innerHTML =
      (items ? `<ul class="todo-list">${items}</ul>`
        : emptyBox('Rien pour le moment.', 'Lire un livre, dormir avant minuit, réviser les partiels, appeler la famille…')) + `
      <form class="add" data-form="todo" autocomplete="off">
        <input class="wide" name="text" placeholder="Nouvel objectif" required maxlength="120">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
  }

  /* ---------- Notes ---------- */
  function renderNotes() {
    $('#notesBody').innerHTML =
      `<textarea class="notes" data-act="notes" placeholder="Bilan du mois, idées, ce que tu veux améliorer le mois prochain…" aria-label="Notes du mois">${esc(M().notes)}</textarea>`;
  }

  /* =========================================================
     Abonnements : ajoutés tout seuls aux dépenses de chaque mois
     ========================================================= */
  // Les lignes ont un identifiant fixe (abonnement + mois) : deux appareils créent exactement la même,
  // donc on n'a pas besoin de « dater » la modification pour la synchro.
  function applySubs() {
    const nowKey = keyOf(new Date());
    let changed = false;
    state.subs.forEach(s => {
      if (s.active === false || !/^\d{4}-\d{2}$/.test(s.since || '')) return;
      for (let k = s.since; k <= nowKey; k = shiftKey(k, 1)) {
        if (!state.months[k]) state.months[k] = emptyMonth();
        const mo = state.months[k].money;
        if (!mo.subsDone) mo.subsDone = [];
        if (mo.subsDone.includes(s.id)) continue;
        const { y, m } = partsOf(k);
        mo.entries.push({
          id: `s_${s.id}_${k}`, type: 'spend', amount: s.amount, label: s.name,
          cat: s.cat || 'subs', day: Math.min(s.day, new Date(y, m, 0).getDate()), sub: s.id, t: 0
        });
        mo.subsDone.push(s.id);
        changed = true;
      }
    });
    if (changed) { try { persistLocal(); } catch (e) { /* rien */ } }
    return changed;
  }

  // Après une modif d'abonnement, on met à jour la ligne du mois en cours
  function updateSubEntry(s) {
    const k = keyOf(new Date());
    const mo = state.months[k] && state.months[k].money;
    const e = mo && mo.entries.find(x => x.id === `s_${s.id}_${k}`);
    if (!e) return;
    const { y, m } = partsOf(k);
    e.amount = s.amount;
    e.label = s.name;
    e.cat = s.cat || 'subs';
    e.day = Math.min(s.day, new Date(y, m, 0).getDate());
  }

  /* ---------- Camembert des dépenses ---------- */
  function donutChart(mo) {
    const by = {};
    mo.entries.filter(e => e.type === 'spend').forEach(e => {
      const c = catOf(e.cat).id;
      by[c] = round2((by[c] || 0) + e.amount);
    });
    const total = round2(Object.values(by).reduce((a, b) => a + b, 0));
    if (!total) return '';
    const rows = CATS.filter(c => by[c.id] > 0).map(c => ({ c, v: by[c.id], pct: Math.round((by[c.id] / total) * 100) }));
    const R = 46;
    const C = 2 * Math.PI * R;
    const gap = rows.length > 1 ? 2 : 0;
    let off = 0;
    const segs = rows.map(r => {
      const len = (r.v / total) * C;
      const seg = `<circle class="seg" cx="60" cy="60" r="${R}" stroke="${catColor(r.c.id)}"
        stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"
        data-tip="${esc(r.c.name)} : ${esc(eur(r.v))} (${r.pct} %)"></circle>`;
      off += len;
      return seg;
    }).join('');
    return `
      <div class="donut-wrap viz">
        <svg class="donut" viewBox="0 0 120 120" role="img" aria-label="Dépenses du mois par catégorie">
          <g transform="rotate(-90 60 60)">${segs}</g>
          <text x="60" y="59" class="d-total">${esc(eur(total))}</text>
          <text x="60" y="73" class="d-sub">dépensé</text>
        </svg>
        <ul class="donut-legend">${rows.map(r => `
          <li><i class="cat-dot" style="background:${catColor(r.c.id)}"></i><span>${r.c.name}</span><b>${eur(r.v)}</b><em>${r.pct} %</em></li>`).join('')}
        </ul>
      </div>`;
  }

  /* =========================================================
     AniList : affiches, nombre d'épisodes, dates de sortie
     ========================================================= */
  const AL_FIELDS = 'id type title { romaji english userPreferred } coverImage { large medium } episodes chapters volumes status format seasonYear nextAiringEpisode { airingAt episode } startDate { year month day }';
  const alCache = new Map();
  let alChain = Promise.resolve();
  let alLast = 0;
  let alBusy = false;

  function toAl(m) {
    return {
      id: m.id,
      title: (m.title && (m.title.english || m.title.romaji || m.title.userPreferred)) || '',
      cover: (m.coverImage && (m.coverImage.large || m.coverImage.medium)) || '',
      episodes: m.episodes || 0,
      chapters: m.chapters || 0,
      volumes: m.volumes || 0,
      status: m.status || '',
      next: m.nextAiringEpisode ? { at: m.nextAiringEpisode.airingAt, ep: m.nextAiringEpisode.episode } : null,
      start: m.startDate ? { y: m.startDate.year, m: m.startDate.month, d: m.startDate.day } : null,
      year: m.seasonYear || (m.startDate && m.startDate.year) || null,
      fmt: m.format || '',
      at: Date.now()
    };
  }

  // Une requête à la fois, espacées, pour rester gentil avec l'API
  function alQuery(query, variables) {
    const run = async () => {
      const wait = Math.max(0, alLast + 700 - Date.now());
      if (wait) await new Promise(r => setTimeout(r, wait));
      alLast = Date.now();
      const res = await fetch(ANILIST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      if (!res.ok) throw new Error('AniList ' + res.status);
      const j = await res.json();
      if (j.errors && j.errors.length) throw new Error(j.errors[0].message);
      return j.data;
    };
    const p = alChain.then(run, run);
    alChain = p.catch(() => {});
    return p;
  }

  async function alSearch(text, type = 'ANIME') {
    const k = type + ':' + norm(text);
    if (alCache.has(k)) return alCache.get(k);
    const d = await alQuery(
      `query ($s: String, $t: MediaType) { Page(perPage: 6) { media(search: $s, type: $t, sort: SEARCH_MATCH, isAdult: false) { ${AL_FIELDS} } } }`,
      { s: text, t: type });
    const list = ((d && d.Page && d.Page.media) || []).map(toAl);
    alCache.set(k, list);
    return list;
  }

  // Complète les animes sans affiche et rafraîchit les dates de sortie (toutes les 6 h)
  async function enrichAnimes() {
    if (alBusy || !navigator.onLine) return;
    alBusy = true;
    let changed = false;
    try {
      const mangas = new Set(M().mangas);
      const pool = () => [...M().animes, ...state.watchlist, ...M().mangas];
      for (const x of pool().filter(a => !a.al && !a.alTried).slice(0, 8)) {
        const isManga = mangas.has(x);
        try {
          const r = await alSearch(x.name, isManga ? 'MANGA' : 'ANIME');
          x.alTried = true;
          if (r[0]) {
            x.al = r[0];
            const n = isManga ? r[0].chapters : r[0].episodes;
            if ('ep' in x && !x.total && n) x.total = n;
          }
          changed = true;
        } catch (e) { break; }
      }
      // Animes : toutes les 6 h (ou dès qu'un épisode est sorti). Mangas : une fois par jour.
      const stale = pool().filter(a => a.al && a.al.id && a.al.status !== 'FINISHED' &&
        (Date.now() - (a.al.at || 0) > (mangas.has(a) ? 24 : 6) * 3600e3 || (a.al.next && a.al.next.at * 1000 < Date.now())));
      const ids = [...new Set(stale.map(a => a.al.id))].slice(0, 50);
      if (ids.length) {
        const d = await alQuery(`query ($ids: [Int]) { Page(perPage: 50) { media(id_in: $ids) { ${AL_FIELDS} } } }`, { ids });
        const byId = new Map(((d && d.Page && d.Page.media) || []).map(m => [m.id, toAl(m)]));
        stale.forEach(a => { const n = byId.get(a.al.id); if (n) { a.al = n; changed = true; } });
      }
    } catch (e) { /* hors ligne ou AniList indisponible : on réessaiera plus tard */ }
    alBusy = false;
    if (changed) {
      try { persistLocal(); } catch (e) { /* rien */ }
      softRenderAnime();
    }
  }

  // Liste de suggestions pendant qu'on tape le nom
  function showSuggest(type, input) {
    clearTimeout(suggTimer);
    picked[type] = null;
    const box = $(`[data-sugg="${type}"]`);
    const text = input.value.trim();
    if (text.length < 2) { box.hidden = true; return; }
    suggTimer = setTimeout(async () => {
      let list = [];
      try { list = type === 'book' ? await olSearch(text) : await alSearch(text, type === 'manga' ? 'MANGA' : 'ANIME'); }
      catch (e) { box.hidden = true; return; }
      if (input.value.trim() !== text || document.activeElement !== input) return;
      suggResults[type] = list;
      if (!list.length) {
        box.innerHTML = `<p class="sugg-none">Pas trouvé${type === 'book' ? '' : ' sur AniList'} (tu peux quand même l'ajouter).</p>`;
      } else {
        box.innerHTML = list.map((a, i) => `
          <button type="button" class="sugg-item" data-act="sugg-pick" data-type="${type}" data-i="${i}">
            ${coverImg(a, a.title, 'cover xs')}
            <span><b>${esc(a.title)}</b><small>${[a.author, a.year, a.pages ? a.pages + ' pages' : '', a.episodes ? a.episodes + ' ép.' : '', a.chapters ? a.chapters + ' ch.' : '',
              a.fmt === 'MOVIE' ? 'film' : a.fmt === 'NOVEL' ? 'roman' : a.fmt === 'ONE_SHOT' ? 'one-shot' : ''].filter(Boolean).join(' · ')}</small></span>
          </button>`).join('');
      }
      box.hidden = false;
    }, 350);
  }

  function hideSuggest() {
    document.querySelectorAll('.sugg').forEach(b => { b.hidden = true; });
  }

  /* =========================================================
     XP, rangs et séries
     ========================================================= */
  const dateKey = d => `${keyOf(d)}-${String(d.getDate()).padStart(2, '0')}`;
  const markActive = () => { state.activity[dateKey(new Date())] = 1; };

  function allGymDates() {
    const out = [];
    Object.entries(state.months).forEach(([k, m]) => m.gym.days.forEach(d => out.push(`${k}-${String(d).padStart(2, '0')}`)));
    return out;
  }

  // Jours « actifs » : ce que tu as coché sur le site + jours de salle + argent noté
  function activeDays() {
    const today = dateKey(new Date());
    const set = new Set(Object.keys(state.activity));
    allGymDates().forEach(d => set.add(d));
    Object.entries(state.months).forEach(([k, m]) => {
      m.money.entries.forEach(e => { if (!e.sub) set.add(`${k}-${String(e.day).padStart(2, '0')}`); });
      Object.values(m.habits).forEach(days => Object.keys(days).forEach(d => set.add(`${k}-${String(d).padStart(2, '0')}`)));
    });
    Object.keys(state.daily).forEach(d => set.add(d));
    Object.keys(state.quran.reviews).forEach(d => set.add(d));
    Object.values(state.cali).forEach(x => { if (x.at) set.add(x.at); });
    [state.study, state.mood, state.sleep, state.weights].forEach(o => Object.keys(o).forEach(d => set.add(d)));
    state.workoutLog.forEach(x => set.add(x.date));
    state.books.forEach(b => { if (b.doneAt) set.add(b.doneAt); });
    return new Set([...set].filter(d => d <= today));
  }

  function streaks() {
    const set = activeDays();
    const d = new Date();
    if (!set.has(dateKey(d))) d.setDate(d.getDate() - 1);   // la série tient jusqu'à ce soir
    let now = 0;
    while (set.has(dateKey(d))) { now++; d.setDate(d.getDate() - 1); }
    let best = 0;
    let run = 0;
    let prev = null;
    [...set].sort().forEach(s => {
      const cur = new Date(s + 'T12:00:00');
      run = prev && Math.round((cur - prev) / 86400000) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = cur;
    });
    return { now, best: Math.max(best, now), today: set.has(dateKey(new Date())) };
  }

  function gymWeeks() {
    const nowM = state.months[keyOf(new Date())];
    const target = Math.max(1, Math.round(((nowM ? nowM.gym.goal : 12) || 12) / 4.3));
    const monday = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dateKey(x); };
    const counts = {};
    allGymDates().forEach(s => { const k = monday(new Date(s + 'T12:00:00')); counts[k] = (counts[k] || 0) + 1; });
    const w = new Date();
    const thisWeek = counts[monday(w)] || 0;
    if (thisWeek < target) w.setDate(w.getDate() - 7);   // semaine en cours pas encore finie
    let n = 0;
    while ((counts[monday(w)] || 0) >= target) { n++; w.setDate(w.getDate() - 7); }
    return { n, target, thisWeek };
  }

  const FLAME = `<svg class="flame" viewBox="0 0 24 24" aria-hidden="true">
    <path class="fl-out" d="M12 1.5c.6 3.2-1.8 5-1.6 7.6.9-.6 1.6-1.7 1.8-2.9 2.7 2.1 5.8 5.2 5.8 9.1A6 6 0 0 1 6 15.6c0-2.6 1.3-4.2 2.6-5.6.1 1.2.6 2.2 1.4 2.7C9.6 8.9 10.4 4.6 12 1.5z"/>
    <path class="fl-in" d="M12 11.5c1.6 1.4 3 2.9 3 4.8a3 3 0 0 1-6 0c0-1.2.6-2.1 1.3-2.8.2.6.5 1 1 1.2-.2-1.2 0-2.3.7-3.2z"/>
  </svg>`;

  function gymStreakHtml() {
    const g = gymWeeks();
    return `<p class="gym-streak ${g.n ? '' : 'cold'}">${FLAME}
      ${g.n ? `<b>${g.n} semaine${g.n > 1 ? 's' : ''} d'affilée</b> à ${g.target} séance${g.target > 1 ? 's' : ''} ou plus`
        : `Fais <b>${g.target} séance${g.target > 1 ? 's' : ''}</b> dans la semaine pour lancer ta série`}
      · cette semaine : ${g.thisWeek}/${g.target}</p>`;
  }

  function computeXP() {
    const p = {
      session: 0, surah: 0, episode: 0, animeGoal: 0, animeDone: 0, todo: 0, lift: 0, saveGoal: 0, saved: 0, perfect: 0,
      habit: 0, review: 0, chapter: 0, mangaGoal: 0, mangaDone: 0, quest: 0
    };
    Object.entries(state.months).forEach(([k, m]) => {
      p.session += m.gym.days.length;
      m.animes.forEach(a => {
        p.episode += Math.max(0, a.ep - a.start);
        if (a.total > 0 && a.ep >= a.total) p.animeDone++;
        else if (a.goal > a.start && a.ep >= a.goal) p.animeGoal++;
      });
      m.mangas.forEach(a => {
        p.chapter += Math.max(0, a.ep - a.start);
        if (a.total > 0 && a.ep >= a.total) p.mangaDone++;
        else if (a.goal > a.start && a.ep >= a.goal) p.mangaGoal++;
      });
      state.habits.forEach(h => {
        const days = m.habits[h.id];
        if (days) Object.keys(days).forEach(d => { if (days[d] >= (h.target || 1)) p.habit++; });
      });
      p.todo += m.todos.filter(t => t.done).length;
      p.lift += m.gym.lifts.filter(l => l.target !== l.start && liftPct(l) >= 1).length;
      const saved = moneySum(m.money, 'save');
      p.saved += saved;
      if (m.money.saveGoal > 0 && saved >= m.money.saveGoal) p.saveGoal++;
      if (monthPct(m, k) >= 100) p.perfect++;
    });
    p.surah = learnedTotal();
    p.review = Object.values(state.quran.reviews).reduce((t, l) => t + l.length, 0);
    p.quest = questsDoneTotal();
    p.workout = state.workoutLog.length;
    p.pages = Object.values(state.daily).reduce((t, l) => t + (l.pg || 0), 0);
    p.booksDone = state.books.filter(b => b.status === 'done').length;
    p.study = Object.values(state.study).reduce((t, v) => t + v, 0);
    p.mood = Object.keys(state.mood).length;
    p.sleep = Object.values(state.sleep).filter(s => s.bed && s.wake).length;
    p.extraXp = p.workout * XP.workout + Math.floor(p.pages / 10) * XP.per10pages + p.booksDone * XP.bookDone +
      Math.floor(p.study / 10) * XP.per10min + p.mood * XP.mood + p.sleep * XP.sleep;
    p.skills = 0;
    p.skillXp = 0;
    CALI.SKILLS.forEach(s => {
      if ((state.cali[s.id] || {}).s === 'done') { p.skills++; p.skillXp += s.tier * XP.skillTier; }
    });
    const xp = p.session * XP.session + p.surah * XP.surah + p.episode * XP.episode +
      p.animeGoal * XP.animeGoal + p.animeDone * XP.animeDone + p.todo * XP.todo + p.lift * XP.lift +
      p.saveGoal * XP.saveGoal + Math.floor(p.saved / 10) * XP.per10eur + p.perfect * XP.perfect +
      p.habit * XP.habit + p.review * XP.review + p.chapter * XP.chapter +
      p.mangaGoal * XP.mangaGoal + p.mangaDone * XP.mangaDone + p.quest * XP.quest + p.skillXp + p.extraXp;
    return { xp, p };
  }

  /* ---------- Quêtes de la semaine ---------- */
  const QUEST_POOL = [
    { id: 'gym', need: 'gym', target: () => gymWeeks().target, label: t => `Va ${t} fois à la salle`, m: c => c.gym },
    { id: 'review', need: 'quran', target: () => 5, label: t => `Révise ${t} sourates`, m: c => c.review },
    { id: 'learn', need: 'quran', target: () => 1, label: () => 'Apprends une nouvelle sourate', m: c => c.learn },
    { id: 'ep', need: 'anime', target: () => 6, label: t => `Regarde ${t} épisodes`, m: c => c.ep },
    { id: 'ch', need: 'manga', target: () => 20, label: t => `Lis ${t} chapitres de manga`, m: c => c.ch },
    { id: 'habits', need: 'habits', target: () => 4, label: t => `Fais toutes tes habitudes ${t} jours`, m: c => c.habits },
    { id: 'save', need: 'money', target: () => 20, label: t => `Mets ${eur(t)} de côté`, m: c => c.save, fmt: v => eur(v) },
    { id: 'todo', need: 'todos', target: () => 3, label: t => `Coche ${t} autres objectifs`, m: c => c.todo },
    { id: 'cali', need: 'cali', target: () => 1, label: () => 'Réussis une nouvelle figure de callisthénie', m: c => c.cali },
    { id: 'pages', need: 'books', target: () => 50, label: t => `Lis ${t} pages`, m: c => c.pg },
    { id: 'study', need: 'study', target: () => 120, label: () => 'Révise 2 h dans la semaine', m: c => c.study, fmt: v => hmin(v) },
    { id: 'workout', need: 'workout', target: () => 2, label: t => `Termine ${t} séances types`, m: c => c.workout },
    { id: 'active', need: null, target: () => 5, label: t => `Sois actif ${t} jours dans la semaine`, m: c => c.active }
  ];

  // Ce que tu utilises déjà sur le site (pour te proposer des quêtes qui te parlent)
  function usedParts() {
    const months = Object.values(state.months);
    return {
      gym: allGymDates().length > 0,
      quran: learnedTotal() > 0,
      anime: state.watchlist.length > 0 || months.some(m => m.animes.length),
      manga: months.some(m => m.mangas.length),
      habits: state.habits.length > 0,
      money: months.some(m => m.money.entries.some(e => e.type === 'save') || m.money.saveGoal > 0),
      todos: months.some(m => m.todos.length),
      cali: Object.keys(state.cali).length > 0,
      books: state.books.length > 0,
      study: Object.keys(state.study).length > 0,
      workout: state.workouts.length > 0
    };
  }

  // Tirage au sort fixé par la semaine : tous tes appareils ont les mêmes quêtes
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  function weekCounts(mk, act) {
    const dates = weekDates(mk);
    const gymSet = new Set(allGymDates());
    const c = { gym: 0, review: 0, learn: 0, ep: 0, ch: 0, habits: 0, save: 0, todo: 0, active: 0, cali: 0, pg: 0, study: 0, workout: 0 };
    const learnDays = Object.values(state.quran.learnedOn);
    c.cali = Object.values(state.cali).filter(x => x.s === 'done' && dates.includes(x.at)).length;
    c.workout = state.workoutLog.filter(x => dates.includes(x.date)).length;
    dates.forEach(d => { c.pg += (state.daily[d] || {}).pg || 0; c.study += state.study[d] || 0; });
    dates.forEach(d => {
      const k = d.slice(0, 7);
      const day = Number(d.slice(8));
      const m = state.months[k];
      if (gymSet.has(d)) c.gym++;
      c.review += (state.quran.reviews[d] || []).length;
      c.learn += learnDays.filter(x => x === d).length;
      const log = state.daily[d] || {};
      c.ep += log.ep || 0;
      c.ch += log.ch || 0;
      c.todo += log.todo || 0;
      if (m && state.habits.length && state.habits.every(h => habitDone(m, h, day))) c.habits++;
      if (m) c.save += m.money.entries.reduce((t, e) => t + (e.type === 'save' && e.day === day ? e.amount : 0), 0);
      if (act.has(d)) c.active++;
    });
    c.save = round2(c.save);
    return c;
  }

  function questsFor(mk, used, act) {
    let ids = state.questWeeks[mk];
    if (!Array.isArray(ids) || ids.length !== 3) {
      const rnd = seeded('quetes-' + mk);
      const pool = QUEST_POOL.map(q => ({ q, r: rnd() })).sort((a, b) => a.r - b.r).map(x => x.q);
      ids = [...pool.filter(q => !q.need || used[q.need]), ...pool.filter(q => q.need && !used[q.need])].slice(0, 3).map(q => q.id);
      // Les quêtes de la semaine en cours sont gardées : elles ne changent plus jusqu'à lundi
      if (mk === mondayKey(new Date())) {
        state.questWeeks[mk] = ids;
        Object.keys(state.questWeeks).sort().slice(0, -12).forEach(k => delete state.questWeeks[k]);
        try { persistLocal(); } catch (e) { /* rien */ }
      }
    }
    const c = weekCounts(mk, act);
    return ids.map(id => QUEST_POOL.find(q => q.id === id)).filter(Boolean).map(q => {
      const target = q.target();
      const value = q.m(c);
      return { q, target, value, done: value >= target };
    });
  }

  function questsDoneTotal() {
    const act = activeDays();
    if (!act.size) return 0;
    const used = usedParts();
    const first = [...act].sort()[0];
    const thisWeek = mondayKey(new Date());
    let mk = mondayKey(new Date(first + 'T12:00:00'));
    let n = 0;
    for (let i = 0; i < 520 && mk <= thisWeek; i++) {
      n += questsFor(mk, used, act).filter(x => x.done).length;
      const next = new Date(mk + 'T12:00:00');
      next.setDate(next.getDate() + 7);
      mk = dateKey(next);
    }
    return n;
  }

  function renderQuests() {
    const mk = mondayKey(new Date());
    const list = questsFor(mk, usedParts(), activeDays());
    const left = 7 - ((new Date().getDay() + 6) % 7);
    $('#quests').innerHTML = `
      <div class="quests-head">
        <h3>Quêtes de la semaine <span class="jp" lang="ja">クエスト</span></h3>
        <span class="hint">${left > 1 ? `encore ${left} jours` : 'dernier jour !'} · +${XP.quest} XP chacune</span>
      </div>
      <div class="quest-list">${list.map(({ q, target, value, done }) => {
        const f = q.fmt || (v => String(v));
        return `
          <div class="quest ${done ? 'done' : ''}" data-quest="${q.id}">
            <span class="q-icon" aria-hidden="true">${done ? '済' : '?'}</span>
            <div class="q-main">
              <b>${esc(q.label(target))}</b>
              <span class="xp-bar"><i style="width:${clamp01(value / target) * 100}%"></i></span>
              <small>${esc(f(Math.min(value, target)))} / ${esc(f(target))}</small>
            </div>
            <span class="q-xp">+${XP.quest}</span>
          </div>`;
      }).join('')}</div>`;

    // On fête une quête réussie une seule fois (par appareil)
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem(QUEST_KEY) || 'null'); } catch (e) { /* rien */ }
    const doneIds = list.filter(x => x.done).map(x => `${mk}:${x.q.id}`);
    if (!Array.isArray(seen)) seen = null;
    const fresh2 = seen ? doneIds.filter(id => !seen.includes(id)) : [];
    const keep = [...new Set([...(seen || []), ...doneIds])].filter(id => id >= mk.slice(0, 7));
    try { localStorage.setItem(QUEST_KEY, JSON.stringify(keep)); } catch (e) { /* rien */ }
    fresh2.forEach((id, i) => {
      const qid = id.split(':')[1];
      const item = list.find(x => x.q.id === qid);
      setTimeout(() => {
        celebrate($(`#quests [data-quest="${qid}"]`), 'クエスト完了!');
        toast(`Quête réussie : ${item.q.label(item.target)} (+${XP.quest} XP)`);
      }, 300 + i * 900);
    });
  }

  /* ---------- Comptes à rebours ---------- */
  let cdForm = false;

  function renderCountdowns() {
    const todayKey = dateKey(new Date());
    const today = new Date(todayKey + 'T12:00:00');
    const items = state.countdowns.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).map(c => {
      const days = Math.round((new Date(c.date + 'T12:00:00') - today) / 86400000);
      const label = days > 0 ? `J-${days}` : days === 0 ? "Aujourd'hui !" : 'Passé';
      const cls = days < 0 ? 'past' : days === 0 ? 'now' : days <= 7 ? 'soon' : '';
      return `
        <div class="cd ${cls}" data-cd="${c.id}">
          <b class="cd-j">${label}</b>
          <span class="cd-name">${esc(c.name)}<small>${fmtDay(c.date)}</small></span>
          <button type="button" class="x" data-act="cd-del" aria-label="Supprimer ${esc(c.name)}" title="Supprimer">×</button>
        </div>`;
    }).join('');
    $('#countdowns').innerHTML = `
      <div class="cd-head">
        <h3>Comptes à rebours <span class="jp" lang="ja">カウントダウン</span></h3>
        <button type="button" class="btn sm" data-act="cd-toggle">${cdForm ? 'Fermer' : '+ Ajouter'}</button>
      </div>
      ${items ? `<div class="cd-list">${items}</div>`
        : (cdForm ? '' : '<p class="hint">Partiels, vacances, anniversaire, sortie d\'une saison… Ajoute une date pour voir combien de jours il reste.</p>')}
      ${cdForm ? `
        <form class="add" data-form="cd" autocomplete="off">
          <input class="wide" name="name" placeholder="Quoi ? (Partiels, vacances…)" required maxlength="40">
          <input name="date" type="date" required min="${todayKey}" aria-label="Date">
          <button class="btn primary" type="submit">Ajouter</button>
        </form>` : ''}`;
  }

  /* ---------- Succès ---------- */
  const BADGES = [
    { id: 'first', kanji: '初', name: 'Premier pas', desc: 'Gagner tes premiers XP', v: s => s.xp, goal: 1 },
    { id: 'surah1', kanji: '読', name: 'Première sourate', desc: 'Apprendre 1 sourate', v: s => s.surahs, goal: 1 },
    { id: 'surah10', kanji: '十', name: 'Dix sourates', desc: 'Apprendre 10 sourates', v: s => s.surahs, goal: 10 },
    { id: 'juzamma', kanji: '暗', name: "Juz' Amma", desc: 'Apprendre les sourates 78 à 114', v: s => s.juzAmma, goal: 37 },
    { id: 'surah114', kanji: '全', name: 'Le Coran entier', desc: 'Apprendre les 114 sourates', v: s => s.surahs, goal: 114 },
    { id: 'review20', kanji: '復', name: 'Bonne mémoire', desc: 'Faire 20 révisions', v: s => s.reviews, goal: 20 },
    { id: 'gym10', kanji: '鉄', name: 'Habitué de la salle', desc: 'Faire 10 séances', v: s => s.sessions, goal: 10 },
    { id: 'gym50', kanji: '筋', name: 'Machine', desc: 'Faire 50 séances', v: s => s.sessions, goal: 50 },
    { id: 'gymMonth', kanji: '勝', name: 'Mois de fer', desc: 'Atteindre ton objectif de séances sur un mois', v: s => s.gymMonths, goal: 1 },
    { id: 'ep100', kanji: '百', name: 'Cent épisodes', desc: 'Regarder 100 épisodes', v: s => s.episodes, goal: 100 },
    { id: 'ep500', kanji: '観', name: 'Otaku confirmé', desc: 'Regarder 500 épisodes', v: s => s.episodes, goal: 500 },
    { id: 'animeDone', kanji: '完', name: "Jusqu'au bout", desc: 'Finir un anime', v: s => s.animesDone, goal: 1 },
    { id: 'anime5', kanji: '五', name: 'Collectionneur', desc: 'Finir 5 animes', v: s => s.animesDone, goal: 5 },
    { id: 'ch100', kanji: '頁', name: 'Grand lecteur', desc: 'Lire 100 chapitres de manga', v: s => s.chapters, goal: 100 },
    { id: 'save100', kanji: '金', name: 'Petite fourmi', desc: 'Mettre 100 € de côté', v: s => s.saved, goal: 100, money: true },
    { id: 'save1000', kanji: '富', name: 'Trésor', desc: 'Mettre 1 000 € de côté', v: s => s.saved, goal: 1000, money: true },
    { id: 'jar', kanji: '貯', name: 'Projet financé', desc: 'Remplir une cagnotte', v: s => s.jarsFull, goal: 1 },
    { id: 'budget', kanji: '守', name: 'Budget tenu', desc: 'Finir un mois sans dépasser ton budget', v: s => s.budgetMonths, goal: 1 },
    { id: 'streak7', kanji: '火', name: 'En feu', desc: "7 jours actifs d'affilée", v: s => s.bestStreak, goal: 7 },
    { id: 'streak30', kanji: '炎', name: 'Inarrêtable', desc: "30 jours actifs d'affilée", v: s => s.bestStreak, goal: 30 },
    { id: 'habit30', kanji: '習', name: 'Discipline', desc: 'Réussir 30 habitudes', v: s => s.habits, goal: 30 },
    { id: 'quest5', kanji: '冒', name: 'Aventurier', desc: 'Réussir 5 quêtes', v: s => s.quests, goal: 5 },
    { id: 'perfect', kanji: '極', name: 'Mois parfait', desc: 'Finir un mois à 100 %', v: s => s.perfect, goal: 1 },
    { id: 'lvl10', kanji: '侍', name: 'Samouraï', desc: 'Atteindre le niveau 10', v: s => s.level, goal: 10 },
    { id: 'cali1', kanji: '体', name: 'Premier skill', desc: 'Réussir une figure de callisthénie', v: s => s.skills, goal: 1 },
    { id: 'cali10', kanji: '技', name: 'Street workout', desc: 'Réussir 10 figures de callisthénie', v: s => s.skills, goal: 10 },
    { id: 'caliHs', kanji: '立', name: 'Équilibriste', desc: "Réussir l'équilibre libre", v: s => s.skillHs, goal: 1 },
    { id: 'caliFl', kanji: '翔', name: 'Lévitation', desc: 'Réussir le front lever', v: s => s.skillFl, goal: 1 },
    { id: 'caliT5', kanji: '神', name: 'Dieu du street', desc: 'Réussir une figure de niveau Légende', v: s => s.skillT5, goal: 1 },
    { id: 'book1', kanji: '本', name: 'Premier livre', desc: 'Finir un livre', v: s => s.booksDone, goal: 1 },
    { id: 'book5', kanji: '書', name: 'Bibliothèque', desc: 'Finir 5 livres', v: s => s.booksDone, goal: 5 },
    { id: 'study10', kanji: '学', name: 'Studieux', desc: 'Réviser 10 heures au total', v: s => s.studyH, goal: 10 },
    { id: 'workout10', kanji: '練', name: 'Programme suivi', desc: 'Terminer 10 séances types', v: s => s.workouts, goal: 10 }
  ];

  function badgeStats(xpInfo) {
    const { xp, p } = xpInfo || computeXP();
    const nowKey = keyOf(new Date());
    return {
      xp,
      level: levelOf(xp),
      surahs: p.surah,
      reviews: p.review,
      sessions: p.session,
      episodes: p.episode,
      animesDone: p.animeDone,
      chapters: p.chapter,
      saved: totalSaved(),
      habits: p.habit,
      quests: p.quest,
      perfect: p.perfect,
      juzAmma: Array.from({ length: 37 }, (_, i) => 78 + i).filter(n => state.quran.learned[n]).length,
      gymMonths: Object.values(state.months).filter(m => m.gym.goal > 0 && m.gym.days.length >= m.gym.goal).length,
      jarsFull: state.jars.filter(j => jarPct(j.id) >= 1).length,
      budgetMonths: Object.entries(state.months).filter(([k, m]) => {
        const spent = moneySum(m.money, 'spend');
        return k < nowKey && m.money.budget > 0 && spent > 0 && spent <= m.money.budget;
      }).length,
      bestStreak: streaks().best,
      skills: p.skills,
      skillHs: (state.cali.hs || {}).s === 'done' ? 1 : 0,
      skillFl: (state.cali.fl || {}).s === 'done' ? 1 : 0,
      skillT5: CALI.SKILLS.filter(sk => sk.tier === 5 && (state.cali[sk.id] || {}).s === 'done').length,
      booksDone: p.booksDone,
      studyH: Math.floor(p.study / 60),
      workouts: p.workout
    };
  }

  const badgeIcon = (b, ok) => `<span class="badge ${ok ? 'ok' : ''}" aria-hidden="true">${ok ? b.kanji : '?'}</span>`;

  function checkBadges(stats) {
    const ok = BADGES.filter(b => b.v(stats) >= b.goal);
    $('#badgeCount').textContent = ok.length;
    $('#badgeTotal').textContent = BADGES.length;
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem(BADGE_KEY) || 'null'); } catch (e) { /* rien */ }
    const ids = ok.map(b => b.id);
    try { localStorage.setItem(BADGE_KEY, JSON.stringify([...new Set([...(Array.isArray(seen) ? seen : []), ...ids])])); } catch (e) { /* rien */ }
    if (!Array.isArray(seen)) return;   // première fois : on ne fête pas tout d'un coup
    const nw = ok.filter(b => !seen.includes(b.id));
    if (!nw.length) return;
    const b = nw[0];
    setTimeout(() => {
      const box = overlay(`
        <span class="jp">実績解除!</span>
        ${badgeIcon(b, true).replace('class="badge ok"', 'class="badge ok big"')}
        <span class="lv">${esc(b.name)}</span>
        <span class="new-rank">${esc(b.desc)}${nw.length > 1 ? ` · et ${nw.length - 1} autre${nw.length > 2 ? 's' : ''} !` : ''}</span>`, 12);
      if (!box) toast(`Succès débloqué : ${b.name} !`);
    }, 1100);
  }

  function renderHud() {
    const xpInfo = computeXP();
    const { xp } = xpInfo;
    const lvl = levelOf(xp);
    checkBadges(badgeStats(xpInfo));
    const rank = rankOf(lvl);
    const base = levelNeed(lvl);
    const next = levelNeed(lvl + 1);
    $('#rankLvl').textContent = lvl;
    $('#rankName').innerHTML = `${rank.name} <i lang="ja">${rank.jp}</i>`;
    $('#rankXp').textContent = `${xp - base} / ${next - base} XP`;
    $('#rankBar').style.width = (clamp01((xp - base) / (next - base)) * 100) + '%';

    const st = streaks();
    $('#streak').classList.toggle('cold', !st.now);
    $('#streakTxt').innerHTML = st.now
      ? `<b>${st.now} jour${st.now > 1 ? 's' : ''}</b> d'affilée${st.today ? '' : " · fais un truc aujourd'hui pour la garder"}`
      : "Fais un truc aujourd'hui pour lancer ta série";

    // Animation quand on monte de niveau (une seule fois par niveau et par appareil)
    let seen = null;
    try { seen = localStorage.getItem(LEVEL_KEY); } catch (e) { /* rien */ }
    if (seen === null || lvl > Number(seen)) {
      try { localStorage.setItem(LEVEL_KEY, String(lvl)); } catch (e) { /* rien */ }
      if (seen !== null) {
        const before = rankOf(Number(seen));
        setTimeout(() => levelUp(lvl, before.name !== rank.name ? rank : null), 450);
      }
    }
  }

  function overlay(inner, petals) {
    if (reducedMotion) return null;
    const box = document.createElement('div');
    box.className = 'mega';
    box.innerHTML = `<div class="mega-in">${inner}</div>`;
    for (let i = 0; i < (petals || 0); i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDelay = Math.random() * 1.2 + 's';
      p.style.animationDuration = 2.6 + Math.random() * 2 + 's';
      p.style.setProperty('--drift', (Math.random() * 180 - 90) + 'px');
      box.appendChild(p);
    }
    document.body.appendChild(box);
    const close = () => { box.classList.add('out'); setTimeout(() => box.remove(), 500); };
    box.addEventListener('click', close);
    setTimeout(close, 3200);
    return box;
  }

  function levelUp(lvl, newRank) {
    const box = overlay(`
      <span class="jp">レベルアップ!</span>
      <span class="lv">Niveau ${lvl}</span>
      ${newRank ? `<span class="new-rank">Nouveau rang : <b>${newRank.name}</b> <i lang="ja">${newRank.jp}</i></span>` : ''}`, newRank ? 24 : 0);
    if (!box) { toast(`Niveau ${lvl} !${newRank ? ` Nouveau rang : ${newRank.name}` : ''}`); return; }
    const b = document.createElement('div');
    b.className = 'burst big';
    b.style.left = '50%';
    b.style.top = '50%';
    box.appendChild(b);
  }

  /* =========================================================
     Bilan : graphiques mois par mois
     ========================================================= */
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }

  // Rectangle aux coins du haut arrondis (4 px), posé sur la ligne de base
  function topRounded(x, y, w, h) {
    if (h <= 0) return '';
    const r = Math.min(4, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  // Petit graphique en barres. series = [{ name, color, values }]
  function barChart({ title, keys, series, fmt = v => String(v), unit = '' }) {
    const W = 320, H = 156, L = 34, R = 6, T = 16, B = 22;
    const iw = W - L - R, ih = H - T - B;
    const vmax = niceMax(Math.max(1, ...series.flatMap(s => s.values)));
    const n = keys.length;
    const slot = iw / n;
    const groupW = Math.min(30, slot * 0.62);
    const bw = (groupW - (series.length - 1) * 2) / series.length;
    const y = v => T + ih - (v / vmax) * ih;

    let grid = '';
    const half = vmax / 2;
    const ticks = fmt(half) === fmt(vmax) || fmt(half) === fmt(0) || (Number.isInteger(vmax) && !Number.isInteger(half) && vmax < 10)
      ? [0, vmax] : [0, half, vmax];
    ticks.forEach(t => {
      grid += `<line class="grid${t === 0 ? ' base' : ''}" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/>
        <text class="tick" x="${L - 5}" y="${y(t) + 3}" text-anchor="end">${esc(fmt(t))}</text>`;
    });

    let bars = '';
    keys.forEach((k, i) => {
      const gx = L + slot * i + (slot - groupW) / 2;
      const { m } = partsOf(k);
      series.forEach((s, j) => {
        const v = s.values[i];
        const x = gx + j * (bw + 2);
        bars += `<path d="${topRounded(x, y(v), bw, y(0) - y(v))}" fill="${s.color}"/>`;
      });
      const tip = `${labelOf(k)} : ` + series.map(s => `${series.length > 1 ? s.name + ' ' : ''}${fmt(s.values[i])}${unit}`).join(' · ');
      bars += `<rect class="hit" x="${L + slot * i}" y="${T}" width="${slot}" height="${ih}" data-tip="${esc(tip)}"/>
        <text class="tick" x="${L + slot * i + slot / 2}" y="${H - 6}" text-anchor="middle">${MOIS_COURT[m - 1]}</text>`;
    });

    // Une seule valeur écrite : celle du dernier mois (les autres au survol)
    const last = n - 1;
    const lastTxt = series.length === 1
      ? `<text class="val" x="${L + slot * last + slot / 2}" y="${y(series[0].values[last]) - 5}" text-anchor="middle">${esc(fmt(series[0].values[last]))}</text>` : '';

    const legend = series.length > 1
      ? `<div class="chart-legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';

    return `
      <figure class="chart viz">
        <figcaption>${esc(title)}</figcaption>
        ${legend}
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${grid}${bars}${lastTxt}</svg>
      </figure>`;
  }

  function renderBilan() {
    const keys = Array.from({ length: 6 }, (_, i) => shiftKey(current, i - 5));
    const get = k => state.months[k] || null;
    const rows = keys.map(k => {
      const m = get(k);
      return {
        k,
        pct: m ? monthPct(m, k) : 0,
        sessions: m ? m.gym.days.length : 0,
        surahs: learnedIn(k),
        episodes: m ? m.animes.reduce((t, a) => t + Math.max(0, a.ep - a.start), 0) : 0,
        chapters: m ? m.mangas.reduce((t, a) => t + Math.max(0, a.ep - a.start), 0) : 0,
        saved: m ? moneySum(m.money, 'save') : 0,
        spent: m ? moneySum(m.money, 'spend') : 0
      };
    });
    const col = f => rows.map(f);

    const xpInfo = computeXP();
    const { xp, p } = xpInfo;
    const lvl = levelOf(xp);
    const rank = rankOf(lvl);
    const base = levelNeed(lvl);
    const next = levelNeed(lvl + 1);
    const nextRank = RANKS.find(r => r.lvl > lvl);
    const bs = badgeStats(xpInfo);
    const okCount = BADGES.filter(b => b.v(bs) >= b.goal).length;
    const hasManga = Object.values(state.months).some(m => m.mangas.length);
    const st = streaks();
    const gw = gymWeeks();

    const xpRows = [
      ['Séances de salle', p.session, XP.session],
      ['Sourates apprises', p.surah, XP.surah],
      ['Épisodes vus', p.episode, XP.episode],
      ["Objectifs d'épisodes atteints", p.animeGoal, XP.animeGoal],
      ['Animes terminés', p.animeDone, XP.animeDone],
      ['Autres objectifs cochés', p.todo, XP.todo],
      ['Objectifs de perf atteints', p.lift, XP.lift],
      ["Objectifs d'épargne atteints", p.saveGoal, XP.saveGoal],
      ['Tranches de 10 € mises de côté', Math.floor(p.saved / 10), XP.per10eur],
      ['Mois validés à 100 %', p.perfect, XP.perfect],
      ['Habitudes réussies', p.habit, XP.habit],
      ['Sourates révisées', p.review, XP.review],
      ['Chapitres de manga lus', p.chapter, XP.chapter],
      ["Objectifs de chapitres atteints", p.mangaGoal, XP.mangaGoal],
      ['Mangas terminés', p.mangaDone, XP.mangaDone],
      ['Quêtes réussies', p.quest, XP.quest],
      ['Figures de callisthénie réussies', p.skills, 0, p.skillXp],
      ['Séances types terminées', p.workout, XP.workout],
      ['Tranches de 10 pages lues', Math.floor(p.pages / 10), XP.per10pages],
      ['Livres finis', p.booksDone, XP.bookDone],
      ['Tranches de 10 min de révision', Math.floor(p.study / 10), XP.per10min],
      ['Humeurs notées', p.mood, XP.mood],
      ['Nuits notées', p.sleep, XP.sleep]
    ].filter(r => r[1] > 0);

    // Animes terminés (tous les mois)
    const finished = [];
    Object.keys(state.months).sort().forEach(k => state.months[k].animes.forEach(a => {
      if (a.total > 0 && a.ep >= a.total) finished.push({ a, k });
    }));
    finished.reverse();

    const totalSessions = allGymDates().length;
    const totalEp = Object.values(state.months).reduce((t, m) => t + m.animes.reduce((s, a) => s + Math.max(0, a.ep - a.start), 0), 0);

    $('#bilanBody').innerHTML = `
      <div class="share-box">
        <button type="button" class="btn primary" data-act="share-make">Créer l'image de mon mois</button>
        <div id="shareArea"></div>
      </div>

      <section class="b-rank">
        <div class="b-lvl"><small>NIVEAU</small><b>${lvl}</b></div>
        <div class="b-rank-info">
          <p class="b-rank-name">${rank.name} <i lang="ja">${rank.jp}</i></p>
          <div class="xp-bar big"><i style="width:${clamp01((xp - base) / (next - base)) * 100}%"></i></div>
          <p class="hint">${xp} XP au total · encore <b>${next - xp} XP</b> pour le niveau ${lvl + 1}${nextRank ? ` · rang suivant : ${nextRank.name} ${nextRank.jp} (niveau ${nextRank.lvl})` : ''}</p>
        </div>
      </section>

      <div class="b-cards">
        <div class="b-card">${FLAME}<b>${st.now}</b><span>jour${st.now > 1 ? 's' : ''} d'affilée<br><small>record : ${st.best}</small></span></div>
        <div class="b-card">${FLAME}<b>${gw.n}</b><span>semaine${gw.n > 1 ? 's' : ''} de salle d'affilée<br><small>${gw.target} séances/semaine</small></span></div>
        <div class="b-card"><b>${learnedTotal()}</b><span>sourates apprises<br><small>sur 114</small></span></div>
        <div class="b-card"><b>${eur(totalSaved())}</b><span>mis de côté<br><small>depuis le début</small></span></div>
        <div class="b-card"><b>${totalSessions}</b><span>séances de salle<br><small>au total</small></span></div>
        <div class="b-card"><b>${totalEp}</b><span>épisodes vus<br><small>au total</small></span></div>
      </div>

      <h3 class="sub">Ton année</h3>
      ${heatmapHtml()}

      <h3 class="sub">Succès <small class="sub-note">${okCount} / ${BADGES.length} débloqués</small></h3>
      <div class="badges">${BADGES.map(b => {
        const v = b.v(bs);
        const ok = v >= b.goal;
        const prog = b.money ? `${eur(Math.min(v, b.goal))} / ${eur(b.goal)}` : `${Math.min(Math.floor(v), b.goal)} / ${b.goal}`;
        return `
          <div class="badge-item ${ok ? 'ok' : ''}">
            ${badgeIcon(b, ok)}
            <span><b>${esc(b.name)}</b><small>${esc(b.desc)}${ok ? '' : ` · ${prog}`}</small></span>
          </div>`;
      }).join('')}</div>

      <h3 class="sub">Mois par mois</h3>
      <div class="charts">
        ${barChart({ title: 'Score du mois', keys, series: [{ name: 'Score', color: 'var(--c-anime)', values: col(r => r.pct) }], fmt: v => Math.round(v) + ' %' })}
        ${barChart({ title: 'Séances de salle', keys, series: [{ name: 'Séances', color: 'var(--c-gym)', values: col(r => r.sessions) }], fmt: v => String(Math.round(v)), unit: ' séance(s)' })}
        ${barChart({ title: 'Sourates apprises', keys, series: [{ name: 'Sourates', color: 'var(--c-quran)', values: col(r => r.surahs) }], fmt: v => String(Math.round(v)), unit: ' sourate(s)' })}
        ${barChart({ title: 'Épisodes vus', keys, series: [{ name: 'Épisodes', color: 'var(--c-anime)', values: col(r => r.episodes) }], fmt: v => String(Math.round(v)), unit: ' ép.' })}
        ${hasManga ? barChart({ title: 'Chapitres lus', keys, series: [{ name: 'Chapitres', color: 'var(--c-manga)', values: col(r => r.chapters) }], fmt: v => String(Math.round(v)), unit: ' ch.' }) : ''}
        ${barChart({ title: 'Argent', keys, series: [
          { name: 'Mis de côté', color: 'var(--cat-3)', values: col(r => r.saved) },
          { name: 'Dépensé', color: 'var(--cat-2)', values: col(r => r.spent) }
        ], fmt: v => eur(v) })}
      </div>
      <details class="b-table">
        <summary>Voir les chiffres en tableau</summary>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Mois</th><th>Score</th><th>Séances</th><th>Sourates</th><th>Épisodes</th><th>Chapitres</th><th>Mis de côté</th><th>Dépensé</th></tr></thead>
            <tbody>${rows.map(r => `<tr><td>${labelOf(r.k)}</td><td>${r.pct} %</td><td>${r.sessions}</td><td>${r.surahs}</td><td>${r.episodes}</td><td>${r.chapters}</td><td>${eur(r.saved)}</td><td>${eur(r.spent)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>

      <h3 class="sub">D'où vient ton XP</h3>
      ${xpRows.length ? `<ul class="xp-list">${xpRows.map(r => `<li><span>${r[0]}</span><em>${r[2] ? `${r[1]} × ${r[2]}` : `${r[1]} (selon le niveau)`}</em><b>${r[3] !== undefined ? r[3] : r[1] * r[2]} XP</b></li>`).join('')}</ul>`
        : '<p class="empty-line">Pas encore d\'XP : coche une séance, apprends une sourate ou regarde un épisode pour commencer.</p>'}

      <h3 class="sub">Animes terminés</h3>
      ${finished.length ? `<div class="done-list">${finished.map(({ a, k }) => `
        <div class="done-item">
          ${coverImg(a.al, a.name, 'cover sm')}
          <span><b>${esc(a.name)}</b><small>${labelOf(k)} · ${a.total} ép.</small></span>
          <em class="note">${a.rating ? a.rating + '/10' : 'pas noté'}</em>
        </div>`).join('')}</div>`
        : '<p class="empty-line">Quand tu finis un anime (dernier épisode vu), il arrive ici avec ta note.</p>'}`;
  }

  /* ---------- Carte de l'année ---------- */
  // Un « score » par jour : plus tu fais de choses, plus la case est foncée
  function dayScores() {
    const sc = {};
    const add = (d, n) => { if (d) sc[d] = (sc[d] || 0) + n; };
    allGymDates().forEach(d => add(d, 2));
    Object.entries(state.daily).forEach(([d, l]) => add(d, Math.min(6, (l.ep || 0) + Math.ceil((l.ch || 0) / 5) + (l.todo || 0) + Math.ceil((l.pg || 0) / 20))));
    Object.entries(state.quran.reviews).forEach(([d, l]) => add(d, l.length));
    Object.values(state.quran.learnedOn).forEach(d => add(d, 2));
    Object.entries(state.months).forEach(([k, m]) => {
      Object.entries(m.habits).forEach(([hid, days]) => {
        const h = state.habits.find(x => x.id === hid);
        Object.entries(days).forEach(([d, c]) => add(`${k}-${String(d).padStart(2, '0')}`, c >= ((h && h.target) || 1) ? 1 : 0.5));
      });
      m.money.entries.forEach(e => { if (!e.sub) add(`${k}-${String(e.day).padStart(2, '0')}`, 1); });
    });
    Object.entries(state.study).forEach(([d, v]) => add(d, Math.ceil(v / 25)));
    state.workoutLog.forEach(x => add(x.date, 2));
    Object.values(state.cali).forEach(x => add(x.at, 3));
    [state.mood, state.sleep].forEach(o => Object.keys(o).forEach(d => add(d, 0.5)));
    Object.keys(state.activity).forEach(d => add(d, sc[d] ? 0 : 1));
    return sc;
  }

  function heatmapHtml() {
    const sc = dayScores();
    const today = new Date();
    const todayKey = dateKey(today);
    const start = new Date(mondayKey(today) + 'T12:00:00');
    start.setDate(start.getDate() - 52 * 7);
    const level = v => (!v ? 0 : v < 2 ? 1 : v < 4 ? 2 : v < 7 ? 3 : 4);
    let cols = '';
    let months = '';
    let active = 0;
    let lastMonth = -1;
    for (let w = 0; w < 53; w++) {
      let cells = '';
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + w * 7 + d);
        const k = dateKey(day);
        if (k > todayKey) { cells += '<span class="hm-cell out"></span>'; continue; }
        const v = sc[k] || 0;
        if (v) active++;
        cells += `<span class="hm-cell l${level(v)} ${k === todayKey ? 'today' : ''}" data-tip="${JOURS[day.getDay()]} ${day.getDate()} ${MOIS_COURT[day.getMonth()]} : ${v ? Math.round(v * 2) / 2 + ' point' + (v > 1 ? 's' : '') : 'rien'}"></span>`;
      }
      const first = new Date(start);
      first.setDate(start.getDate() + w * 7);
      if (first.getMonth() !== lastMonth) {
        months += `<span class="hm-month" style="grid-column:${w + 1}">${MOIS_COURT[first.getMonth()]}</span>`;
        lastMonth = first.getMonth();
      }
      cols += `<div class="hm-col">${cells}</div>`;
    }
    return `
      <div class="heatmap viz">
        <div class="hm-scroll" id="hmScroll">
          <div class="hm-months">${months}</div>
          <div class="hm-grid">${cols}</div>
        </div>
        <div class="hm-legend"><span>${active} jour${active > 1 ? 's' : ''} actif${active > 1 ? 's' : ''} sur un an</span>
          <span class="hm-scale">Moins <i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i> Plus</span>
        </div>
      </div>`;
  }

  /* ---------- Image du mois à partager ---------- */
  let shareBlob = null;

  async function makeShareImage() {
    const W = 1080, H = 1920;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const C = n => css.getPropertyValue(n).trim() || '#000';
    const PAPER = C('--paper'), CARD = C('--card'), INK = C('--ink'), RED = C('--red'), MUTED = C('--muted');
    const TITLE = "'Dela Gothic One', 'Yu Gothic', sans-serif";
    const BODY = "'Zen Kaku Gothic New', 'Segoe UI', sans-serif";
    try {
      await Promise.all([
        document.fonts.load(`100px 'Dela Gothic One'`, '月0123456789%NIVÉ'),
        document.fonts.load(`700 40px 'Zen Kaku Gothic New'`, 'abc')
      ]);
    } catch (e) { /* tant pis : polices du système */ }

    // Papier, lignes de vitesse, trames de points
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = INK; ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      ctx.globalAlpha = 0.07; ctx.lineWidth = i % 2 ? 4 : 9;
      ctx.beginPath();
      ctx.moveTo(540 + Math.cos(a) * 330, 400 + Math.sin(a) * 330);
      ctx.lineTo(540 + Math.cos(a) * 1300, 400 + Math.sin(a) * 1300);
      ctx.stroke();
    }
    ctx.restore();
    const dots = (cx, cy, r, maxA) => {
      ctx.fillStyle = INK;
      for (let y = 15; y < H; y += 30) for (let x = 15; x < W; x += 30) {
        const d = Math.hypot(x - cx, y - cy) / r;
        if (d >= 1) continue;
        ctx.globalAlpha = maxA * (1 - d);
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    dots(W, 0, 650, 0.25);
    dots(0, H, 600, 0.2);

    const box = (x, y, w, h, fill, shadow) => {
      if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(x + 14, y + 14, w, h); }
      ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
      ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h);
    };

    // Le mois
    const { y: yr, m } = partsOf(current);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `360px ${TITLE}`;
    ctx.fillStyle = RED; ctx.fillText(`${m}月`, 540 + 16, 470 + 16);
    ctx.fillStyle = INK; ctx.fillText(`${m}月`, 540, 470);
    ctx.font = `86px ${TITLE}`;
    ctx.fillText(`${MOIS[m - 1].toUpperCase()} ${yr}`, 540, 600);

    // Bulle avec le score du mois
    const mo = state.months[current] || emptyMonth();
    const pct = monthPct(mo, current);
    box(170, 660, 740, 220, CARD, INK);
    ctx.fillStyle = INK; ctx.font = `150px ${TITLE}`; ctx.textAlign = 'left';
    ctx.fillText(`${pct}%`, 220, 830);
    ctx.font = `700 46px ${BODY}`;
    ctx.fillText('du mois', 640, 760);
    ctx.fillText('accompli', 640, 820);

    // Rang
    const { xp } = computeXP();
    const lvl = levelOf(xp);
    const rank = rankOf(lvl);
    ctx.fillStyle = INK; ctx.fillRect(170, 930, 740, 120);
    ctx.fillStyle = PAPER; ctx.textAlign = 'center';
    const rankTxt = `NIV. ${lvl} · ${rank.name.toUpperCase()}`;
    let fs = 64;
    ctx.font = `${fs}px ${TITLE}`;
    while (ctx.measureText(rankTxt).width > 680 && fs > 34) { fs -= 2; ctx.font = `${fs}px ${TITLE}`; }
    ctx.fillText(rankTxt, 540, 1012);

    // Les chiffres du mois
    const st = streaks();
    const studyMin = Object.entries(state.study).filter(([d]) => d.startsWith(current)).reduce((t, [, v]) => t + v, 0);
    const stats = [
      ['Séances de salle', String(mo.gym.days.length)],
      ['Sourates apprises', String(learnedIn(current))],
      ['Épisodes vus', String(mo.animes.reduce((t, a) => t + Math.max(0, a.ep - a.start), 0))],
      ['Chapitres lus', String(mo.mangas.reduce((t, a) => t + Math.max(0, a.ep - a.start), 0))],
      ['Mis de côté', eur(moneySum(mo.money, 'save'))],
      ['Révision', hmin(studyMin)],
      ['Livres finis', String(state.books.filter(b => b.doneAt && b.doneAt.startsWith(current)).length)],
      ["Jours d'affilée", String(st.now)]
    ];
    stats.forEach(([label, val], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 90 + col * 470, y = 1110 + row * 180;
      box(x, y, 430, 150, CARD, i % 3 === 0 ? RED : INK);
      ctx.textAlign = 'left';
      ctx.fillStyle = MUTED; ctx.font = `700 34px ${BODY}`;
      ctx.fillText(label.toUpperCase(), x + 26, y + 52);
      ctx.fillStyle = INK; ctx.font = `${val.length > 7 ? 54 : 68}px ${TITLE}`;
      ctx.fillText(val, x + 26, y + 125);
    });

    ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.font = `46px ${TITLE}`;
    ctx.fillText('MES OBJECTIFS DU MOIS', 540, 1860);

    return new Promise(res => cv.toBlob(b => res(b), 'image/png'));
  }

  async function showShareImage() {
    const area = $('#shareArea');
    area.innerHTML = '<p class="hint">Je dessine ton image…</p>';
    shareBlob = await makeShareImage();
    if (!shareBlob) { area.innerHTML = '<p class="hint">Oups, impossible de créer l\'image sur cet appareil.</p>'; return; }
    const url = URL.createObjectURL(shareBlob);
    const file = new File([shareBlob], `mon-mois-${current}.png`, { type: 'image/png' });
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    area.innerHTML = `
      <img class="share-img" src="${url}" alt="Image de ton mois">
      <div class="sync-actions">
        ${canShare ? '<button type="button" class="btn primary" data-act="share-send">Partager</button>' : ''}
        <a class="btn ${canShare ? '' : 'primary'}" href="${url}" download="mon-mois-${current}.png">Télécharger l'image</a>
      </div>
      <p class="hint">Sur iPhone : « Partager » puis « Enregistrer l'image » pour la mettre dans tes photos.</p>`;
  }

  function openModal(id) {
    if (id === 'bilanModal') renderBilan();
    $('#' + id).hidden = false;
    // La carte de l'année défile : on montre les semaines les plus récentes
    const hm = id === 'bilanModal' && $('#hmScroll');
    if (hm) hm.scrollLeft = hm.scrollWidth;
  }

  /* ---------- Bulle d'infos au survol des graphiques ---------- */
  function setupTooltip() {
    const tip = $('#vizTip');
    const show = e => {
      const t = e.target.closest && e.target.closest('.viz [data-tip]');
      if (!t) { tip.hidden = true; return; }
      tip.textContent = t.dataset.tip;
      tip.hidden = false;
      const x = Math.min(window.innerWidth - tip.offsetWidth - 8, e.clientX + 12);
      const y = Math.max(8, e.clientY - tip.offsetHeight - 10);
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    };
    document.addEventListener('pointermove', show);
    document.addEventListener('pointerdown', show);
    document.addEventListener('scroll', () => { tip.hidden = true; }, true);
  }

  /* ---------- Installer comme une appli ---------- */
  let installEvt = null;
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function updateInstallBtn() {
    const b = $('#installBtn');
    if (b) b.hidden = isStandalone() || !(installEvt || isIOS);
  }

  /* ---------- Rendu global ---------- */
  function afterRender() {
    document.querySelectorAll('.bar i[data-w]').forEach(el => {
      const w = parseFloat(el.dataset.w);
      void el.offsetWidth;            // force le navigateur à prendre la largeur de départ
      el.style.width = w + '%';
      barMemo[el.dataset.key] = w;
    });
    fresh.clear();
    added.clear();
  }

  function renderAll(dir) {
    applySubs();
    renderAnime();
    renderQuran();
    renderManga();
    renderStudy();
    renderHabits();
    renderCali();
    renderGym();
    renderMoney();
    renderTodos();
    renderNotes();
    renderHeader();

    const board = $('#board');
    board.classList.remove('enter', 'turn-next', 'turn-prev');
    if (dir !== undefined) {
      void board.offsetWidth;
      board.classList.add(dir === 1 ? 'turn-next' : dir === -1 ? 'turn-prev' : 'enter');
      const kanji = $('#kanji');
      kanji.classList.remove('flip');
      void kanji.offsetWidth;
      kanji.classList.add('flip');
    }
    afterRender();
    enrichAnimes();
  }

  function goMonth(k, dir) {
    if (k === current) return;
    current = k;
    lastGlobal = null;
    quranSearch = '';
    renderAll(dir);
  }

  /* ---------- Effets ---------- */
  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function spawn(cls, x, y, text) {
    const el = document.createElement('div');
    el.className = cls;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (text) el.textContent = text;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 2000);
  }

  function celebrate(el, text, small = false) {
    if (!el || reducedMotion) return;
    const { x, y } = centerOf(el);
    spawn(small ? 'burst small' : 'burst', x, y);
    if (text) spawn('shout', x, y, text);
  }

  function floatText(x, y, text) {
    if (!reducedMotion) spawn('float', x, y, text);
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function megaCelebration() {
    if (reducedMotion) { toast('Tous les objectifs du mois sont validés !'); return; }
    const box = document.createElement('div');
    box.className = 'mega';
    box.innerHTML = '<div class="mega-in"><span class="jp">全部クリア!</span>Tous les objectifs du mois sont validés</div>';
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDelay = Math.random() * 1.2 + 's';
      p.style.animationDuration = 2.6 + Math.random() * 2 + 's';
      p.style.setProperty('--drift', (Math.random() * 180 - 90) + 'px');
      box.appendChild(p);
    }
    document.body.appendChild(box);
    const close = () => { box.classList.add('out'); setTimeout(() => box.remove(), 500); };
    box.addEventListener('click', close);
    setTimeout(close, 3000);
  }

  /* ---------- Notification ---------- */
  let toastTimer = 0;
  function toast(msg, undoSnap, ms) {
    const t = $('#toast');
    const btn = $('.toast-undo', t);
    $('.toast-msg', t).textContent = msg;
    btn.hidden = !undoSnap;
    btn.onclick = undoSnap ? () => {
      state = normalize(JSON.parse(undoSnap));
      save();
      renderAll();
      t.classList.remove('show');
    } : null;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms || (undoSnap ? 5000 : 2600));
  }

  /* ---------- Reprendre le mois dernier ---------- */
  function copyPrevious() {
    const pk = shiftKey(current, -1);
    const p = state.months[pk];
    if (isEmpty(p)) { toast(`Rien à reprendre de ${labelOf(pk)}.`); return; }

    const snap = snapshot();
    const m = M();
    const has = (list, field, value) => list.some(x => String(x[field]).toLowerCase() === String(value).toLowerCase());

    ['animes', 'mangas'].forEach(list => p[list]
      .filter(a => !(a.total > 0 && a.ep >= a.total))
      .forEach(a => {
        if (has(m[list], 'name', a.name)) return;
        const delta = Math.max(1, a.goal - a.start);
        const goal = a.total > 0 ? Math.min(a.total, a.ep + delta) : a.ep + delta;
        const id = uid();
        m[list].push({ id, name: a.name, ep: a.ep, start: a.ep, goal, total: a.total, al: a.al || null });
        added.add(id);
      }));

    if (!m.quranGoal) m.quranGoal = p.quranGoal;
    if (!m.gym.days.length) m.gym.goal = p.gym.goal;

    p.gym.lifts.forEach(l => {
      if (has(m.gym.lifts, 'name', l.name)) return;
      const id = uid();
      m.gym.lifts.push({ id, name: l.name, cur: l.cur, start: l.cur, target: l.target, unit: l.unit });
      added.add(id);
    });

    if (!m.money.saveGoal) m.money.saveGoal = p.money.saveGoal;
    if (!m.money.budget) m.money.budget = p.money.budget;

    p.todos.forEach(t => {
      if (has(m.todos, 'text', t.text)) return;
      const id = uid();
      m.todos.push({ id, text: t.text, done: false });
      added.add(id);
    });

    save();
    renderAll();
    toast(`Objectifs de ${labelOf(pk)} repris.`, snap);
  }

  /* ---------- Sauvegarde / chargement fichier ---------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mes-objectifs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast('Fichier de sauvegarde téléchargé.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data.months !== 'object') throw new Error('format');
        const snap = snapshot();
        state = normalize(data);
        save();
        lastGlobal = null;
        renderAll(0);
        toast('Sauvegarde chargée.', snap);
      } catch (e) {
        toast("Ce fichier n'est pas une sauvegarde valide.");
      }
    };
    reader.readAsText(file);
  }

  /* =========================================================
     Synchro téléphone ↔ PC (via un gist secret GitHub)
     ========================================================= */
  let syncBusy = false;
  let syncAgain = false;
  let syncPending = false;
  let syncTimer = 0;
  let syncError = '';
  let pendingChoice = null;   // données en ligne quand il faut choisir lesquelles garder
  let lastScopes = null;

  function loadSync() {
    try {
      const s = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
      return (s && typeof s === 'object') ? s : {};
    } catch (e) { return {}; }
  }

  function saveSync() {
    try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* rien */ }
  }

  function syncErr(msg, status) {
    const e = new Error(msg);
    e.status = status;
    e.custom = true;
    return e;
  }

  // Appel à l'API GitHub
  async function gh(path, opts = {}) {
    const headers = {
      Authorization: 'Bearer ' + (opts.token || sync.token),
      Accept: 'application/vnd.github+json'
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    const res = await fetch('https://api.github.com' + path, {
      method: opts.method || 'GET',
      headers,
      cache: 'no-store',
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      keepalive: Boolean(opts.keepalive)
    });
    lastScopes = res.headers.get('x-oauth-scopes');
    if (!res.ok) {
      let msg = `GitHub a répondu une erreur (${res.status}).`;
      if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
        msg = "Trop de synchros d'un coup : GitHub demande d'attendre un peu.";
      } else if (res.status === 403) {
        msg = "GitHub refuse l'accès. Vérifie que la case « gist » était cochée quand tu as créé la clé.";
      }
      throw syncErr(msg, res.status);
    }
    return res.status === 204 ? null : res.json();
  }

  function friendly(e, connecting) {
    if (e && e.status === 401) {
      return connecting
        ? "Cette clé ne marche pas. Vérifie que tu l'as copiée en entier (elle commence par ghp_)."
        : 'GitHub refuse ta clé (supprimée ou expirée). Clique sur « Déconnecter cet appareil » puis colle une nouvelle clé.';
    }
    if (e && e.custom) return e.message;
    return "Pas d'internet pour le moment. Ça se synchronisera tout seul plus tard.";
  }

  // Lit les données en ligne : { data, updatedAt } ou null s'il n'y a rien
  async function fetchGist() {
    if (!sync.gistId) return null;
    let g;
    try { g = await gh('/gists/' + sync.gistId); }
    catch (e) { if (e.status === 404) return null; throw e; }
    const f = g && g.files && g.files[GIST_FILE];
    if (!f) return null;
    let content = f.content;
    if (f.truncated && f.raw_url) content = await (await fetch(f.raw_url, { cache: 'no-store' })).text();
    try {
      const data = JSON.parse(content);
      const updatedAt = num(data.updatedAt, 0);
      sync.remoteAt = updatedAt;
      return { data, updatedAt };
    } catch (e) { return null; }
  }

  // Envoie les données de cet appareil en ligne
  async function pushGist(keepalive) {
    if (!state.updatedAt) state.updatedAt = Date.now();
    const files = { [GIST_FILE]: { content: JSON.stringify(serializable()) } };
    if (sync.gistId) {
      try {
        await gh('/gists/' + sync.gistId, { method: 'PATCH', body: { files }, keepalive });
        sync.remoteAt = state.updatedAt;
        saveSync();
        return;
      } catch (e) { if (e.status !== 404) throw e; }
    }
    const g = await gh('/gists', { method: 'POST', body: { description: GIST_DESC, public: false, files } });
    sync.gistId = g.id;
    sync.remoteAt = state.updatedAt;
    saveSync();
  }

  // Remplace les données de cet appareil par celles en ligne (le thème reste celui de l'appareil)
  function applyRemote(data, notify) {
    const snap = snapshot();
    const theme = state.theme;
    state = normalize(JSON.parse(JSON.stringify(data)));
    state.theme = theme;
    try { persistLocal(); } catch (e) { /* rien */ }
    lastGlobal = null;
    renderAll();
    if (notify) toast('Mis à jour avec ton autre appareil ✓', snap);
  }

  function isBlank(s) {
    const n = normalize(JSON.parse(JSON.stringify(s || {})));
    return Object.values(n.months).every(isEmpty) && !Object.keys(n.quran.learned).length && !n.jars.length;
  }

  function sameData(a, b) {
    const pick = s => {
      const n = normalize(JSON.parse(JSON.stringify(s || {})));
      const blank = JSON.stringify(emptyMonth());
      const months = {};
      Object.keys(n.months).sort().forEach(k => {
        if (JSON.stringify(n.months[k]) !== blank) months[k] = n.months[k];
      });
      return JSON.stringify({ months, learned: n.quran.learned, jars: n.jars });
    };
    return pick(a) === pick(b);
  }

  // Compare avec la version en ligne : la plus récente gagne
  async function syncNow() {
    if (!sync.token) return;
    if (syncBusy) { syncAgain = true; return; }
    syncBusy = true;
    clearTimeout(syncTimer);
    syncPending = false;
    setSyncStatus('busy');
    try {
      if (sync.needsChoice) {
        if (!pendingChoice) pendingChoice = await fetchGist();
        if (pendingChoice) {
          syncError = 'Choisis quelles données garder : clique sur le bouton de synchro.';
          setSyncStatus('err');
          return;
        }
        sync.needsChoice = false;
        saveSync();
      }
      const remote = await fetchGist();
      const localAt = num(state.updatedAt, 0);
      if (remote && remote.updatedAt > localAt) applyRemote(remote.data, true);
      else if (!remote || localAt > remote.updatedAt) await pushGist();
      sync.lastSync = Date.now();
      syncError = '';
      saveSync();
      setSyncStatus('ok');
    } catch (e) {
      syncError = friendly(e);
      setSyncStatus('err');
    } finally {
      syncBusy = false;
      if (!$('#syncModal').hidden) renderSyncModal();
      if (syncAgain) { syncAgain = false; syncNow(); }
    }
  }

  function scheduleSync() {
    if (!sync.token) return;
    syncPending = true;
    setSyncStatus('busy');
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 1500);
  }

  // Quand on quitte la page ou change d'appli : on envoie tout de suite ce qui attend
  function flushSync() {
    if (!syncPending || !sync.token || sync.needsChoice || syncBusy) return;
    clearTimeout(syncTimer);
    syncPending = false;
    pushGist(true)
      .then(() => { sync.lastSync = Date.now(); saveSync(); setSyncStatus('ok'); })
      .catch(() => { syncPending = true; });
  }

  function finishSync(msg) {
    sync.lastSync = Date.now();
    syncError = '';
    saveSync();
    setSyncStatus('ok');
    renderSyncModal();
    if (msg) toast(msg);
  }

  // Première connexion de cet appareil avec la clé
  async function connectSync(token, btn) {
    token = String(token || '').trim();
    if (!token) return;
    syncError = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }
    try {
      const user = await gh('/user', { token });
      if (lastScopes !== null && !lastScopes.split(',').map(s => s.trim()).includes('gist')) {
        throw syncErr("Cette clé n'a pas la case « gist » cochée. Recrée-la avec le lien de l'étape 1.", 0);
      }
      const gists = await gh('/gists?per_page=100', { token });
      const found = Array.isArray(gists) ? gists.find(g => g.files && g.files[GIST_FILE]) : null;
      sync = { token, login: user.login, gistId: found ? found.id : null, lastSync: 0, remoteAt: 0 };
      saveSync();

      const remote = found ? await fetchGist() : null;
      if (!remote || isBlank(remote.data)) {
        await pushGist();
        finishSync('Synchro activée ✓ Fais pareil sur ton autre appareil.');
      } else if (isBlank(state) || sameData(remote.data, state)) {
        applyRemote(remote.data, false);
        finishSync('Synchro activée ✓ Tes données sont arrivées.');
      } else {
        pendingChoice = remote;
        sync.needsChoice = true;
        saveSync();
        setSyncStatus('err');
        renderSyncModal();
      }
    } catch (e) {
      sync = {};
      try { localStorage.removeItem(SYNC_KEY); } catch (err) { /* rien */ }
      syncError = friendly(e, true);
      setSyncStatus('off');
      renderSyncModal();
    }
  }

  function setSyncStatus(st) {
    const b = $('#syncBtn');
    if (!b) return;
    const s = sync.token ? st : 'off';
    b.dataset.state = s;
    b.textContent = { off: 'Synchro tél ↔ PC', ok: 'Synchronisé', busy: 'Synchro…', err: 'Synchro en pause' }[s];
    b.title = s === 'err' ? syncError
      : s === 'off' ? 'Avoir les mêmes données sur ton téléphone et ton PC'
        : 'Synchronisé avec ton compte GitHub';
  }

  const dateTime = t => new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  function renderSyncModal() {
    const box = $('#syncBody');
    const err = syncError ? `<p class="sync-err">${esc(syncError)}</p>` : '';

    if (pendingChoice) {
      box.innerHTML = `
        <p><b>Tu as déjà des données en ligne</b> (dernière modif : ${pendingChoice.updatedAt ? dateTime(pendingChoice.updatedAt) : '?'})
          <b>et</b> d'autres données sur cet appareil.</p>
        <p>Lesquelles tu gardes ? Les autres seront remplacées.</p>
        <div class="sync-actions">
          <button type="button" class="btn primary" data-act="sync-take-remote">Prendre celles en ligne</button>
          <button type="button" class="btn" data-act="sync-keep-local">Garder celles de cet appareil</button>
        </div>
        <p class="hint">En général, sur ton 2e appareil, choisis « Prendre celles en ligne ».</p>`;
      return;
    }

    if (sync.token) {
      box.innerHTML = `
        <p class="sync-ok">Synchro activée avec le compte GitHub <b>${esc(sync.login || '?')}</b>.</p>
        <p>Dernière synchro : <b>${sync.lastSync ? dateTime(sync.lastSync) : 'pas encore'}</b></p>
        ${err}
        <p>Ça marche tout seul : chaque changement est envoyé, et quand tu ouvres le site sur ton autre appareil, il récupère la dernière version.</p>
        <div class="sync-actions">
          <button type="button" class="btn primary" data-act="sync-now">Synchroniser maintenant</button>
          <button type="button" class="btn" data-act="sync-logout">Déconnecter cet appareil</button>
        </div>
        <p class="hint">Sur ton autre appareil : ouvre le même site, clique sur « Synchro tél ↔ PC » et colle ta clé.</p>`;
      return;
    }

    box.innerHTML = `
      <p>Tes données seront gardées dans ton compte GitHub, dans un « gist » secret.
        Tu fais ça <b>une seule fois</b> sur chaque appareil.</p>
      <ol class="steps">
        <li><b>Crée ta clé.</b> Ouvre <a href="${TOKEN_URL}" target="_blank" rel="noopener">cette page GitHub</a>
          (la case <code>gist</code> est déjà cochée). Choisis une durée, par exemple 1 an, descends tout en bas,
          clique sur <b>Generate token</b> et copie la clé (elle commence par <code>ghp_</code>).</li>
        <li><b>Colle-la ici :</b>
          <form class="token-row" data-form="sync" autocomplete="off">
            <input name="token" type="password" placeholder="ghp_…" required spellcheck="false" autocapitalize="off" aria-label="Clé GitHub">
            <button class="btn primary" type="submit">Connecter</button>
          </form>
        </li>
        <li><b>Sur ton autre appareil</b> (téléphone ou PC) : ouvre le site, clique sur « Synchro tél ↔ PC » et colle la même clé.</li>
      </ol>
      ${err}
      <p class="hint">La clé reste seulement sur l'appareil où tu la colles, et elle donne accès uniquement à tes gists. Ne la donne à personne.</p>`;
  }

  function openSyncModal() {
    renderSyncModal();
    $('#syncModal').hidden = false;
    const inp = $('#syncBody input[name="token"]');
    if (inp) setTimeout(() => inp.focus(), 60);
    if (sync.needsChoice && !pendingChoice) syncNow();
  }

  function closeSyncModal() {
    $('#syncModal').hidden = true;
  }

  /* ---------- Thème ---------- */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
  }

  /* =========================================================
     Réglages : couleurs, mode nuit, code secret, sauvegarde
     ========================================================= */
  function loadPrefs() {
    try { const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); return (p && typeof p === 'object') ? p : {}; }
    catch (e) { return {}; }
  }
  const prefs = loadPrefs();
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* rien */ } };
  const restSeconds = () => prefs.rest || 90;

  function applyPalette(id) {
    const ok = PALETTES.some(p => p.id === id) ? id : 'classique';
    if (ok === 'classique') delete document.documentElement.dataset.palette;
    else document.documentElement.dataset.palette = ok;
  }

  async function sha(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mes-objectifs:' + text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const hasLock = () => { try { return Boolean(localStorage.getItem(LOCK_KEY)); } catch (e) { return false; } };

  function renderSettings() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const pal = prefs.palette || 'classique';
    const lock = hasLock();
    $('#settingsBody').innerHTML = `
      <h3 class="sub">Couleurs</h3>
      <div class="palettes">${PALETTES.map(p => `
        <button type="button" class="pal ${p.id === pal ? 'on' : ''}" data-act="set-palette" data-v="${p.id}" aria-pressed="${p.id === pal}">
          <span class="pal-sw">${p.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>${p.name}
        </button>`).join('')}
      </div>

      <h3 class="sub">Mode</h3>
      <div class="seg" role="group" aria-label="Mode">
        <button type="button" data-act="set-theme" data-v="light" class="${theme === 'light' ? 'on' : ''}">Jour</button>
        <button type="button" data-act="set-theme" data-v="dark" class="${theme === 'dark' ? 'on' : ''}">Nuit</button>
      </div>

      <h3 class="sub">Code secret</h3>
      ${lock ? `
        <p class="sync-ok">Code activé sur cet appareil.</p>
        <form class="token-row" data-form="lock-off" autocomplete="off">
          <input name="code" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="Code actuel" required aria-label="Code actuel">
          <button class="btn" type="submit">Enlever le code</button>
        </form>`
        : `
        <p>Un code à 4 chiffres est demandé à l'ouverture de l'appli (et après 5 min sans l'utiliser).</p>
        <form class="token-row" data-form="lock-on" autocomplete="off">
          <input name="code1" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="Code (4 chiffres)" required aria-label="Nouveau code">
          <input name="code2" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="Encore une fois" required aria-label="Confirmer le code">
          <button class="btn primary" type="submit">Activer</button>
        </form>`}
      <p class="hint">Le code reste sur cet appareil seulement. Il empêche qu'on fouille dans ton appli, mais ce n'est pas un coffre-fort.</p>

      <h3 class="sub">Minuteur de repos</h3>
      <div class="seg" role="group" aria-label="Repos par défaut">${[60, 90, 120, 180].map(s =>
        `<button type="button" data-act="set-rest" data-v="${s}" class="${restSeconds() === s ? 'on' : ''}">${s < 120 ? s + ' s' : s / 60 + ' min'}</button>`).join('')}
      </div>

      <h3 class="sub">Sauvegarde</h3>
      <div class="sync-actions">
        <button type="button" class="btn" data-act="export">Sauvegarder un fichier</button>
        <label class="btn" for="importFile">Charger un fichier</label>
      </div>
      <p class="hint">Le fichier est une copie de secours de toutes tes données (sans ta clé de synchro).</p>`;
  }

  /* =========================================================
     Minuteurs (sans aucun son) : repos, révision, pause
     ========================================================= */
  let timer = loadTimer();   // { kind: 'rest' | 'study' | 'break', end, total, label, start }
  let timerInt = 0;

  function loadTimer() {
    try { const t = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null'); return t && t.end ? t : null; }
    catch (e) { return null; }
  }
  function saveTimer() {
    try { if (timer) localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); else localStorage.removeItem(TIMER_KEY); }
    catch (e) { /* rien */ }
  }
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function startTimer(kind, seconds, label) {
    if (timer && timer.kind === 'study') stopTimer();
    timer = { kind, end: Date.now() + seconds * 1000, total: seconds, label, start: Date.now() };
    saveTimer();
    clearInterval(timerInt);
    timerInt = setInterval(tickTimer, 250);
    tickTimer();
  }

  // Arrête le minuteur. Pour la révision, on compte les minutes déjà faites.
  function stopTimer() {
    const t = timer;
    timer = null;
    saveTimer();
    clearInterval(timerInt);
    const box = $('#timerFloat');
    box.hidden = true;
    if (t && t.kind === 'study') {
      const mins = Math.floor((Math.min(Date.now(), t.end) - t.start) / 60000);
      if (mins > 0) addStudy(mins, t.start);
    }
    return t;
  }

  function tickTimer() {
    const box = $('#timerFloat');
    if (!timer) { box.hidden = true; return; }
    if (!timerInt) timerInt = setInterval(tickTimer, 250);
    const left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
    box.hidden = false;
    box.dataset.kind = timer.kind;
    $('#tfLabel').textContent = timer.label;
    $('#tfTime').textContent = mmss(left);
    box.style.setProperty('--p', (100 - clamp01(left / timer.total) * 100) + '%');
    if (left <= 0) timerDone();
  }

  function timerDone() {
    const t = stopTimer();
    if (!t) return;
    try { if (navigator.vibrate) navigator.vibrate([250, 120, 250]); } catch (e) { /* rien */ }
    if (t.kind === 'rest') {
      overlay('<span class="jp">いくぞ!</span><span class="lv">Repos terminé</span><span class="new-rank">Série suivante, c\'est reparti !</span>');
    } else if (t.kind === 'study') {
      overlay(`<span class="jp">お疲れ!</span><span class="lv">${Math.round(t.total / 60)} min de révision</span><span class="new-rank">Bien joué ! Pause de 5 min lancée.</span>`, 10);
      startTimer('break', 300, 'Pause');
    } else {
      overlay('<span class="jp">再開!</span><span class="lv">Pause finie</span><span class="new-rank">On y retourne quand tu veux.</span>');
    }
  }

  function addStudy(mins, ts) {
    const k = dateKey(new Date(ts || Date.now()));
    state.study[k] = (state.study[k] || 0) + mins;
    save();
    renderStudy();
    renderHeader();
    afterRender();
  }

  /* ---------- Chrono des figures « à tenir » ---------- */
  let chrono = null;   // { sid, phase: 'ready' | 'count' | 'run' | 'done', t0, result, raf }
  const goalSeconds = sk => { const m = /tenir\s+(\d+)\s*s/i.exec(sk.goal); return m ? Number(m[1]) : 0; };
  const fmtSec = s => s.toFixed(1).replace('.', ',') + ' s';

  function openChrono(sid) {
    chrono = { sid, phase: 'ready' };
    $('#chrono').hidden = false;
    drawChrono();
  }

  function closeChrono() {
    if (chrono && chrono.raf) cancelAnimationFrame(chrono.raf);
    if (chrono && chrono.countTimer) clearInterval(chrono.countTimer);
    chrono = null;
    $('#chrono').hidden = true;
  }

  function drawChrono() {
    if (!chrono) return;
    const sk = CALI.SKILLS.find(s => s.id === chrono.sid);
    const x = state.cali[sk.id] || {};
    const goal = goalSeconds(sk);
    const tier = `style="--tier: var(--tier-${sk.tier})"`;
    const box = $('#chronoBody');
    if (chrono.phase === 'ready') {
      box.innerHTML = `
        <div class="ch-fig" ${tier}>${CALI.svg(sk)}</div>
        <h2>${esc(sk.name)}</h2>
        <p class="ch-info">Objectif : <b>${goal} s</b>${x.best ? ` · Record : <b>${fmtSec(x.best)}</b>` : ''}</p>
        <button type="button" class="btn primary big" data-act="chrono-go">Partir (3, 2, 1…)</button>
        <button type="button" class="btn" data-act="chrono-close">Fermer</button>
        <p class="hint">Tu as 3 secondes pour te mettre en place. Touche l'écran pour arrêter.</p>`;
    } else if (chrono.phase === 'count') {
      box.innerHTML = `<div class="ch-count" ${tier}>${chrono.count}</div><p class="ch-info">Mets-toi en place…</p>`;
    } else if (chrono.phase === 'run') {
      box.innerHTML = `
        <div class="ch-time" id="chTime">0,0</div>
        <p class="ch-info">Objectif : ${goal} s${x.best ? ` · Record : ${fmtSec(x.best)}` : ''}</p>
        <div class="ch-goal" ${tier}><i id="chGoal"></i></div>
        <button type="button" class="btn primary big" data-act="chrono-stop">Stop</button>`;
    } else {
      const r = chrono.result;
      const reached = goal && r >= goal;
      box.innerHTML = `
        <div class="ch-time done">${fmtSec(r)}</div>
        <p class="ch-msg">${chrono.record ? '<b>Nouveau record !</b> ' : ''}${reached ? 'Objectif atteint !' : goal ? `Encore ${fmtSec(Math.max(0, goal - r))} pour l'objectif` : ''}</p>
        <div class="sync-actions">
          ${reached && x.s !== 'done' ? '<button type="button" class="btn primary" data-act="chrono-win">Marquer réussi !</button>' : ''}
          <button type="button" class="btn" data-act="chrono-go">Recommencer</button>
          <button type="button" class="btn" data-act="chrono-close">Fermer</button>
        </div>`;
    }
  }

  function chronoGo() {
    if (!chrono) return;
    chrono.phase = 'count';
    chrono.count = 3;
    drawChrono();
    chrono.countTimer = setInterval(() => {
      chrono.count--;
      if (chrono.count > 0) { drawChrono(); return; }
      clearInterval(chrono.countTimer);
      chrono.phase = 'run';
      chrono.t0 = performance.now();
      drawChrono();
      const sk = CALI.SKILLS.find(s => s.id === chrono.sid);
      const goal = goalSeconds(sk) || 10;
      const loop = () => {
        if (!chrono || chrono.phase !== 'run') return;
        const s = (performance.now() - chrono.t0) / 1000;
        const el = $('#chTime');
        if (el) el.textContent = s.toFixed(1).replace('.', ',');
        const g = $('#chGoal');
        if (g) g.style.width = Math.min(100, (s / goal) * 100) + '%';
        if (g && s >= goal) g.parentElement.classList.add('ok');
        chrono.raf = requestAnimationFrame(loop);
      };
      loop();
    }, 1000);
  }

  function chronoStop() {
    if (!chrono || chrono.phase !== 'run') return;
    cancelAnimationFrame(chrono.raf);
    const r = Math.round(((performance.now() - chrono.t0) / 1000) * 10) / 10;
    chrono.result = r;
    chrono.phase = 'done';
    const sid = chrono.sid;
    const x = state.cali[sid] || {};
    chrono.record = r > (x.best || 0);
    if (chrono.record) {
      x.best = r;
      x.rec = fmtSec(r);
      if (!x.s) x.s = 'work';
      state.cali[sid] = x;
      markActive();
      save();
      renderCali();
      afterRender();
    }
    drawChrono();
  }

  /* ---------- Écran de verrouillage ---------- */
  let wiping = false;   // vrai pendant qu'on efface les données (on ne réenregistre rien)
  let lockInput = '';
  let hiddenAt = 0;

  function showLock() {
    if (!hasLock()) return;
    lockInput = '';
    drawLockDots();
    document.documentElement.classList.add('locked');
  }

  function drawLockDots(state2) {
    const dots = $('#lockDots');
    dots.className = 'lock-dots' + (state2 ? ' ' + state2 : '');
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i < lockInput.length));
  }

  async function lockKey(v) {
    if (v === 'del') lockInput = lockInput.slice(0, -1);
    else if (lockInput.length < 4) lockInput += v;
    drawLockDots();
    if (lockInput.length < 4) return;
    let ok = false;
    try { ok = (await sha(lockInput)) === localStorage.getItem(LOCK_KEY); } catch (e) { ok = false; }
    if (ok) {
      document.documentElement.classList.remove('locked');
      lockInput = '';
      drawLockDots();
    } else {
      drawLockDots('wrong');
      setTimeout(() => { lockInput = ''; drawLockDots(); }, 550);
    }
  }

  /* =========================================================
     Événements
     ========================================================= */
  const byId = (list, id) => list.find(x => x.id === id);
  const kindOf = el => { const k = el && el.closest('[data-kind]'); return k ? k.dataset.kind : 'anime'; };
  const listOf = kind => M()[KINDS[kind].list];
  const renderKind = kind => (kind === 'manga' ? renderManga() : renderAnime());

  // Petit journal du jour (épisodes vus, chapitres lus, objectifs cochés) pour les quêtes
  function logDaily(field, delta) {
    const k = dateKey(new Date());
    const day = state.daily[k] || (state.daily[k] = {});
    day[field] = Math.max(0, (day[field] || 0) + delta);
  }

  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal')) { e.target.hidden = true; return; }   // clic à côté de la fenêtre
    if (!e.target.closest('.sugg-wrap')) hideSuggest();
    const t = e.target.closest('[data-act]');
    if (!t || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    const act = t.dataset.act;
    const holder = t.closest('[data-id]');
    const id = holder ? holder.dataset.id : null;

    switch (act) {
      /* --- navigation --- */
      case 'prev': goMonth(shiftKey(current, -1), -1); break;
      case 'next': goMonth(shiftKey(current, 1), 1); break;
      case 'today': {
        const k = keyOf(new Date());
        goMonth(k, k > current ? 1 : -1);
        break;
      }
      case 'copy': copyPrevious(); break;
      case 'export': exportData(); break;

      /* --- bilan et appli --- */
      case 'bilan-open': openModal('bilanModal'); break;
      case 'modal-close': t.closest('.modal').hidden = true; break;
      case 'install':
        if (installEvt) {
          installEvt.prompt();
          installEvt.userChoice.finally(() => { installEvt = null; updateInstallBtn(); });
        } else if (isIOS) {
          toast("Sur iPhone : touche le bouton Partager (le carré avec une flèche) en bas de Safari, puis « Sur l'écran d'accueil ».", null, 9000);
        }
        break;

      /* --- synchro --- */
      case 'sync-open': openSyncModal(); break;
      case 'sync-close': closeSyncModal(); break;
      case 'sync-now': syncNow(); break;
      case 'sync-logout':
        sync = {};
        pendingChoice = null;
        syncError = '';
        try { localStorage.removeItem(SYNC_KEY); } catch (err) { /* rien */ }
        setSyncStatus('off');
        renderSyncModal();
        toast('Cet appareil est déconnecté. Tes données restent ici.');
        break;
      case 'sync-take-remote': {
        if (!pendingChoice) return;
        const remote = pendingChoice;
        const snap = snapshot();
        pendingChoice = null;
        sync.needsChoice = false;
        applyRemote(remote.data, false);
        finishSync();
        toast('Synchro activée ✓ Tes données en ligne sont arrivées.', snap);
        break;
      }
      case 'sync-keep-local': {
        if (!pendingChoice) return;
        const remote = pendingChoice;
        pendingChoice = null;
        sync.needsChoice = false;
        state.updatedAt = Math.max(Date.now(), num(remote.updatedAt, 0) + 1);
        try { persistLocal(); } catch (err) { /* rien */ }
        setSyncStatus('busy');
        renderSyncModal();
        pushGist()
          .then(() => finishSync('Synchro activée ✓ Les données de cet appareil sont en ligne.'))
          .catch(err => { syncError = friendly(err); setSyncStatus('err'); renderSyncModal(); });
        break;
      }
      case 'theme':
      case 'set-theme': {
        const next = act === 'set-theme' ? t.dataset.v : (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
        state.theme = next;
        applyTheme(next);
        save();
        if (!$('#settingsModal').hidden) renderSettings();
        break;
      }
      case 'settings-open': renderSettings(); openModal('settingsModal'); break;
      case 'set-palette':
        prefs.palette = t.dataset.v;
        savePrefs();
        applyPalette(prefs.palette);
        renderSettings();
        break;
      case 'set-rest':
        prefs.rest = Number(t.dataset.v);
        savePrefs();
        renderSettings();
        break;
      case 'lock-key': lockKey(t.dataset.v); break;

      /* --- minuteurs et chrono --- */
      case 'rest-start': startTimer('rest', Number(t.dataset.v) || restSeconds(), 'Repos'); break;
      case 'study-start': startTimer('study', Number(t.dataset.v) * 60, 'Révision'); break;
      case 'break-start': startTimer('break', Number(t.dataset.v) * 60, 'Pause'); break;
      case 'timer-add':
        if (timer) { timer.end += 30000; timer.total += 30; saveTimer(); tickTimer(); }
        break;
      case 'timer-stop': {
        const st = stopTimer();
        if (st && st.kind === 'study') toast('Révision arrêtée : les minutes faites sont comptées.');
        break;
      }
      case 'skill-chrono': openChrono(t.closest('[data-skill]').dataset.skill); break;
      case 'chrono-go': chronoGo(); break;
      case 'chrono-stop': chronoStop(); break;
      case 'chrono-close': closeChrono(); break;
      case 'chrono-win': {
        const sid = chrono && chrono.sid;
        closeChrono();
        const btn = sid && $(`#caliBody [data-skill="${sid}"] [data-act="skill-done"]`);
        if (btn) btn.click();
        break;
      }
      case 'lock-forgot':
        if (confirm("Ton code n'existe que sur cet appareil.\n\nPour l'enlever, il faut effacer les données de CET appareil. Si tu as la synchro tél ↔ PC, tu les récupéreras en recollant ta clé.\n\nEffacer les données de cet appareil ?")) {
          wiping = true;
          try { [KEY, LOCK_KEY, SYNC_KEY, LEVEL_KEY, QUEST_KEY, BADGE_KEY, TIMER_KEY, SESSION_KEY].forEach(k => localStorage.removeItem(k)); } catch (err) { /* rien */ }
          location.reload();
        }
        break;

      /* --- animes --- */
      case 'anime-plus':
      case 'anime-minus': {
        const kind = kindOf(t);
        const a = byId(listOf(kind), id);
        if (!a) return;
        const { x, y } = centerOf(t);
        const before = animePct(a);
        const old = a.ep;
        a.ep = Math.max(0, a.ep + (act === 'anime-plus' ? 1 : -1));
        if (a.ep !== old) logDaily(kind === 'manga' ? 'ch' : 'ep', a.ep - old);
        if (act === 'anime-plus') markActive();
        const after = animePct(a);
        const reached = before < 1 && after >= 1;
        if (reached) fresh.add(id);
        save(); renderKind(kind); renderHeader(); afterRender();
        const card = $(`${KINDS[kind].body} [data-id="${id}"]`);
        if (card) bump($('.ep-num', card));
        if (act === 'anime-plus') floatText(x, y - 10, '+1');
        if (reached) celebrate(card, 'クリア!');
        break;
      }
      case 'anime-del': {
        const kind = kindOf(t);
        const m = M();
        const list = KINDS[kind].list;
        const a = byId(m[list], id);
        if (!a) return;
        const snap = snapshot();
        m[list] = m[list].filter(x => x.id !== id);
        save(); renderKind(kind); renderHeader(); afterRender();
        toast(`« ${a.name} » supprimé.`, snap);
        break;
      }
      case 'anime-rate': {
        const kind = kindOf(t);
        const a = byId(listOf(kind), id);
        if (!a) return;
        const v = Number(t.dataset.v);
        a.rating = a.rating === v ? 0 : v;
        save(); renderKind(kind); afterRender();
        break;
      }

      /* --- habitudes --- */
      case 'habit-idea': {
        const idea = HABIT_IDEAS[Number(t.dataset.i)];
        if (!idea || state.habits.some(h => h.name === idea.name)) return;
        const hid = uid();
        state.habits.push({ id: hid, name: idea.name, target: idea.target });
        save(); renderHabits(); renderHeader(); afterRender();
        break;
      }
      case 'habit-tap':
      case 'habit-dot':
      case 'habit-cell': {
        const h = byId(state.habits, id);
        if (!h) return;
        const m = M();
        const tg = h.target || 1;
        const d = act === 'habit-cell' ? Number(t.dataset.day) : new Date().getDate();
        const c = habitCount(m, h.id, d);
        let nc;
        if (act === 'habit-cell') nc = c >= tg ? 0 : tg;
        else if (act === 'habit-dot') { const v = Number(t.dataset.v); nc = c === v ? v - 1 : v; }
        else nc = c >= tg ? 0 : c + 1;
        setHabit(m, h.id, d, nc);
        const nowDone = nc >= tg && c < tg;
        if (nc > c) markActive();
        if (nowDone && act !== 'habit-cell') fresh.add('h' + h.id);
        save(); renderHabits(); renderHeader(); afterRender();
        if (nowDone && act !== 'habit-cell') celebrate($(`#habitBody .h-card[data-id="${h.id}"]`), null, true);
        break;
      }
      case 'habit-del': {
        const h = byId(state.habits, id);
        if (!h) return;
        const snap = snapshot();
        state.habits = state.habits.filter(x => x.id !== id);
        save(); renderHabits(); renderHeader(); afterRender();
        toast(`Habitude « ${h.name} » supprimée.`, snap);
        break;
      }

      /* --- image à partager --- */
      case 'share-make': showShareImage(); break;
      case 'share-send':
        if (shareBlob) {
          const file = new File([shareBlob], `mon-mois-${current}.png`, { type: 'image/png' });
          navigator.share({ files: [file], title: 'Mon mois' }).catch(() => { /* partage annulé */ });
        }
        break;

      /* --- comptes à rebours --- */
      case 'cd-toggle':
        cdForm = !cdForm;
        renderCountdowns();
        if (cdForm) $('#countdowns form [name="name"]').focus();
        break;
      case 'cd-del': {
        const cid = t.closest('[data-cd]').dataset.cd;
        const c = byId(state.countdowns, cid);
        if (!c) return;
        const snap = snapshot();
        state.countdowns = state.countdowns.filter(x => x.id !== cid);
        save(); renderCountdowns();
        toast(`« ${c.name} » supprimé.`, snap);
        break;
      }

      /* --- livres --- */
      case 'book-status':
      case 'book-plus':
      case 'book-rate':
      case 'book-del': {
        const bid = t.closest('[data-book]').dataset.book;
        const b = byId(state.books, bid);
        if (!b) return;
        if (act === 'book-del') {
          const snap = snapshot();
          state.books = state.books.filter(x => x.id !== bid);
          save(); renderStudy(); renderHeader(); afterRender();
          toast(`« ${b.title} » supprimé.`, snap);
          return;
        }
        if (act === 'book-rate') { const v = Number(t.dataset.v); b.rating = b.rating === v ? 0 : v; save(); renderStudy(); afterRender(); return; }
        const wasDone = b.status === 'done';
        if (act === 'book-status') {
          b.status = t.dataset.v;
          if (b.status === 'done' && b.pages && b.page < b.pages) { logDaily('pg', b.pages - b.page); b.page = b.pages; }
        } else {
          const before = b.page || 0;
          b.page = b.pages ? Math.min(b.pages, before + 10) : before + 10;
          logDaily('pg', b.page - before);
          if (b.status === 'todo') b.status = 'reading';
          if (b.pages && b.page >= b.pages) b.status = 'done';
          markActive();
        }
        if (b.status === 'done' && !wasDone) { b.doneAt = dateKey(new Date()); fresh.add('b' + bid); markActive(); }
        if (b.status !== 'done') delete b.doneAt;
        save(); renderStudy(); renderHeader(); afterRender();
        if (b.status === 'done' && !wasDone) {
          celebrate($(`#studyBody [data-book="${bid}"]`), '読了!');
          toast(`Livre fini : « ${b.title} » · +${XP.bookDone} XP`);
        }
        break;
      }

      /* --- humeur --- */
      case 'mood': {
        const k = dateKey(new Date());
        const v = Number(t.dataset.v);
        if (state.mood[k] === v) delete state.mood[k];
        else { state.mood[k] = v; markActive(); }
        save(); renderHabits(); renderHeader(); afterRender();
        break;
      }

      /* --- séances types --- */
      case 'wk-template':
      case 'wk-new': {
        const tpl = act === 'wk-template' ? WORKOUT_TEMPLATES[Number(t.dataset.i)] : { name: 'Ma séance', ex: [['Exercice', 3, '10']] };
        const wid = uid();
        state.workouts.push({ id: wid, name: tpl.name, ex: tpl.ex.map(([name, sets, reps]) => ({ id: uid() + Math.random().toString(36).slice(2, 5), name, sets, reps })) });
        if (act === 'wk-new') editingWorkout = wid;
        added.add(wid);
        save(); renderGym(); afterRender();
        break;
      }
      case 'wk-edit': {
        const wid = t.closest('[data-wid]').dataset.wid;
        editingWorkout = editingWorkout === wid ? null : wid;
        renderGym(); afterRender();
        break;
      }
      case 'wk-del': {
        const wid = t.closest('[data-wid]').dataset.wid;
        const w = byId(state.workouts, wid);
        if (!w) return;
        const snap = snapshot();
        state.workouts = state.workouts.filter(x => x.id !== wid);
        const s = loadSession();
        if (s && s.wid === wid) saveSession(null);
        save(); renderGym(); afterRender();
        toast(`Séance « ${w.name} » supprimée.`, snap);
        break;
      }
      case 'wkex-add': {
        const w = byId(state.workouts, t.closest('[data-wid]').dataset.wid);
        if (!w) return;
        w.ex.push({ id: uid(), name: 'Exercice', sets: 3, reps: '10' });
        save(); renderGym(); afterRender();
        const rows = document.querySelectorAll(`#gymBody [data-wid="${w.id}"] .wk-ex input[data-act="wkex-name"]`);
        if (rows.length) { rows[rows.length - 1].focus(); rows[rows.length - 1].select(); }
        break;
      }
      case 'wkex-del': {
        const w = byId(state.workouts, t.closest('[data-wid]').dataset.wid);
        if (!w) return;
        w.ex = w.ex.filter(e => e.id !== t.closest('[data-ex]').dataset.ex);
        save(); renderGym(); afterRender();
        break;
      }
      case 'wk-start': {
        const wid = t.dataset.wid || t.closest('[data-wid]').dataset.wid;
        const w = byId(state.workouts, wid);
        if (!w || !w.ex.length) { toast("Ajoute d'abord des exercices à cette séance."); return; }
        let s = loadSession();
        if (!s || s.wid !== wid) {
          if (s && !confirm('Une autre séance est en cours. La remplacer ?')) return;
          s = { wid, start: Date.now(), sets: {} };
          saveSession(s);
        }
        editingWorkout = null;
        renderWorkout();
        openModal('workoutModal');
        renderGym(); afterRender();
        break;
      }
      case 'wr-set': {
        const s = loadSession();
        const w = s && byId(state.workouts, s.wid);
        if (!w) return;
        const eid = t.closest('[data-ex]').dataset.ex;
        const e = byId(w.ex, eid);
        const v = Number(t.dataset.v);
        const n = s.sets[eid] || 0;
        s.sets[eid] = n === v ? v - 1 : v;
        saveSession(s);
        const allDone = w.ex.every(x => (s.sets[x.id] || 0) >= x.sets);
        if (s.sets[eid] > n && !allDone) startTimer('rest', restSeconds(), `Repos · ${e ? e.name : ''}`);
        renderWorkout();
        if (allDone) toast('Toutes les séries sont faites ! Touche « Terminer la séance ».');
        break;
      }
      case 'wk-finish': {
        const s = loadSession();
        const w = s && byId(state.workouts, s.wid);
        if (!w) return;
        const now = new Date();
        const nowKey = keyOf(now);
        state.workoutLog.push({ date: dateKey(now), wid: w.id, name: w.name });
        if (!state.months[nowKey]) state.months[nowKey] = emptyMonth();
        const g = state.months[nowKey].gym;
        if (!g.days.includes(now.getDate())) { g.days.push(now.getDate()); g.days.sort((a, b) => a - b); }
        markActive();
        saveSession(null);
        if (timer && timer.kind === 'rest') stopTimer();
        $('#workoutModal').hidden = true;
        save(); renderGym(); renderHeader(); afterRender();
        overlay(`<span class="jp">練習完了!</span><span class="lv">${esc(w.name)}</span><span class="new-rank">Séance notée dans ton calendrier · +${XP.workout} XP</span>`, 14);
        break;
      }
      case 'wk-cancel':
        if (!confirm('Abandonner cette séance ? Elle ne sera pas comptée.')) return;
        saveSession(null);
        if (timer && timer.kind === 'rest') stopTimer();
        $('#workoutModal').hidden = true;
        renderGym(); afterRender();
        break;

      /* --- callisthénie --- */
      case 'skill-work':
      case 'skill-done':
      case 'skill-undo': {
        const sid = t.closest('[data-skill]').dataset.skill;
        const sk = CALI.SKILLS.find(s => s.id === sid);
        if (!sk) return;
        const x = state.cali[sid] || {};
        let won = false;
        if (act === 'skill-work') x.s = x.s === 'work' ? undefined : 'work';
        if (act === 'skill-done') { x.s = 'done'; x.at = dateKey(new Date()); won = true; markActive(); fresh.add('k' + sid); }
        if (act === 'skill-undo') { x.s = 'work'; delete x.at; }
        if (!x.s && !x.rec) delete state.cali[sid]; else state.cali[sid] = x;
        const { x: px, y: py } = centerOf(t);
        save(); renderCali(); renderHeader(); afterRender();
        if (won) {
          celebrate($(`#caliBody [data-skill="${sid}"]`), 'やった!');
          floatText(px, py - 10, `+${sk.tier * XP.skillTier} XP`);
        }
        break;
      }

      /* --- révision --- */
      case 'review': {
        const n = Number(t.dataset.n);
        const today = dateKey(new Date());
        const list = state.quran.reviews[today] || [];
        const had = list.includes(n);
        state.quran.reviews[today] = had ? list.filter(x => x !== n) : [...list, n];
        if (!state.quran.reviews[today].length) delete state.quran.reviews[today];
        if (!had) { markActive(); const { x, y } = centerOf(t); floatText(x, y - 8, `+${XP.review} XP`); }
        save(); renderQuran(); renderHeader(); afterRender();
        break;
      }
      case 'sugg-pick': {
        const type = t.dataset.type;
        const al = suggResults[type][Number(t.dataset.i)];
        const form = t.closest('form');
        if (!al || !form) return;
        picked[type] = al;
        form.name.value = al.title;
        if (type === 'anime' && form.total && !form.total.value && al.episodes) form.total.value = al.episodes;
        hideSuggest();
        const nextField = type === 'anime' ? form.ep : $('button[type="submit"]', form);
        if (nextField) nextField.focus();
        break;
      }
      case 'watch-start': {
        const w = byId(state.watchlist, id);
        if (!w) return;
        const eps = w.al && w.al.episodes ? w.al.episodes : 0;
        const nid = uid();
        M().animes.push({ id: nid, name: w.name, ep: 0, start: 0, goal: eps ? Math.min(12, eps) : 12, total: eps, al: w.al || null });
        state.watchlist = state.watchlist.filter(x => x.id !== id);
        added.add(nid);
        save(); renderAnime(); renderHeader(); afterRender();
        toast(`« ${w.name} » ajouté à ${labelOf(current)}. Règle ton objectif d'épisodes.`);
        break;
      }
      case 'watch-del': {
        const w = byId(state.watchlist, id);
        if (!w) return;
        const snap = snapshot();
        state.watchlist = state.watchlist.filter(x => x.id !== id);
        save(); renderAnime(); afterRender();
        toast(`« ${w.name} » retiré de ta liste.`, snap);
        break;
      }

      /* --- sourates --- */
      case 'surah': {
        const n = Number(t.dataset.n);
        const learned = state.quran.learned;
        const m = M();
        const k = learned[n];
        if (k && k !== current) {
          if (!confirm(`${SOURATES[n - 1]} est notée comme apprise en ${labelOf(k)}.\nLa retirer de ta liste ?`)) return;
          delete learned[n];
          delete state.quran.learnedOn[n];
        } else if (k) {
          delete learned[n];
          delete state.quran.learnedOn[n];
        } else {
          const before = learnedIn(current);
          learned[n] = current;
          state.quran.learnedOn[n] = dateKey(new Date());
          markActive();
          fresh.add('s' + n);
          const { x, y } = centerOf(t);
          floatText(x, y - 8, '+1');
          if (m.quranGoal > 0 && before < m.quranGoal && before + 1 >= m.quranGoal) {
            setTimeout(() => celebrate($('#quranBody .q-stats'), 'Mâ shâ Allah !'), 60);
          }
        }
        save(); renderQuran(); renderHeader(); afterRender();
        break;
      }
      case 'quran-filter':
        state.quran.filter = t.dataset.v;
        save(); renderQuran(); $('#surahGrid').scrollTop = 0;
        break;
      case 'quran-order':
        state.quran.order = state.quran.order === 'desc' ? 'asc' : 'desc';
        save(); renderQuran(); $('#surahGrid').scrollTop = 0;
        break;

      /* --- salle --- */
      case 'gym-day': {
        const g = M().gym;
        const d = Number(t.dataset.day);
        const wasReached = g.goal > 0 && g.days.length >= g.goal;
        if (g.days.includes(d)) {
          g.days = g.days.filter(x => x !== d);
        } else {
          g.days.push(d);
          g.days.sort((a, b) => a - b);
          fresh.add('day' + d);
        }
        const nowReached = g.goal > 0 && g.days.length >= g.goal;
        save(); renderGym(); renderHeader(); afterRender();
        if (!wasReached && nowReached) celebrate($('#gymBody .cal'), 'ナイス!');
        break;
      }
      case 'lift-plus':
      case 'lift-minus': {
        const l = byId(M().gym.lifts, id);
        if (!l) return;
        const before = liftPct(l);
        l.cur = Math.round((l.cur + (act === 'lift-plus' ? 1 : -1)) * 100) / 100;
        logLift(l);
        if (act === 'lift-plus') markActive();
        const after = liftPct(l);
        const reached = before < 1 && after >= 1;
        if (reached) fresh.add(id);
        save(); renderGym(); renderHeader(); afterRender();
        if (reached) celebrate($(`#gymBody [data-id="${id}"]`), 'ナイス!');
        break;
      }
      case 'lift-del': {
        const g = M().gym;
        const l = byId(g.lifts, id);
        if (!l) return;
        const snap = snapshot();
        g.lifts = g.lifts.filter(x => x.id !== id);
        save(); renderGym(); renderHeader(); afterRender();
        toast(`« ${l.name} » supprimé.`, snap);
        break;
      }

      /* --- argent --- */
      case 'money-type': {
        const form = setMoneyType(t.dataset.v);
        if (form) $('[name="amount"]', form).focus();
        break;
      }
      case 'money-del': {
        const mo = M().money;
        const en = byId(mo.entries, id);
        if (!en) return;
        const snap = snapshot();
        mo.entries = mo.entries.filter(x => x.id !== id);
        save(); renderMoney(); renderHeader(); afterRender();
        toast(`${en.type === 'save' ? 'Épargne' : 'Dépense'} de ${eur(en.amount)} supprimée.`, snap);
        break;
      }
      case 'sub-toggle': {
        const s = byId(state.subs, id);
        if (!s) return;
        if (s.active === false) {
          s.active = true;
          s.since = keyOf(new Date());   // on reprend à partir de ce mois-ci
          applySubs();
          toast(`« ${s.name} » repris : il sera ajouté chaque mois.`);
        } else {
          s.active = false;
          toast(`« ${s.name} » en pause : il ne sera plus ajouté aux prochains mois.`);
        }
        save(); renderMoney(); renderHeader(); afterRender();
        break;
      }
      case 'sub-del': {
        const s = byId(state.subs, id);
        if (!s) return;
        const snap = snapshot();
        state.subs = state.subs.filter(x => x.id !== id);
        save(); renderMoney(); afterRender();
        toast(`Abonnement « ${s.name} » supprimé (les dépenses déjà notées restent).`, snap);
        break;
      }
      case 'jar-add': {
        const form = setMoneyType('save');
        if (!form) return;
        const sel = $('.jar-select', form);
        if (sel) sel.value = id;
        form.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        $('[name="amount"]', form).focus({ preventScroll: true });
        break;
      }
      case 'jar-del': {
        const j = byId(state.jars, id);
        if (!j) return;
        const snap = snapshot();
        state.jars = state.jars.filter(x => x.id !== id);
        save(); renderMoney(); renderHeader(); afterRender();
        toast(`Cagnotte « ${j.name} » supprimée.`, snap);
        break;
      }

      /* --- autres objectifs --- */
      case 'todo-toggle': {
        const td = byId(M().todos, id);
        if (!td) return;
        td.done = !td.done;
        logDaily('todo', td.done ? 1 : -1);
        if (td.done) { fresh.add(id); markActive(); }
        save(); renderTodos(); renderHeader(); afterRender();
        if (td.done) celebrate($(`#todoBody [data-id="${id}"] .check`), null, true);
        break;
      }
      case 'todo-del': {
        const m = M();
        const td = byId(m.todos, id);
        if (!td) return;
        const snap = snapshot();
        m.todos = m.todos.filter(x => x.id !== id);
        save(); renderTodos(); renderHeader(); afterRender();
        toast('Objectif supprimé.', snap);
        break;
      }
    }
  });

  // Modifications des champs (validées quand on quitte le champ ou appuie sur Entrée)
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'importFile') {
      if (t.files && t.files[0]) importData(t.files[0]);
      t.value = '';
      return;
    }
    const act = t.dataset.act;
    if (!act) return;
    const holder = t.closest('[data-id]');
    const id = holder ? holder.dataset.id : null;
    const m = M();

    switch (act) {
      case 'anime-name': {
        const a = byId(listOf(kindOf(t)), id);
        if (a) { a.name = t.value.trim() || a.name; t.value = a.name; save(); }
        break;
      }
      case 'anime-goal':
      case 'anime-total': {
        const kind = kindOf(t);
        const a = byId(listOf(kind), id);
        if (!a) return;
        const before = animePct(a);
        if (act === 'anime-goal') a.goal = Math.max(0, Math.round(num(t.value, a.goal)));
        else a.total = Math.max(0, Math.round(num(t.value, 0)));
        if (before < 1 && animePct(a) >= 1) fresh.add(id);
        save(); renderKind(kind); renderHeader(); afterRender();
        break;
      }
      case 'habit-name': {
        const h = byId(state.habits, id);
        if (h) { h.name = t.value.trim() || h.name; t.value = h.name; save(); renderHeader(); }
        break;
      }
      case 'wk-name':
      case 'wkex-name':
      case 'wkex-sets':
      case 'wkex-reps': {
        const w = byId(state.workouts, t.closest('[data-wid]').dataset.wid);
        if (!w) return;
        if (act === 'wk-name') w.name = t.value.trim() || w.name;
        else {
          const e = byId(w.ex, t.closest('[data-ex]').dataset.ex);
          if (!e) return;
          if (act === 'wkex-name') e.name = t.value.trim() || e.name;
          if (act === 'wkex-sets') e.sets = Math.min(20, Math.max(1, Math.round(num(t.value, e.sets))));
          if (act === 'wkex-reps') e.reps = t.value.trim() || e.reps;
        }
        save();
        break;
      }
      case 'lift-chart':
        liftChartSel = t.value;
        renderGym(); afterRender();
        break;
      case 'book-title':
      case 'book-page':
      case 'book-total': {
        const b = byId(state.books, t.closest('[data-book]').dataset.book);
        if (!b) return;
        if (act === 'book-title') { b.title = t.value.trim() || b.title; save(); return; }
        const wasDone = b.status === 'done';
        if (act === 'book-total') b.pages = Math.max(0, Math.round(num(t.value, 0)));
        else {
          const before = b.page || 0;
          b.page = Math.max(0, Math.round(num(t.value, before)));
          if (b.pages) b.page = Math.min(b.page, b.pages);
          if (b.page > before) { logDaily('pg', b.page - before); markActive(); }
        }
        if (b.pages && b.page >= b.pages) b.status = 'done';
        if (b.status === 'done' && !wasDone) { b.doneAt = dateKey(new Date()); fresh.add('b' + b.id); }
        save(); renderStudy(); renderHeader(); afterRender();
        if (b.status === 'done' && !wasDone) celebrate($(`#studyBody [data-book="${b.id}"]`), '読了!');
        break;
      }
      case 'sleep-bed':
      case 'sleep-wake': {
        const k = dateKey(new Date());
        const s = state.sleep[k] || {};
        s[act === 'sleep-bed' ? 'bed' : 'wake'] = t.value;
        if (!s.bed && !s.wake) delete state.sleep[k]; else state.sleep[k] = s;
        if (s.bed && s.wake) markActive();
        save(); renderHeader();
        // On met juste la durée à jour (sans redessiner, pour ne pas gêner la saisie de l'heure)
        const dur = sleepMinutes(s);
        const el = $('#habitBody .sleep-dur');
        if (el) { el.textContent = dur ? hm(dur) : '—'; el.classList.toggle('short', Boolean(dur && dur < 360)); }
        break;
      }
      case 'skill-rec': {
        const sid = t.closest('[data-skill]').dataset.skill;
        const x = state.cali[sid] || {};
        x.rec = t.value.trim();
        if (!x.s && !x.rec) delete state.cali[sid]; else state.cali[sid] = x;
        save();
        break;
      }
      case 'quran-goal':
        m.quranGoal = Math.max(0, Math.min(114, Math.round(num(t.value, 0))));
        save(); renderQuran(); renderHeader(); afterRender();
        break;
      case 'gym-goal':
        m.gym.goal = Math.max(0, Math.min(31, Math.round(num(t.value, m.gym.goal))));
        save(); renderGym(); renderHeader(); afterRender();
        break;
      case 'lift-name':
      case 'lift-unit': {
        const l = byId(m.gym.lifts, id);
        if (!l) return;
        if (act === 'lift-name') { l.name = t.value.trim() || l.name; t.value = l.name; }
        else l.unit = t.value.trim();
        save();
        break;
      }
      case 'lift-cur':
      case 'lift-target': {
        const l = byId(m.gym.lifts, id);
        if (!l) return;
        const before = liftPct(l);
        if (act === 'lift-cur') { l.cur = num(t.value, l.cur); logLift(l); }
        else l.target = num(t.value, l.target);
        if (before < 1 && liftPct(l) >= 1) fresh.add(id);
        save(); renderGym(); renderHeader(); afterRender();
        break;
      }
      case 'todo-text': {
        const td = byId(m.todos, id);
        if (td) { td.text = t.value.trim() || td.text; t.value = td.text; save(); }
        break;
      }
      case 'money-goal':
      case 'money-budget': {
        const v = Math.max(0, round2(num(t.value, 0)));
        if (act === 'money-goal') m.money.saveGoal = v; else m.money.budget = v;
        save(); renderMoney(); renderHeader(); afterRender();
        break;
      }
      case 'jar-name': {
        const j = byId(state.jars, id);
        if (!j) return;
        j.name = t.value.trim() || j.name;
        save(); renderMoney(); afterRender();
        break;
      }
      case 'jar-target': {
        const j = byId(state.jars, id);
        if (!j) return;
        const before = jarPct(id);
        j.target = Math.max(0, round2(num(t.value, j.target)));
        if (before < 1 && jarPct(id) >= 1) fresh.add(id);
        save(); renderMoney(); afterRender();
        break;
      }
      case 'sub-name':
      case 'sub-amount':
      case 'sub-day': {
        const s = byId(state.subs, id);
        if (!s) return;
        if (act === 'sub-name') s.name = t.value.trim() || s.name;
        if (act === 'sub-amount') { const v = round2(num(t.value, s.amount)); if (v > 0) s.amount = v; }
        if (act === 'sub-day') s.day = Math.min(31, Math.max(1, Math.round(num(t.value, s.day))));
        updateSubEntry(s);
        save(); renderMoney(); renderHeader(); afterRender();
        break;
      }
    }
  });

  // Saisie en direct : recherche de sourate et notes
  let notesTimer = 0;
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.act === 'quran-search') {
      quranSearch = t.value;
      renderSurahGrid();
      $('#surahGrid').scrollTop = 0;
    } else if (t.dataset.act === 'notes') {
      M().notes = t.value;
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => { save(); renderHeader(); }, 400);
    } else if (t.name === 'name' && t.closest('.sugg-wrap')) {
      showSuggest(t.closest('form').dataset.form, t);
    }
  });

  // Pendant le chrono : toucher n'importe où arrête
  $('#chrono').addEventListener('pointerdown', e => {
    if (chrono && chrono.phase === 'run' && !e.target.closest('[data-act="chrono-stop"]')) chronoStop();
  });

  // On retient les niveaux de callisthénie ouverts / fermés à la main
  document.addEventListener('toggle', e => {
    const d = e.target;
    if (!d.classList || !d.classList.contains('tier')) return;
    const n = Number(d.dataset.tier);
    caliOpen.set(n, d.open);
  }, true);

  // Quand on quitte la partie Animes, on applique les infos arrivées pendant la saisie
  $('#animeBody').addEventListener('focusout', () => {
    setTimeout(() => {
      if (pendingAnimeRender && !$('#animeBody').contains(document.activeElement)) { renderAnime(); afterRender(); }
    }, 250);
  });

  // Entrée dans un petit champ = valider (sans recharger la page)
  document.addEventListener('keydown', e => {
    const t = e.target;
    // Écran de verrouillage : on peut taper le code au clavier
    if (document.documentElement.classList.contains('locked')) {
      if (/^[0-9]$/.test(e.key)) lockKey(e.key);
      else if (e.key === 'Backspace') lockKey('del');
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      const open = [...document.querySelectorAll('.modal')].filter(mo => !mo.hidden);
      if (open.length) { open.forEach(mo => { mo.hidden = true; }); return; }
      hideSuggest();
    }
    // Ctrl+S : tout est déjà enregistré, on le confirme
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      save();
      toast('Tout est enregistré ✓');
      return;
    }
    if (e.key === 'Enter' && t.tagName === 'INPUT' && t.dataset.act) {
      e.preventDefault();
      t.blur();
      return;
    }
    // Flèches ← → pour changer de mois (quand on n'écrit pas)
    if (['INPUT', 'TEXTAREA'].includes(t.tagName) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') goMonth(shiftKey(current, -1), -1);
    if (e.key === 'ArrowRight') goMonth(shiftKey(current, 1), 1);
  });

  // Formulaires d'ajout
  document.addEventListener('submit', e => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const m = M();
    const type = form.dataset.form;

    if (type === 'sync') {
      connectSync(d.token, $('button[type="submit"]', form));
      return;
    }

    if (type === 'cd') {
      const name = String(d.name || '').trim();
      const date = String(d.date || '');
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Écris un nom et choisis une date.'); return; }
      state.countdowns.push({ id: uid(), name, date });
      cdForm = false;
      save(); renderCountdowns();
      return;
    }

    if (type === 'book') {
      const title = String(d.name || '').trim();
      if (!title) return;
      const pk = picked.book && picked.book.title === title ? picked.book : null;
      const id = uid();
      state.books.push({ id, title, author: pk ? pk.author : '', cover: pk ? pk.cover : '', pages: pk ? pk.pages : 0, page: 0, status: 'reading', added: dateKey(new Date()) });
      picked.book = null;
      added.add(id);
      save(); renderStudy(); afterRender();
      $('#studyBody form[data-form="book"] [name="name"]').focus();
      return;
    }

    if (type === 'study') {
      const mins = Math.round(num(d.min, 0));
      if (!(mins > 0 && mins <= 600)) { toast('Écris un nombre de minutes, par exemple 30'); return; }
      markActive();
      addStudy(mins);
      toast(`+${mins} min de révision notées ✓`);
      return;
    }

    if (type === 'weight') {
      const kg = Math.round(num(d.kg, 0) * 10) / 10;
      if (!(kg > 20 && kg < 400)) { toast('Écris ton poids en kg, par exemple 72,5'); return; }
      state.weights[dateKey(new Date())] = kg;
      markActive();
      save(); renderGym(); afterRender();
      toast(`${String(kg).replace('.', ',')} kg noté ✓`);
      return;
    }

    if (type === 'lock-on') {
      const c1 = String(d.code1 || ''), c2 = String(d.code2 || '');
      if (!/^\d{4}$/.test(c1)) { toast('Le code doit faire 4 chiffres.'); return; }
      if (c1 !== c2) { toast('Les deux codes ne sont pas pareils.'); return; }
      sha(c1).then(h => {
        try { localStorage.setItem(LOCK_KEY, h); } catch (err) { /* rien */ }
        renderSettings();
        toast("Code activé ✓ Il sera demandé à l'ouverture de l'appli.");
      });
      return;
    }

    if (type === 'lock-off') {
      sha(String(d.code || '')).then(h => {
        if (h !== localStorage.getItem(LOCK_KEY)) { toast("Ce n'est pas le bon code."); return; }
        try { localStorage.removeItem(LOCK_KEY); } catch (err) { /* rien */ }
        renderSettings();
        toast('Code enlevé.');
      });
      return;
    }

    if (type === 'anime' || type === 'manga') {
      const K = KINDS[type];
      const name = String(d.name || '').trim();
      if (!name) return;
      const ep = Math.max(0, Math.round(num(d.ep, 0)));
      const al = picked[type] && picked[type].title === name ? picked[type] : null;
      const total = Math.max(0, Math.round(num(d.total, 0))) || (al && al[K.count]) || 0;
      let goal = Math.round(num(d.goal, NaN));
      if (!Number.isFinite(goal) || goal <= ep) goal = total > ep ? Math.min(total, ep + K.step) : ep + K.step;
      const id = uid();
      m[K.list].push({ id, name, ep, start: ep, goal, total, al, alTried: Boolean(al) });
      picked[type] = null;
      added.add(id);
      save(); renderKind(type); renderHeader(); afterRender();
      $(`${K.body} form[data-form="${type}"] [name="name"]`).focus();
      if (!al) enrichAnimes();
    }

    if (type === 'watch') {
      const name = String(d.name || '').trim();
      if (!name) return;
      const al = picked.watch && picked.watch.title === name ? picked.watch : null;
      const id = uid();
      state.watchlist.push({ id, name, al, alTried: Boolean(al) });
      picked.watch = null;
      added.add(id);
      save(); renderAnime(); afterRender();
      $('#animeBody form[data-form="watch"] [name="name"]').focus();
      if (!al) enrichAnimes();
    }

    if (type === 'sub') {
      const name = String(d.name || '').trim();
      const amount = round2(num(d.amount, 0));
      if (!name) return;
      if (!(amount > 0)) { toast('Écris le prix par mois, par exemple 8,99'); return; }
      const id = uid();
      const s = {
        id, name, amount, day: Math.min(31, Math.max(1, Math.round(num(d.day, 1)))),
        cat: catOf(d.cat).id, since: keyOf(new Date()), active: true
      };
      state.subs.push(s);
      applySubs();
      added.add(id);
      added.add(`s_${id}_${keyOf(new Date())}`);
      save(); renderMoney(); renderHeader(); afterRender();
      $('#moneyBody form[data-form="sub"] [name="name"]').focus({ preventScroll: true });
      toast(`« ${name} » ajouté : ${eur(amount)} tous les mois, le ${s.day}.`);
    }

    if (type === 'lift') {
      const name = String(d.name || '').trim();
      if (!name) return;
      const cur = num(d.cur, 0);
      const target = num(d.target, cur);
      const id = uid();
      const newLift = { id, name, cur, start: cur, target, unit: String(d.unit || '').trim() };
      m.gym.lifts.push(newLift);
      logLift(newLift);
      added.add(id);
      save(); renderGym(); renderHeader(); afterRender();
      $('#gymBody form [name="name"]').focus();
    }

    if (type === 'money') {
      const amountIn = $('[name="amount"]', form);
      const amount = round2(num(d.amount, 0));
      if (!(amount > 0)) {
        toast('Écris un montant, par exemple 12,50');
        amountIn.focus();
        return;
      }
      const { y, m: mon } = partsOf(current);
      const dim = new Date(y, mon, 0).getDate();
      const day = Math.min(dim, Math.max(1, Math.round(num(d.day, 1))));
      const mo = m.money;
      const type2 = moneyType;
      const jar = type2 === 'save' && state.jars.some(j => j.id === d.jar) ? d.jar : '';
      const savedBefore = moneySum(mo, 'save');
      const jarBefore = jar ? jarPct(jar) : 0;
      const id = uid();
      const entry = { id, type: type2, amount, label: String(d.label || '').trim(), day, jar, t: Date.now() };
      if (type2 === 'spend') { entry.cat = catOf(d.cat).id; lastCat = entry.cat; }
      mo.entries.push(entry);
      added.add(id);
      const goalReached = type2 === 'save' && mo.saveGoal > 0 && savedBefore < mo.saveGoal && savedBefore + amount >= mo.saveGoal;
      const jarReached = jar && jarBefore < 1 && jarPct(jar) >= 1;
      if (jarReached) fresh.add(jar);
      save(); renderMoney(); renderHeader(); afterRender();
      $('#moneyBody form[data-form="money"] [name="amount"]').focus({ preventScroll: true });
      toast(type2 === 'save' ? `+${eur(amount)} mis de côté — enregistré ✓` : `−${eur(amount)} de dépense — enregistré ✓`);
      if (goalReached) celebrate($('#moneyBody .money-stats'), 'やった!');
      else if (jarReached) celebrate($(`#moneyBody [data-id="${jar}"]`), 'やった!');
    }

    if (type === 'jar') {
      const name = String(d.name || '').trim();
      if (!name) return;
      const id = uid();
      state.jars.push({ id, name, target: Math.max(0, round2(num(d.target, 0))) });
      added.add(id);
      save(); renderMoney(); renderHeader(); afterRender();
      $('#moneyBody form[data-form="jar"] [name="name"]').focus();
    }

    if (type === 'habit') {
      const name = String(d.name || '').trim();
      if (!name) return;
      state.habits.push({ id: uid(), name, target: Math.min(10, Math.max(1, Math.round(num(d.target, 1)))) });
      save(); renderHabits(); renderHeader(); afterRender();
      $('#habitBody form[data-form="habit"] [name="name"]').focus();
    }

    if (type === 'todo') {
      const text = String(d.text || '').trim();
      if (!text) return;
      const id = uid();
      m.todos.push({ id, text, done: false });
      added.add(id);
      save(); renderTodos(); renderHeader(); afterRender();
      $('#todoBody form [name="text"]').focus();
    }
  });

  // Au cas où on ferme la page pendant qu'on écrit une note
  window.addEventListener('pagehide', () => {
    if (wiping) return;
    try { persistLocal(); } catch (e) { /* rien */ }
    flushSync();
  });

  // On revient sur le site (autre onglet, autre appli) : on récupère la dernière version,
  // et on reverrouille si l'appli est restée cachée plus de 5 minutes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      flushSync();
    } else {
      if (hiddenAt && Date.now() - hiddenAt > 5 * 60 * 1000) showLock();
      tickTimer();
      syncNow();
    }
  });
  window.addEventListener('online', () => syncNow());

  // Installer comme une appli
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; updateInstallBtn(); });
  window.addEventListener('appinstalled', () => {
    installEvt = null;
    updateInstallBtn();
    toast("Appli installée ✓ Tu la trouves sur ton écran d'accueil.");
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* pas grave : le site marche quand même */ });
  }

  /* ---------- Démarrage ---------- */
  applyTheme(state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  applyPalette(prefs.palette);
  if (hasLock()) showLock(); else document.documentElement.classList.remove('locked');
  setupTooltip();
  tickTimer();   // reprend un minuteur lancé avant de fermer l'appli
  renderAll(0);
  setSyncStatus(sync.token ? 'busy' : 'off');
  if (sync.token) syncNow();
  // Les dates de sortie bougent : on revérifie de temps en temps si la page reste ouverte
  setInterval(enrichAnimes, 30 * 60 * 1000);
})();
