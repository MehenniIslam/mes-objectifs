/* =========================================================
   Callisthénie : les figures, de la plus facile à la plus dure.
   Chaque dessin est une silhouette en SVG (vue de côté) :
   - torso : épaule → hanche
   - limbs : bras / jambes au premier plan
   - back  : bras / jambes derrière (en plus clair)
   - head  : tête, eye : direction du regard
   - floor / bar / para / dip / wall / pole : le matériel
   ========================================================= */
(() => {
  'use strict';

  const TIERS = [
    { n: 1, name: 'Débutant', jp: '初級' },
    { n: 2, name: 'Intermédiaire', jp: '中級' },
    { n: 3, name: 'Avancé', jp: '上級' },
    { n: 4, name: 'Expert', jp: '達人' },
    { n: 5, name: 'Légende', jp: '伝説' }
  ];

  const SKILLS = [
    // ----- Niveau 1 -----
    {
      id: 'hang', tier: 1, name: 'Suspension', en: 'Dead hang', goal: 'Tenir 30 s',
      tip: 'Bras tendus, épaules actives (tire-les vers le bas). C\'est la base de toutes les tractions.',
      pose: { bar: [36, 84, 10], torso: [[60, 29], [60, 54]], limbs: [[[60, 29], [60, 10]], [[60, 54], [60, 67], [61, 80]]],
        back: [[[60, 54], [57, 67], [55, 79]]], head: [65, 21], eye: [3, -1] }
    },
    {
      id: 'pushup', tier: 1, name: 'Pompes', en: 'Push-up', goal: '10 à la suite',
      tip: 'Corps gainé bien droit de la tête aux pieds, poitrine jusqu\'au sol. Trop dur ? Commence sur les genoux.',
      pose: { floor: true, torso: [[33, 60], [66, 67]], limbs: [[[33, 60], [33, 71], [33, 81.5]], [[66, 67], [84, 73], [101, 80]]],
        head: [23, 57], eye: [-2, 2] }
    },
    {
      id: 'dips', tier: 1, name: 'Dips', en: 'Dips', goal: '10 à la suite',
      tip: 'Descends jusqu\'à avoir les coudes à 90°, sans hausser les épaules. Commence entre deux chaises solides.',
      pose: { dip: [36, 80, 50], torso: [[67, 38], [59, 62]], limbs: [[[67, 38], [56, 38], [56, 50]], [[59, 62], [63, 74], [50, 79]]],
        back: [[[59, 62], [59, 75], [46, 80]]], head: [75, 31], eye: [3, 0] }
    },
    {
      id: 'pullup', tier: 1, name: 'Traction', en: 'Pull-up', goal: '1 propre, menton au-dessus de la barre',
      tip: 'Pars bras tendus. Pour y arriver : négatives (monte en sautant et descends très lentement) et élastique.',
      pose: { bar: [36, 84, 22], torso: [[57, 30], [56, 57]], limbs: [[[57, 30], [67, 36], [62, 22]], [[56, 57], [58, 71], [54, 83]]],
        back: [[[56, 57], [53, 71], [49, 81]]], head: [63, 14], eye: [3, -1] }
    },
    {
      id: 'frog', tier: 1, name: 'Frog stand', en: 'Grenouille', goal: 'Tenir 10 s',
      tip: 'Mains au sol, genoux posés sur les coudes, penche-toi en avant jusqu\'à décoller les pieds. Ton premier équilibre !',
      pose: { floor: true, torso: [[72, 60], [50, 51]], limbs: [[[72, 60], [64, 69], [68, 81.5]], [[50, 51], [63, 64], [45, 70]]],
        back: [[[72, 60], [67, 70], [72, 81.5]]], head: [83, 63], eye: [2, 2] }
    },

    // ----- Niveau 2 -----
    {
      id: 'tuckl', tier: 2, name: 'Tuck L-sit', en: 'L-sit groupé', goal: 'Tenir 10 s',
      tip: 'Bras tendus, pousse fort dans les mains, genoux contre la poitrine et fesses décollées du sol.',
      pose: { para: [48, 72, 70], torso: [[60, 47], [55, 70]], limbs: [[[60, 47], [60, 58], [60, 70]], [[55, 70], [71, 59], [74, 71]]],
        head: [64, 38], eye: [3, 0] }
    },
    {
      id: 'lsit', tier: 2, name: 'L-sit', en: 'L-sit', goal: 'Tenir 10 s',
      tip: 'Jambes tendues à l\'horizontale, épaules basses. Tends une jambe après l\'autre pour progresser.',
      pose: { para: [44, 68, 70], torso: [[56, 47], [51, 70]], limbs: [[[56, 47], [56, 58], [56, 70]], [[51, 70], [74, 70], [98, 69]]],
        head: [60, 38], eye: [3, 0] }
    },
    {
      id: 'wallhs', tier: 2, name: 'Poirier contre le mur', en: 'Wall handstand', goal: 'Tenir 30 s',
      tip: 'Ventre face au mur (le plus propre) : monte en marchant avec les pieds. Corps gainé, bras tendus.',
      pose: { floor: true, wall: 100, torso: [[77, 60], [87, 34]], limbs: [[[77, 60], [76, 71], [76, 81.5]], [[87, 34], [92, 20], [96, 6]]],
        head: [70, 68], eye: [-2, 2] }
    },
    {
      id: 'pistol', tier: 2, name: 'Pistol squat', en: 'Squat sur une jambe', goal: '1 de chaque jambe',
      tip: 'Descends sur une jambe, l\'autre tendue devant. Commence en t\'asseyant sur un banc, ou en te tenant à une porte.',
      pose: { floor: true, torso: [[61, 44], [50, 68]], limbs: [[[61, 44], [75, 46], [90, 46]], [[50, 68], [69, 65], [59, 81.5]], [[50, 68], [74, 69], [98, 67]]],
        head: [69, 37], eye: [3, 0] }
    },
    {
      id: 'tuckbl', tier: 2, name: 'Tuck back lever', en: 'Back lever groupé', goal: 'Tenir 10 s',
      tip: 'Dos vers le sol, genoux contre la poitrine, bras tendus derrière toi. Essaie d\'abord aux anneaux ou à une barre basse.',
      pose: { bar: [30, 90, 18], torso: [[54, 44], [80, 44]], limbs: [[[54, 44], [55, 31], [56, 18]], [[80, 44], [67, 55], [80, 60]]],
        head: [43, 46], eye: [0, 3] }
    },

    // ----- Niveau 3 -----
    {
      id: 'tuckfl', tier: 3, name: 'Tuck front lever', en: 'Front lever groupé', goal: 'Tenir 10 s',
      tip: 'Visage vers le haut, genoux contre la poitrine, bras tendus. Pense à « tirer la barre vers tes hanches ».',
      pose: { bar: [30, 90, 18], torso: [[54, 42], [79, 44]], limbs: [[[54, 42], [61, 30], [68, 18]], [[79, 44], [68, 32], [81, 33]]],
        head: [43, 41], eye: [0, -3] }
    },
    {
      id: 'muscleup', tier: 3, name: 'Muscle-up', en: 'Muscle-up', goal: '1 propre',
      tip: 'Traction explosive, puis tu passes les épaules au-dessus de la barre et tu pousses. Il faut environ 10 tractions et 15 dips.',
      pose: { bar: [34, 86, 52], torso: [[60, 30], [57, 55]], limbs: [[[60, 30], [61, 41], [61, 52]], [[57, 55], [58, 70], [56, 83]]],
        back: [[[57, 55], [54, 70], [51, 82]]], head: [64, 21], eye: [3, 0], up: true }
    },
    {
      id: 'tuckpl', tier: 3, name: 'Tuck planche', en: 'Planche groupée', goal: 'Tenir 10 s',
      tip: 'Bras tendus, épaules bien en avant des mains, genoux serrés contre la poitrine, pieds décollés.',
      pose: { floor: true, torso: [[67, 61], [48, 58]], limbs: [[[67, 61], [66, 71], [65, 81.5]], [[48, 58], [56, 70], [42, 71]]],
        head: [78, 60], eye: [2, 2] }
    },
    {
      id: 'hs', tier: 3, name: 'Équilibre libre', en: 'Freestanding handstand', goal: 'Tenir 10 s',
      tip: 'Corps aligné, regarde entre tes mains et corrige avec les doigts. Travaille d\'abord le poirier contre le mur.',
      pose: { floor: true, torso: [[60, 60], [60, 34]], limbs: [[[60, 60], [60, 71], [60, 81.5]], [[60, 34], [60, 20], [60, 6]]],
        head: [66, 69], eye: [1, 3] }
    },
    {
      id: 'bl', tier: 3, name: 'Back lever', en: 'Back lever', goal: 'Tenir 5 s',
      tip: 'Corps tendu face au sol, bras tendus derrière. Passe par le tuck, puis une jambe tendue, puis jambes écartées.',
      pose: { bar: [30, 90, 18], torso: [[52, 44], [80, 44]], limbs: [[[52, 44], [53, 31], [54, 18]], [[80, 44], [96, 44], [112, 44]]],
        head: [41, 46], eye: [0, 3] }
    },

    // ----- Niveau 4 -----
    {
      id: 'vsit', tier: 4, name: 'V-sit', en: 'V-sit', goal: 'Tenir 5 s',
      tip: 'Mains derrière les hanches, jambes en V bien au-dessus de l\'horizontale. Il faut un L-sit très solide et de la souplesse.',
      pose: { para: [50, 74, 72], torso: [[51, 49], [60, 71]], limbs: [[[51, 49], [56, 60], [62, 72]], [[60, 71], [77, 52], [93, 33]]],
        head: [46, 41], eye: [3, -1] }
    },
    {
      id: 'flag', tier: 4, name: 'Drapeau', en: 'Human flag', goal: 'Tenir 5 s',
      tip: 'Bras du haut qui tire, bras du bas qui pousse, corps à l\'horizontale. Commence jambes groupées.',
      pose: { pole: 26, torso: [[44, 42], [72, 42]], limbs: [[[44, 42], [27, 24]], [[72, 42], [90, 42], [108, 42]]],
        back: [[[44, 42], [27, 60]]], head: [35, 42], eye: [0, -3] }
    },
    {
      id: 'hspu', tier: 4, name: 'Pompe en équilibre', en: 'Handstand push-up', goal: '1 sans le mur',
      tip: 'En équilibre, descends la tête jusqu\'au sol puis remonte. Fais-les d\'abord contre le mur.',
      pose: { floor: true, torso: [[57, 64], [60, 38]], limbs: [[[57, 64], [46, 72], [55, 81.5]], [[60, 38], [61, 23], [62, 8]]],
        head: [63, 75], eye: [1, 3] }
    },
    {
      id: 'fl', tier: 4, name: 'Front lever', en: 'Front lever', goal: 'Tenir 5 s',
      tip: 'Corps tendu à l\'horizontale, visage vers le haut. Passe par le tuck avancé (dos plat), puis jambes écartées.',
      pose: { bar: [30, 90, 18], torso: [[52, 42], [80, 43]], limbs: [[[52, 42], [60, 30], [68, 18]], [[80, 43], [96, 43], [112, 43]]],
        head: [41, 41], eye: [0, -3] }
    },
    {
      id: 'straddle', tier: 4, name: 'Straddle planche', en: 'Planche jambes écartées', goal: 'Tenir 5 s',
      tip: 'Comme la planche, mais jambes écartées (plus facile à équilibrer). Il faut une grosse force d\'épaules.',
      pose: { floor: true, torso: [[68, 61], [44, 61]], limbs: [[[68, 61], [66, 71], [64, 81.5]], [[44, 61], [28, 59], [12, 58]]],
        back: [[[44, 61], [28, 64], [12, 66]]], head: [79, 60], eye: [2, 2] }
    },

    // ----- Niveau 5 -----
    {
      id: 'oap', tier: 5, name: 'Traction à un bras', en: 'One-arm pull-up', goal: '1 de chaque bras',
      tip: 'Le graal des tractions. Passe par les tractions archer et les négatives à un bras.',
      pose: { bar: [36, 84, 22], torso: [[57, 30], [56, 57]], limbs: [[[57, 30], [67, 36], [62, 22]], [[56, 57], [58, 71], [54, 83]]],
        back: [[[57, 30], [51, 42], [50, 54]]], head: [63, 14], eye: [3, -1] }
    },
    {
      id: 'planche', tier: 5, name: 'Full planche', en: 'Planche', goal: 'Tenir 3 s',
      tip: 'Corps parallèle au sol, jambes serrées, seules tes mains touchent le sol. Des années de travail !',
      pose: { floor: true, torso: [[68, 61], [44, 61]], limbs: [[[68, 61], [66, 71], [64, 81.5]], [[44, 61], [28, 61], [12, 61]]],
        head: [79, 60], eye: [2, 2] }
    },
    {
      id: 'manna', tier: 5, name: 'Manna', en: 'Manna', goal: 'Tenir 2 s',
      tip: 'Mains derrière toi, hanches très hautes, jambes qui passent au-dessus de la tête. Un des skills les plus durs.',
      pose: { para: [44, 68, 72], torso: [[44, 60], [62, 62]], limbs: [[[44, 60], [50, 66], [56, 72]], [[62, 62], [58, 40], [50, 18]]],
        head: [36, 65], eye: [-2, 2] }
    },
    {
      id: 'oahs', tier: 5, name: 'Équilibre sur un bras', en: 'One-arm handstand', goal: 'Tenir 5 s',
      tip: 'Le roi des équilibres. Il faut d\'abord tenir l\'équilibre libre 60 s sans bouger.',
      pose: { floor: true, torso: [[60, 60], [59, 34]], limbs: [[[60, 60], [60, 71], [60, 81.5]], [[59, 34], [66, 21], [74, 8]]],
        back: [[[60, 60], [72, 57], [84, 55]], [[59, 34], [52, 21], [45, 8]]], head: [66, 69], eye: [1, 3] }
    }
  ];

  const pts = list => list.map(p => p.join(',')).join(' ');

  // Dessin d'une figure : matériel, ombre colorée décalée (style manga), puis la silhouette
  function svg(skill) {
    const P = skill.pose;
    let gear = '';
    if (P.wall) {
      gear += `<rect class="cg-wall" x="${P.wall}" y="0" width="16" height="86"/><line class="cg-line" x1="${P.wall}" y1="0" x2="${P.wall}" y2="85"/>`;
    }
    if (P.floor || P.para || P.dip || P.pole) gear += '<rect class="cg-ground" x="0" y="85" width="120" height="5"/><line class="cg-line" x1="4" y1="85" x2="116" y2="85"/>';
    if (P.bar) gear += `<line class="cg-bar" x1="${P.bar[0]}" y1="${P.bar[2]}" x2="${P.bar[1]}" y2="${P.bar[2]}"/>`;
    if (P.para) gear += `<path class="cg-gear" d="M${P.para[0]},85 L${P.para[0] + 5},${P.para[2]} H${P.para[1] - 5} L${P.para[1]},85"/>`;
    if (P.dip) gear += `<path class="cg-gear" d="M${P.dip[0]},85 V${P.dip[2]} H${P.dip[1]} V85"/>`;
    if (P.pole) gear += `<line class="cg-bar" x1="${P.pole}" y1="2" x2="${P.pole}" y2="85"/>`;

    const back = (P.back || []).map(l => `<polyline class="cf-back" points="${pts(l)}"/>`).join('');
    const body = `<polyline class="cf-torso" points="${pts(P.torso)}"/>` +
      P.limbs.map(l => `<polyline class="cf-limb" points="${pts(l)}"/>`).join('') +
      `<circle class="cf-head" cx="${P.head[0]}" cy="${P.head[1]}" r="7.5"/>`;
    const eye = P.eye ? `<circle class="cf-eye" cx="${P.head[0] + P.eye[0]}" cy="${P.head[1] + P.eye[1]}" r="1.7"/>` : '';
    const up = P.up ? '<path class="cf-motion" d="M88 44 V24 M82 30 L88 22 L94 30"/>' : '';

    return `<svg class="cali-svg" viewBox="0 0 120 90" role="img" aria-label="${skill.name}">
      ${gear}
      <g class="cf-shadow" transform="translate(2.6 2.6)">${body}</g>
      <g class="cf-main">${back}${body}${eye}</g>
      ${up}
    </svg>`;
  }

  window.CALI = { TIERS, SKILLS, svg };
})();
