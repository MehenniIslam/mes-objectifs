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

  function sections(m) {
    const out = {};
    if (m.animes.length) out.anime = avg(m.animes.map(animePct));
    if (m.quranGoal > 0) out.quran = clamp01(learnedIn(current) / m.quranGoal);
    const g = [];
    if (m.gym.goal > 0) g.push(clamp01(m.gym.days.length / m.gym.goal));
    m.gym.lifts.forEach(l => g.push(liftPct(l)));
    if (g.length) out.gym = avg(g);
    if (m.todos.length) out.todos = m.todos.filter(t => t.done).length / m.todos.length;
    if (m.money.saveGoal > 0) out.money = clamp01(moneySum(m.money, 'save') / m.money.saveGoal);
    return out;
  }

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
  }

  /* ---------- Animes ---------- */
  function renderAnime() {
    const m = M();
    const cards = m.animes.map(a => {
      const p = animePct(a);
      const done = p >= 1;
      const finished = a.total > 0 && a.ep >= a.total;
      const seen = Math.max(0, a.ep - a.start);
      const need = Math.max(0, a.goal - a.start);
      return `
        <article class="card anime ${done ? 'is-done' : ''} ${added.has(a.id) ? 'is-new' : ''}" data-id="${a.id}">
          <div class="anime-top">
            <input class="ghost name" data-act="anime-name" value="${esc(a.name)}" aria-label="Nom de l'anime">
            ${finished ? '<span class="tag">TERMINÉ</span>' : ''}
            <button class="x" data-act="anime-del" aria-label="Supprimer ${esc(a.name)}" title="Supprimer">×</button>
          </div>
          <div class="anime-mid">
            <button class="step" data-act="anime-minus" aria-label="Retirer un épisode">−</button>
            <div class="ep"><small>ÉP.</small><span class="ep-num">${a.ep}</span></div>
            <button class="step plus" data-act="anime-plus" aria-label="J'ai vu un épisode de plus">+1</button>
            <div class="anime-goal">
              <label>Objectif : ép. <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-goal" value="${a.goal}"></label>
              <label class="muted">sur <input class="num-in" type="number" min="0" inputmode="numeric" data-act="anime-total" value="${a.total || ''}" placeholder="?"> au total</label>
            </div>
          </div>
          ${bar('anime-' + a.id, p)}
          <div class="foot"><span>${seen} / ${need} épisode${need > 1 ? 's' : ''} ce mois</span><b>${Math.round(p * 100)}%</b></div>
          ${done ? `<span class="hanko ${fresh.has(a.id) ? 'fresh' : ''}" aria-hidden="true">済</span>` : ''}
        </article>`;
    }).join('');

    $('#animeBody').innerHTML =
      (cards ? `<div class="stack">${cards}</div>`
        : emptyBox('Aucun anime pour ce mois.', "Ajoute ce que tu veux regarder : le nom, l'épisode où tu en es, et l'épisode où tu veux arriver à la fin du mois.")) + `
      <form class="add" data-form="anime" autocomplete="off">
        <input class="wide" name="name" placeholder="Nom de l'anime" required maxlength="80">
        <input name="ep" type="number" min="0" inputmode="numeric" placeholder="Ép. actuel">
        <input name="goal" type="number" min="0" inputmode="numeric" placeholder="Objectif ép.">
        <input name="total" type="number" min="0" inputmode="numeric" placeholder="Total ép.">
        <button class="btn primary" type="submit">Ajouter</button>
      </form>`;
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

    // Historique du mois (le plus récent en haut)
    const entries = mo.entries.slice()
      .sort((a, b) => b.day - a.day || (b.t || 0) - (a.t || 0))
      .map(e => {
        const jn = e.type === 'save' && e.jar ? jarName(e.jar) : '';
        const base = e.label || (jn ? '' : (e.type === 'save' ? 'Mis de côté' : 'Dépense'));
        const label = base + (jn ? (base ? ' → ' : 'Cagnotte ') + jn : '');
        return `
          <li class="entry ${e.type} ${added.has(e.id) ? 'is-new' : ''}" data-id="${e.id}">
            <span class="e-day">${e.day} ${MOIS_COURT[mon - 1]}</span>
            <span class="e-label" title="${esc(label)}">${esc(label)}</span>
            <span class="e-amt">${e.type === 'save' ? '+' : '−'}${eur(e.amount)}</span>
            <button type="button" class="x" data-act="money-del" aria-label="Supprimer" title="Supprimer">×</button>
          </li>`;
      }).join('');

    // Où part l'argent : dépenses regroupées par nom
    const spends = mo.entries.filter(e => e.type === 'spend');
    const groups = {};
    spends.forEach(e => {
      const k = norm(e.label || 'autre') || 'autre';
      if (!groups[k]) groups[k] = { name: e.label || 'Autre', total: 0 };
      groups[k].total = round2(groups[k].total + e.amount);
    });
    const top = Object.values(groups).sort((a, b) => b.total - a.total).slice(0, 5);
    const max = top.length ? top[0].total : 0;
    const breakdown = spends.length >= 2 ? `
      <h3 class="sub">Où part ton argent ?</h3>
      <div class="spend-break">${top.map(g => `
        <div class="sb-row">
          <span class="sb-name" title="${esc(g.name)}">${esc(g.name)}</span>
          <span class="sb-bar"><i style="width:${max ? (g.total / max) * 100 : 0}%"></i></span>
          <b>${eur(g.total)}</b>
        </div>`).join('')}
      </div>` : '';

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
            <span class="of">/ <input class="num-in" type="text" inputmode="decimal" data-act="jar-target" value="${j.target || ''}" placeholder="?" aria-label="Objectif de la cagnotte"> €</span>
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
            <span class="of">/ <input type="text" inputmode="decimal" data-act="money-goal" value="${mo.saveGoal || ''}" placeholder="?" aria-label="Objectif d'épargne du mois"> €</span>
          </div>
          ${bar('save-' + current, sp)}
        </div>
        <div class="m-stat ${over ? 'is-over' : ''}">
          <span class="lbl">DÉPENSÉ CE MOIS</span>
          <div class="q-stat">
            <span class="big sm">${eur(spent)}</span>
            <span class="of">/ <input type="text" inputmode="decimal" data-act="money-budget" value="${mo.budget || ''}" placeholder="?" aria-label="Budget maximum du mois"> € max</span>
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
        <label class="day-lbl">Jour <input name="day" type="number" min="1" max="${dim}" value="${dayDefault}" inputmode="numeric"></label>
        <button class="btn primary" type="submit">Enregistrer</button>
      </form>

      <h3 class="sub">Historique du mois</h3>
      ${entries ? `<ul class="ledger">${entries}</ul>`
        : "<p class=\"empty-line\">Rien d'enregistré pour l'instant. Chaque fois que tu mets de l'argent de côté ou que tu dépenses quelque chose, note-le juste au-dessus.</p>"}
      ${breakdown}

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
  function toast(msg, undoSnap) {
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
    toastTimer = setTimeout(() => t.classList.remove('show'), undoSnap ? 5000 : 2600);
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
        m.animes.push({ id, name: a.name, ep: a.ep, start: a.ep, goal, total: a.total });
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
    if (e.target.id === 'syncModal') { closeSyncModal(); return; }   // clic à côté de la fenêtre
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
        if (td.done) fresh.add(id);
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
    }
  });

  // Entrée dans un petit champ = valider (sans recharger la page)
  document.addEventListener('keydown', e => {
    const t = e.target;
    // Ctrl+S : tout est déjà enregistré, on le confirme
    if (e.key === 'Escape' && !$('#syncModal').hidden) { closeSyncModal(); return; }
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
      const total = Math.max(0, Math.round(num(d.total, 0)));
      let goal = Math.round(num(d.goal, NaN));
      if (!Number.isFinite(goal) || goal <= ep) goal = total > ep ? Math.min(total, ep + 12) : ep + 12;
      const id = uid();
      m.animes.push({ id, name, ep, start: ep, goal, total });
      added.add(id);
      save(); renderAnime(); renderHeader(); afterRender();
      $('#animeBody form [name="name"]').focus();
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
      mo.entries.push({ id, type: type2, amount, label: String(d.label || '').trim(), day, jar, t: Date.now() });
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

  /* ---------- Démarrage ---------- */
  applyTheme(state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  renderAll(0);
  setSyncStatus(sync.token ? 'busy' : 'off');
  if (sync.token) syncNow();
})();
