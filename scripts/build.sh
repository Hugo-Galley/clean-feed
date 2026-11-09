#!/usr/bin/env bash
# Construit les deux paquets : dist/firefox-<version>.zip et dist/chrome-<version>.zip
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/chrome
FILES="settings.js instagram.js instagram.css youtube.js youtube.css popup _locales"

# Firefox : manifest V2 (web-ext ignore les fichiers propres à Chrome)
npx --yes web-ext build -a dist --overwrite-dest >/dev/null
mv dist/*.zip "dist/firefox-$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])').zip"

# Chrome / Edge / Brave : manifest V3, icônes PNG
for f in $FILES; do cp -r "$f" dist/chrome/; done
mkdir dist/chrome/icons && cp icons/icon-*.png dist/chrome/icons/
cp manifest.chrome.json dist/chrome/manifest.json
V=$(python3 -c 'import json;print(json.load(open("manifest.chrome.json"))["version"])')
(cd dist/chrome && zip -qr "../chrome-$V.zip" .)
echo "OK:"; ls -1 dist/*.zip
