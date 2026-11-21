#!/usr/bin/env bash
# Downloads the public-domain datasets used by the importers, then you can re-run them.
set -euo pipefail
mkdir -p sources/bsb-usfm
# KJV (1769) primary + independent cross-check
curl -fsSL -o sources/verses-1769.json https://raw.githubusercontent.com/farskipper/kjv/master/json/verses-1769.json
curl -fsSL -o sources/en_kjv.json https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
# BSB official USFM release + independent cross-check
curl -fsSL -o sources/BSB_usfm.zip https://github.com/BSB-publishing/bsb2usfm/releases/latest/download/BSB_usfm.zip
unzip -qo sources/BSB_usfm.zip -d sources/bsb-usfm
curl -fsSL -o sources/BSB.json https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/BSB.json
echo "Now run: npm run import:kjv && npm run import:bsb"
