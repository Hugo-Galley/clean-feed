// Clean Feed — YouTube
// Masque les Shorts (étagères, vignettes, onglets, entrée du menu) et ouvre
// les liens /shorts/ dans le lecteur classique. Interrupteur : ytEnabled.
// Les règles structurelles sont dans youtube.css ; ici, le filet de sécurité
// par le texte "Shorts" (les noms de balises changent plus souvent que le libellé).

(function () {
  "use strict";

  const root = document.documentElement;
  const HIDE_CLASS = "cf-yt-hidden"; // sans effet si html.cf-yt est retiré

  let s = { ...IC_DEFAULTS };

  function applyFlag() {
    root.classList.toggle("cf-yt", s.ytEnabled);
  }

  function checkURL() {
    if (!s.ytEnabled) return;
    const p = location.pathname;
    if (p.startsWith("/shorts/")) {
      const id = p.split("/")[2];
      location.replace(id ? `/watch?v=${encodeURIComponent(id)}` : "/");
    }
  }

  function hideByText() {
    if (!s.ytEnabled) return;
    const nodes = document.querySelectorAll(
      "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, " +
      "yt-chip-cloud-chip-renderer, yt-tab-shape, tp-yt-paper-tab, " +
      "ytm-pivot-bar-item-renderer, [role='tab']"
    );
    nodes.forEach((el) => {
      if (el.classList.contains(HIDE_CLASS)) return;
      const txt = (el.textContent || el.getAttribute("aria-label") || "").trim();
      if (txt === "Shorts") el.classList.add(HIDE_CLASS);
    });
  }

  function refresh() {
    applyFlag();
    checkURL();
    hideByText();
  }

  // YouTube modifie le DOM en permanence : on limite le travail.
  let timer = null;
  const observer = new MutationObserver(() => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      hideByText();
    }, 300);
  });

  function start() {
    observer.observe(root, { childList: true, subtree: true });
    hideByText();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // YouTube est une SPA : l'URL change sans rechargement.
  let lastURL = "";
  setInterval(() => {
    if (location.href !== lastURL) {
      lastURL = location.href;
      checkURL();
    }
  }, 400);

  // Valeurs par défaut tout de suite (pas de flash), vrais réglages ensuite.
  applyFlag();
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
