// Clean Feed — Instagram
// Trois options indépendantes (menu de la barre d'outils) :
//   igHome    → accueil : posts, "Vous êtes à jour" et suggestions masqués, stories gardées
//   igExplore → Explorer : uniquement la barre de recherche
//   igReels   → bouton Reels, vignettes de reels, redirection vers l'accueil
// Les règles CSS sont dans instagram.css, activées par des classes posées sur <html>.

(function () {
  "use strict";

  const root = document.documentElement;
  const HIDDEN_ATTR = "data-clean-feed-hidden";
  const COLLAPSED = "cf-collapsed";

  // Textes qui marquent la fin du fil ou un bloc de suggestions.
  // Tout ce qui suit ces blocs est masqué.
  const MARKERS = [
    "vous êtes à jour",
    "publications suggérées",
    "suggestions pour vous",
    "you're all caught up",
    "you’re all caught up",
    "suggested posts",
    "suggested for you",
  ];

  let s = { ...IC_DEFAULTS };
  let dirty = false; // des éléments sont actuellement repliés

  const path = () => location.pathname;
  const isHome = () => path() === "/" || path() === "";
  // Explorer seulement : pas les pages de hashtags ni de lieux (/explore/tags/…).
  const isExplore = () => /^\/explore\/?$/.test(path()) || /^\/explore\/search\/?$/.test(path());

  // ---------- Classes de page sur <html> ----------
  // cf-page-* : où l'on se trouve. cf-home / cf-explore : en plus, l'option est active.
  // Le "clean" ne s'applique QU'À l'accueil et à Explorer ; profils, messages et
  // publications ne sont jamais touchés.
  function applyFlags() {
    root.classList.toggle("cf-reels", s.igEnabled && s.igReels);
    root.classList.toggle("cf-page-home", s.igEnabled && isHome());
    root.classList.toggle("cf-page-explore", s.igEnabled && isExplore());
    root.classList.toggle("cf-home", s.igEnabled && s.igHome && isHome());
    root.classList.toggle("cf-explore", s.igEnabled && s.igExplore && isExplore());
    // Accueil : on garde la page invisible tant que les stories ne sont pas centrées,
    // pour qu'on ne les voie jamais sauter de la gauche vers le centre.
    const nowHome = root.classList.contains("cf-home");
    if (nowHome && !wasHome) {
      root.classList.remove("cf-ready");
      stableKey = "";
      clearTimeout(readyTimer);
      readyTimer = setTimeout(() => root.classList.add("cf-ready"), 2500);
    }
    if (!nowHome) {
      clearTimeout(readyTimer);
      root.classList.add("cf-ready");
    }
    wasHome = nowHome;
  }
  let wasHome = false;
  let stableKey = "";
  let stableSince = 0;
  let recheck = 0;
  let readyTimer = 0;

  // ---------- Redirection du fil de reels ----------
  // Seul l'onglet Reels (/reels/) est bloqué. Un reel précis (/reel/xxx/), par
  // exemple reçu en message, s'ouvre normalement.
  function checkURL() {
    if (!(s.igEnabled && s.igReels)) return;
    if (/^\/reels\/?$/.test(path())) {
      location.replace("/");
    }
  }

  // ---------- Repli / restauration ----------
  // On replie (hauteur 0) au lieu de display:none pour garder la largeur des
  // colonnes : sinon Instagram recentre les stories.
  function collapse(el) {
    if (el.hasAttribute(HIDDEN_ATTR)) return;
    el.classList.add(COLLAPSED);
    el.setAttribute(HIDDEN_ATTR, "1");
    dirty = true;
  }

  function restoreAll() {
    if (!dirty) return;
    document.querySelectorAll(`[${HIDDEN_ATTR}]`).forEach((el) => {
      el.classList.remove(COLLAPSED);
      el.removeAttribute(HIDDEN_ATTR);
    });
    dirty = false;
  }

  // ---------- Stories centrées ----------
  // Une fois le fil masqué, les stories restent dans une colonne (~630 px) collée à
  // gauche, alors que la page est vide à droite. On repère la rangée (≥ 3 avatars alignés,
  // hors posts et blocs repliés), puis on décale toute sa colonne pour centrer les stories
  // dans la page. On mesure la page au lieu de viser des noms de classes, qu'Instagram change.
  let tray = null;  // la rangée de stories

  function avatarImgs(scope) {
    return Array.from(scope.querySelectorAll("img")).filter((img) => {
      if (img.closest("article, [" + HIDDEN_ATTR + "]")) return false;
      const r = img.getBoundingClientRect();
      return r.width >= 36 && r.width <= 130 && Math.abs(r.width - r.height) <= 4;
    });
  }

  function findTray(main) {
    const rows = new Map();
    for (const img of avatarImgs(main)) {
      const key = Math.round(img.getBoundingClientRect().top / 8);
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push(img);
    }
    let best = [];
    rows.forEach((list) => {
      if (list.length > best.length) best = list;
    });
    if (best.length < 3) return null;
    let node = best[0].parentElement;
    while (node && node !== main && !best.every((i) => node.contains(i))) node = node.parentElement;
    return node && node !== main ? node : null;
  }

  // Le décalage est porté par <main> via une variable CSS. Il est mémorisé par largeur de
  // fenêtre : au chargement suivant il est appliqué dès le premier affichage, sans saut.
  const DX_KEY = "cf-dx-";
  function cachedDx() {
    try {
      return parseInt(localStorage.getItem(DX_KEY + window.innerWidth), 10) || 0;
    } catch (e) {
      return 0;
    }
  }
  function setDx(dx) {
    root.style.setProperty("--cf-dx", dx + "px");
  }
  setDx(cachedDx());
  let dx = 0;

  function clearStories() {
    tray = null;
    setDx(0);
  }

  function centerStories(main) {
    if (tray && !main.contains(tray)) tray = null;
    setDx(0); // on mesure sans décalage
    if (!tray) tray = findTray(main);
    if (!tray) {
      setDx(cachedDx());
      return;
    }
    const imgs = avatarImgs(tray);
    if (imgs.length < 3) {
      tray = null;
      return;
    }
    let left = Infinity;
    let right = -Infinity;
    imgs.forEach((img) => {
      const r = img.getBoundingClientRect();
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
    });
    // Colonne = premier ancêtre assez large (≥ 600 px) ; si les stories défilent et
    // dépassent, on centre la colonne.
    let col = tray.parentElement;
    while (col && col !== main && col.getBoundingClientRect().width < 600) col = col.parentElement;
    if (!col || col === main) col = tray;
    const cr = col.getBoundingClientRect();
    const overflow = right > cr.right + 2 || left < cr.left - 2;
    const itemsCenter = overflow ? cr.left + cr.width / 2 : (left + right) / 2;
    dx = Math.round(document.documentElement.clientWidth / 2 - itemsCenter);
    setDx(dx);
    try {
      localStorage.setItem(DX_KEY + window.innerWidth, String(dx));
    } catch (e) {
      /* stockage indisponible : sans importance */
    }
  }

  // ---------- Accueil propre ----------
  function cleanHome() {
    if (!root.classList.contains("cf-home")) {
      restoreAll(); // option coupée ou autre page : on remet tout
      clearStories();
      return;
    }
    const main = document.querySelector("main");
    if (!main) return;

    main.querySelectorAll("span, h2, h3, h4, div[role='heading']").forEach((el) => {
      if (el.children.length > 2) return; // seulement les petits blocs de texte
      const txt = el.textContent.trim().toLowerCase();
      if (!MARKERS.some((m) => txt.startsWith(m))) return;

      collapse(el);
      // On remonte sans jamais replier les ancêtres (ils contiennent les stories),
      // seulement ce qui suit à chaque niveau, plus les icônes juste avant le texte.
      let node = el;
      let level = 0;
      while (node && node !== main) {
        let next = node.nextElementSibling;
        while (next) {
          collapse(next);
          next = next.nextElementSibling;
        }
        if (level < 5) {
          let prev = node.previousElementSibling;
          while (prev) {
            if (prev.textContent.trim() === "" && !prev.querySelector("article")) collapse(prev);
            prev = prev.previousElementSibling;
          }
        }
        node = node.parentElement;
        level++;
      }
    });

    // Le centrage est isolé : s'il échoue, le nettoyage ci-dessus reste appliqué.
    try {
      centerStories(main);
      if (tray && !root.classList.contains("cf-ready")) {
        // On ne révèle la page qu'une fois la position stable (même décalage et même
        // hauteur pendant 300 ms) : plus de saut en haut puis au centre.
        const r = tray.getBoundingClientRect();
        const key = dx + ":" + Math.round(r.top) + ":" + document.querySelectorAll("[" + HIDDEN_ATTR + "]").length;
        const now = Date.now();
        if (key !== stableKey) {
          stableKey = key;
          stableSince = now;
        }
        if (now - stableSince >= 300) {
          clearTimeout(readyTimer);
          root.classList.add("cf-ready");
        } else {
          clearTimeout(recheck);
          recheck = setTimeout(cleanHome, 150);
        }
      }
    } catch (e) {
      clearStories();
    }
  }

  function refresh() {
    applyFlags();
    checkURL();
    cleanHome();
  }

  // ---------- Observation de la page ----------
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      try {
        cleanHome();
      } catch (e) {
        /* on réessaiera à la prochaine mutation */
      }
    });
  });

  function start() {
    observer.observe(root, { childList: true, subtree: true });
    cleanHome();
    // Redimensionner la fenêtre déplace la colonne : on recentre.
    window.addEventListener("resize", () => cleanHome());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Instagram est une SPA : l'URL change sans rechargement.
  let lastURL = "";
  setInterval(() => {
    if (location.href !== lastURL) {
      lastURL = location.href;
      refresh();
    }
  }, 400);

  // ---------- Réglages ----------
  // On démarre avec les valeurs par défaut (tout activé) pour éviter un flash,
  // puis on applique les vrais réglages dès qu'ils sont lus.
  applyFlags();
  checkURL();

  icLoadSettings().then((loaded) => {
    s = loaded;
    refresh();
  });

  icApi.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const key of Object.keys(changes)) {
      if (key in IC_DEFAULTS) s[key] = changes[key].newValue ?? IC_DEFAULTS[key];
    }
    refresh();
  });
})();
