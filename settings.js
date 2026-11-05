// Réglages partagés entre les content scripts et le menu (popup).
// Tout est activé par défaut ; le menu écrit dans browser.storage.local.

const IC_DEFAULTS = Object.freeze({
  ytEnabled: true,   // YouTube : masquer les Shorts
  igEnabled: true,   // Instagram : interrupteur général
  igHome: true,      // Instagram : fil + suggestions de l'accueil (stories gardées)
  igExplore: true,   // Instagram : page Explorer réduite à la recherche
  igReels: true,     // Instagram : bouton Reels, vignettes et redirection
});

const icApi = typeof browser !== "undefined" ? browser : chrome;

async function icLoadSettings() {
  try {
    const stored = await icApi.storage.local.get(IC_DEFAULTS);
    return { ...IC_DEFAULTS, ...stored };
  } catch (e) {
    return { ...IC_DEFAULTS };
  }
}
