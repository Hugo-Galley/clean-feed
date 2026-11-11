<div align="center">

<img src="docs/banner.png" alt="Clean Feed – hide YouTube Shorts and the addictive parts of Instagram">

### [➜ Install from Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/clean-feed-hide-shorts-reels/) · [➜ Install from Chrome Web Store](https://chromewebstore.google.com/detail/clean-feed-%E2%80%93-hide-shorts/inhjhkkbaiodhbecdkempfnjkhnpdllf)

[![Get the add-on](https://img.shields.io/badge/Firefox-Get%20the%20add--on-ff7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/fr/firefox/addon/clean-feed-hide-shorts-reels/)
[![Get the extension](https://img.shields.io/badge/Chrome-Get%20the%20extension-4285f4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/clean-feed-%E2%80%93-hide-shorts/inhjhkkbaiodhbecdkempfnjkhnpdllf)
[![License: MIT](https://img.shields.io/badge/license-MIT-4f5bd5.svg)](LICENSE)
![Firefox](https://img.shields.io/badge/Firefox%20%2F%20Zen-142%2B-orange)
![Manifest](https://img.shields.io/badge/manifest-v2-blue)
![No tracking](https://img.shields.io/badge/data%20collected-none-brightgreen)

</div>

**Clean Feed** is a Firefox / Zen extension that removes the endless-scroll parts of YouTube and Instagram,
while keeping everything you actually use them for.

## Install

Available on [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/clean-feed-hide-shorts-reels/) for Firefox and Zen (Firefox 142 or newer). Click **Add to Firefox**, nothing else to configure.

Also available on the [Chrome Web Store](https://chromewebstore.google.com/detail/clean-feed-%E2%80%93-hide-shorts/inhjhkkbaiodhbecdkempfnjkhnpdllf) for Chrome, Edge and Brave.

## What it does

| Toggle | Effect |
|---|---|
| **YouTube** | Hides Shorts (shelves, thumbnails, tabs, menu entry). `/shorts/` links open in the regular player. |
| **Instagram** (master) | Turns every Instagram option on or off at once. |
| ↳ **Home** | Hides the feed, "You're all caught up" and suggestions. Stories are kept (centered on desktop). |
| ↳ **Explore** | Reduces the Explore page to the search bar, with no loading spinner. |
| ↳ **Reels** | Hides the Reels button and redirects the Reels tab to the home page. |

The cleanup only applies to the Instagram **home** and **Explore** pages. Profiles, posts, hashtags,
places and direct messages are never touched: a reel sent to you in a message opens normally.

Everything is on by default and each toggle takes effect immediately on open tabs.

## Screenshots

### YouTube: no more Shorts

<p align="center"><img src="docs/screenshots/02-youtube-shorts.png" alt="YouTube before and after Clean Feed" width="820"></p>

Shelves, thumbnails, the Shorts tab and the menu entry are gone.

### Instagram: a home that ends

<p align="center"><img src="docs/screenshots/03-instagram-home.png" alt="Instagram home before and after Clean Feed" width="820"></p>

The feed and suggestions are hidden, stories stay.

### Instagram: Explore and Reels

<p align="center"><img src="docs/screenshots/04-instagram-explore-reels.png" alt="Instagram Explore before and after Clean Feed" width="820"></p>

Explore is reduced to the search bar and the Reels button is hidden.

*Screenshots use illustrated placeholder content, not real accounts or videos.*

## Privacy

No data is collected, stored remotely or sent anywhere. The extension has no network code.
Settings are kept locally with `storage.local`. Access is limited to `instagram.com` and `youtube.com`.
On Instagram it also saves a single number (the horizontal offset used to center stories) in the page's
`localStorage`, per window width, to avoid a visual jump on load.

## Why Manifest V2?

In Firefox, Manifest V3 treats site access as an optional permission that the user has to grant by hand,
and it is lost on temporary installs. Manifest V2 grants the access at install time so the extension
works right away. Firefox still supports Manifest V2.

## Chrome / Edge / Brave

Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/clean-feed-%E2%80%93-hide-shorts/inhjhkkbaiodhbecdkempfnjkhnpdllf). The same code builds a Chrome-compatible package (Manifest V3, PNG icons): `./scripts/build.sh` writes `dist/firefox-<version>.zip` and `dist/chrome-<version>.zip`. To try it, open `chrome://extensions`, enable Developer mode and load the unzipped `dist/chrome` folder.

## Develop

```bash
npx web-ext run          # test in a temporary Firefox profile
npx web-ext lint
npx web-ext build        # produces web-ext-artifacts/*.zip
```

Plain JavaScript and CSS, no build step, nothing minified.

## If something comes back

Instagram and YouTube change their markup regularly. The rules live in `instagram.css`, `youtube.css`,
`instagram.js` (`MARKERS`: texts that trigger hiding of what follows) and `youtube.js`.
Open an issue with a screenshot.

## License

MIT
