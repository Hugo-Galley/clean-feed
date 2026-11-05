// Menu de la barre d'outils : lit et écrit les réglages (voir ../settings.js).

(async function () {
  "use strict";

  // Textes du menu dans la langue du navigateur (_locales/).
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const text = icApi.i18n.getMessage(el.dataset.i18n);
    if (text) el.textContent = text;
  });
  document.documentElement.lang = icApi.i18n.getUILanguage();

  const s = await icLoadSettings();
  const inputs = document.querySelectorAll("input[data-key]");
  const instagram = document.getElementById("instagram");

  function render() {
    inputs.forEach((input) => {
      input.checked = Boolean(s[input.dataset.key]);
      // Les options détaillées d'Instagram sont inactives quand l'interrupteur général est coupé.
      if (input.closest(".sub")) input.disabled = !s.igEnabled;
    });
    instagram.classList.toggle("is-off", !s.igEnabled);
  }

  inputs.forEach((input) => {
    input.addEventListener("change", async () => {
      const key = input.dataset.key;
      s[key] = input.checked;
      try {
        await icApi.storage.local.set({ [key]: input.checked });
      } catch (e) {
        // En cas d'échec d'écriture, on remet l'interrupteur dans son état réel.
        s[key] = !input.checked;
      }
      render();
    });
  });

  render();
})();
