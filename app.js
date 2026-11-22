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
    perfect: 100      // mois validé à 100 %
  };
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
      money: { saveGoal: 0, budget: 0, entries: [] }
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
    return !m || (!m.animes.length && !m.todos.length && !m.gym.lifts.length &&
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

  function sections(m, k = current) {
    const out = {};
    if (m.animes.length) out.anime = avg(m.animes.map(animePct));
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
    $('#themeBtn').textContent = document.documentElement.dataset.theme === 'dark' ? 'Mode jour' : 'Mode nuit';

    if (lastGlobal !== null && lastGlobal < 100 && pct === 100) megaCelebration();
    lastGlobal = pct;
    renderHud();
    updateInstallBtn();
  }

  /* ---------- Animes ---------- */
  const picked = { anime: null, watch: null };     // anime choisi dans la liste de suggestions
  const suggResults = { anime: [], watch: [] };
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

  function animeCard(a) {
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
      <article class="card anime ${done ? 'is-done' : ''} ${added.has(a.id) ? 'is-new' : ''}" data-id="${a.id}">
        <div class="anime-row">
          ${coverImg(a.al, a.name)}
          <div class="anime-main">
            <div class="anime-top">
              <input class="ghost name" data-act="anime-name" value="${esc(a.name)}" aria-label="Nom de l'anime">
              ${finished ? '<span class="tag">TERMINÉ</span>' : ''}
              <button class="x" data-act="anime-del" aria-label="Supprimer ${esc(a.name)}" title="Supprimer">×</button>
            </div>
            ${airLine(a.al, a.ep)}
            <div class="anime-mid">
              <button class="step" data-act="anime-minus" aria-label="Retirer un épisode">−</button>
              <div class="ep"><small>ÉP.</small><span class="ep-num">${a.ep}</span></div>
              <button class="step plus" data-act="anime-plus" aria-label="J'ai vu un épisode de plus">+1</button>
              <div class="anime-goal">
                <label>Objectif : ép. <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-goal" value="${a.goal}"></label>
                <label class="muted">sur <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-total" value="${a.total || ''}" placeholder="?"> au total</label>
              </div>
            </div>
          </div>
        </div>
        ${bar('anime-' + a.id, p)}
        <div class="foot"><span>${seen} / ${need} épisode${need > 1 ? 's' : ''} ce mois</span><b>${Math.round(p * 100)}%</b></div>
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
    const cards = m.animes.map(animeCard).join('');
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

  // Re-dessine les animes sans casser une saisie en cours
  function softRenderAnime() {
    if ($('#animeBody').contains(document.activeElement)) { pendingAnimeRender = true; return; }
    renderAnime();
    afterRender();
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

      <h3 class="sub">Objectifs de perf</h3>
      ${lifts ? `<div class="stack">${lifts}</div>`
        : '<p class="empty-line">Exemples : Développé couché 60 → 70 kg, Tractions 8 → 12 reps, Poids 75 → 72 kg…</p>'}
      <form class="add" data-form="lift" autocomplete="off">
        <input class="wide" name="name" placeholder="Exercice ou objectif" required maxlength="60">
        <input name="cur" type="number" step="any" placeholder="Actuel">
        <input name="target" type="number" step="any" placeholder="Objectif">
        <input name="unit" placeholder="kg, reps…" value="kg" maxlength="10">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
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
  const AL_FIELDS = 'id title { romaji english userPreferred } coverImage { large medium } episodes status format seasonYear nextAiringEpisode { airingAt episode } startDate { year month day }';
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

  async function alSearch(text) {
    const k = norm(text);
    if (alCache.has(k)) return alCache.get(k);
    const d = await alQuery(
      `query ($s: String) { Page(perPage: 6) { media(search: $s, type: ANIME, sort: SEARCH_MATCH, isAdult: false) { ${AL_FIELDS} } } }`,
      { s: text });
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
      const pool = () => [...M().animes, ...state.watchlist];
      for (const x of pool().filter(a => !a.al && !a.alTried).slice(0, 8)) {
        try {
          const r = await alSearch(x.name);
          x.alTried = true;
          if (r[0]) {
            x.al = r[0];
            if ('ep' in x && !x.total && r[0].episodes) x.total = r[0].episodes;
          }
          changed = true;
        } catch (e) { break; }
      }
      const stale = pool().filter(a => a.al && a.al.id && a.al.status !== 'FINISHED' &&
        (Date.now() - (a.al.at || 0) > 6 * 3600e3 || (a.al.next && a.al.next.at * 1000 < Date.now())));
      const ids = [...new Set(stale.map(a => a.al.id))].slice(0, 50);
      if (ids.length) {
        const d = await alQuery(`query ($ids: [Int]) { Page(perPage: 50) { media(id_in: $ids, type: ANIME) { ${AL_FIELDS} } } }`, { ids });
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
      try { list = await alSearch(text); } catch (e) { box.hidden = true; return; }
      if (input.value.trim() !== text || document.activeElement !== input) return;
      suggResults[type] = list;
      if (!list.length) {
        box.innerHTML = '<p class="sugg-none">Pas trouvé sur AniList (tu peux quand même l\'ajouter).</p>';
      } else {
        box.innerHTML = list.map((a, i) => `
          <button type="button" class="sugg-item" data-act="sugg-pick" data-type="${type}" data-i="${i}">
            ${coverImg(a, a.title, 'cover xs')}
            <span><b>${esc(a.title)}</b><small>${[a.year, a.episodes ? a.episodes + ' ép.' : '', a.fmt === 'MOVIE' ? 'film' : ''].filter(Boolean).join(' · ')}</small></span>
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
    Object.entries(state.months).forEach(([k, m]) => m.money.entries.forEach(e => {
      if (!e.sub) set.add(`${k}-${String(e.day).padStart(2, '0')}`);
    }));
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
    const p = { session: 0, surah: 0, episode: 0, animeGoal: 0, animeDone: 0, todo: 0, lift: 0, saveGoal: 0, saved: 0, perfect: 0 };
    Object.entries(state.months).forEach(([k, m]) => {
      p.session += m.gym.days.length;
      m.animes.forEach(a => {
        p.episode += Math.max(0, a.ep - a.start);
        if (a.total > 0 && a.ep >= a.total) p.animeDone++;
        else if (a.goal > a.start && a.ep >= a.goal) p.animeGoal++;
      });
      p.todo += m.todos.filter(t => t.done).length;
      p.lift += m.gym.lifts.filter(l => l.target !== l.start && liftPct(l) >= 1).length;
      const saved = moneySum(m.money, 'save');
      p.saved += saved;
      if (m.money.saveGoal > 0 && saved >= m.money.saveGoal) p.saveGoal++;
      if (monthPct(m, k) >= 100) p.perfect++;
    });
    p.surah = learnedTotal();
    const xp = p.session * XP.session + p.surah * XP.surah + p.episode * XP.episode +
      p.animeGoal * XP.animeGoal + p.animeDone * XP.animeDone + p.todo * XP.todo + p.lift * XP.lift +
      p.saveGoal * XP.saveGoal + Math.floor(p.saved / 10) * XP.per10eur + p.perfect * XP.perfect;
    return { xp, p };
  }

  function renderHud() {
    const { xp } = computeXP();
    const lvl = levelOf(xp);
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
        saved: m ? moneySum(m.money, 'save') : 0,
        spent: m ? moneySum(m.money, 'spend') : 0
      };
    });
    const col = f => rows.map(f);

    const { xp, p } = computeXP();
    const lvl = levelOf(xp);
    const rank = rankOf(lvl);
    const base = levelNeed(lvl);
    const next = levelNeed(lvl + 1);
    const nextRank = RANKS.find(r => r.lvl > lvl);
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
      ['Mois validés à 100 %', p.perfect, XP.perfect]
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

      <h3 class="sub">Mois par mois</h3>
      <div class="charts">
        ${barChart({ title: 'Score du mois', keys, series: [{ name: 'Score', color: 'var(--c-anime)', values: col(r => r.pct) }], fmt: v => Math.round(v) + ' %' })}
        ${barChart({ title: 'Séances de salle', keys, series: [{ name: 'Séances', color: 'var(--c-gym)', values: col(r => r.sessions) }], fmt: v => String(Math.round(v)), unit: ' séance(s)' })}
        ${barChart({ title: 'Sourates apprises', keys, series: [{ name: 'Sourates', color: 'var(--c-quran)', values: col(r => r.surahs) }], fmt: v => String(Math.round(v)), unit: ' sourate(s)' })}
        ${barChart({ title: 'Épisodes vus', keys, series: [{ name: 'Épisodes', color: 'var(--c-anime)', values: col(r => r.episodes) }], fmt: v => String(Math.round(v)), unit: ' ép.' })}
        ${barChart({ title: 'Argent', keys, series: [
          { name: 'Mis de côté', color: 'var(--cat-3)', values: col(r => r.saved) },
          { name: 'Dépensé', color: 'var(--cat-2)', values: col(r => r.spent) }
        ], fmt: v => eur(v) })}
      </div>
      <details class="b-table">
        <summary>Voir les chiffres en tableau</summary>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Mois</th><th>Score</th><th>Séances</th><th>Sourates</th><th>Épisodes</th><th>Mis de côté</th><th>Dépensé</th></tr></thead>
            <tbody>${rows.map(r => `<tr><td>${labelOf(r.k)}</td><td>${r.pct} %</td><td>${r.sessions}</td><td>${r.surahs}</td><td>${r.episodes}</td><td>${eur(r.saved)}</td><td>${eur(r.spent)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </details>

      <h3 class="sub">D'où vient ton XP</h3>
      ${xpRows.length ? `<ul class="xp-list">${xpRows.map(r => `<li><span>${r[0]}</span><em>${r[1]} × ${r[2]}</em><b>${r[1] * r[2]} XP</b></li>`).join('')}</ul>`
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

  function openModal(id) {
    if (id === 'bilanModal') renderBilan();
    $('#' + id).hidden = false;
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

    p.animes
      .filter(a => !(a.total > 0 && a.ep >= a.total))
      .forEach(a => {
        if (has(m.animes, 'name', a.name)) return;
        const delta = Math.max(1, a.goal - a.start);
        const goal = a.total > 0 ? Math.min(a.total, a.ep + delta) : a.ep + delta;
        const id = uid();
        m.animes.push({ id, name: a.name, ep: a.ep, start: a.ep, goal, total: a.total, al: a.al || null });
        added.add(id);
      });

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
    $('#themeBtn').textContent = theme === 'dark' ? 'Mode jour' : 'Mode nuit';
  }

  /* =========================================================
     Événements
     ========================================================= */
  const byId = (list, id) => list.find(x => x.id === id);

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
      case 'theme': {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        state.theme = next;
        applyTheme(next);
        save();
        break;
      }

      /* --- animes --- */
      case 'anime-plus':
      case 'anime-minus': {
        const a = byId(M().animes, id);
        if (!a) return;
        const { x, y } = centerOf(t);
        const before = animePct(a);
        a.ep = Math.max(0, a.ep + (act === 'anime-plus' ? 1 : -1));
        if (act === 'anime-plus') markActive();
        const after = animePct(a);
        const reached = before < 1 && after >= 1;
        if (reached) fresh.add(id);
        save(); renderAnime(); renderHeader(); afterRender();
        const card = $(`#animeBody [data-id="${id}"]`);
        if (card) bump($('.ep-num', card));
        if (act === 'anime-plus') floatText(x, y - 10, '+1');
        if (reached) celebrate(card, 'クリア!');
        break;
      }
      case 'anime-del': {
        const m = M();
        const a = byId(m.animes, id);
        if (!a) return;
        const snap = snapshot();
        m.animes = m.animes.filter(x => x.id !== id);
        save(); renderAnime(); renderHeader(); afterRender();
        toast(`« ${a.name} » supprimé.`, snap);
        break;
      }
      case 'anime-rate': {
        const a = byId(M().animes, id);
        if (!a) return;
        const v = Number(t.dataset.v);
        a.rating = a.rating === v ? 0 : v;
        save(); renderAnime(); afterRender();
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
        } else if (k) {
          delete learned[n];
        } else {
          const before = learnedIn(current);
          learned[n] = current;
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
        const a = byId(m.animes, id);
        if (a) { a.name = t.value.trim() || a.name; t.value = a.name; save(); }
        break;
      }
      case 'anime-goal':
      case 'anime-total': {
        const a = byId(m.animes, id);
        if (!a) return;
        const before = animePct(a);
        if (act === 'anime-goal') a.goal = Math.max(0, Math.round(num(t.value, a.goal)));
        else a.total = Math.max(0, Math.round(num(t.value, 0)));
        if (before < 1 && animePct(a) >= 1) fresh.add(id);
        save(); renderAnime(); renderHeader(); afterRender();
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
        if (act === 'lift-cur') l.cur = num(t.value, l.cur);
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

  // Quand on quitte la partie Animes, on applique les infos arrivées pendant la saisie
  $('#animeBody').addEventListener('focusout', () => {
    setTimeout(() => {
      if (pendingAnimeRender && !$('#animeBody').contains(document.activeElement)) { renderAnime(); afterRender(); }
    }, 250);
  });

  // Entrée dans un petit champ = valider (sans recharger la page)
  document.addEventListener('keydown', e => {
    const t = e.target;
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

    if (type === 'anime') {
      const name = String(d.name || '').trim();
      if (!name) return;
      const ep = Math.max(0, Math.round(num(d.ep, 0)));
      const al = picked.anime && picked.anime.title === name ? picked.anime : null;
      const total = Math.max(0, Math.round(num(d.total, 0))) || (al && al.episodes) || 0;
      let goal = Math.round(num(d.goal, NaN));
      if (!Number.isFinite(goal) || goal <= ep) goal = total > ep ? Math.min(total, ep + 12) : ep + 12;
      const id = uid();
      m.animes.push({ id, name, ep, start: ep, goal, total, al, alTried: Boolean(al) });
      picked.anime = null;
      added.add(id);
      save(); renderAnime(); renderHeader(); afterRender();
      $('#animeBody form[data-form="anime"] [name="name"]').focus();
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
      m.gym.lifts.push({ id, name, cur, start: cur, target, unit: String(d.unit || '').trim() });
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
    try { persistLocal(); } catch (e) { /* rien */ }
    flushSync();
  });

  // On revient sur le site (autre onglet, autre appli) : on récupère la dernière version
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSync();
    else syncNow();
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
  setupTooltip();
  renderAll(0);
  setSyncStatus(sync.token ? 'busy' : 'off');
  if (sync.token) syncNow();
  // Les dates de sortie bougent : on revérifie de temps en temps si la page reste ouverte
  setInterval(enrichAnimes, 30 * 60 * 1000);
})();
