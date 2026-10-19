LEVEL LAB / PROTOTYPE CHAMBER

This folder is the complete static student asset site. No npm install,
backend, API keys, external fonts or CDN libraries are required.

PUBLISH WITH THE SHARED LEVEL LAB REPOSITORY
This site lives in prototype-chamber/ beside game-forge/.
The repository root workflow builds and publishes both libraries.
Keep index.html beside assets, css, js, images, downloads and guides.
Use GitHub Actions as the Pages publishing source in repository settings.
Do not switch this repository to branch publishing.

LIVE ADDRESS
https://mrhiscocks.github.io/level-lab-assets/prototype-chamber/

READY-MADE PACKS
The shared build generates the thirty kit ZIPs from the original assets.
Their recipes are in ../scripts/prototype-pack-recipes.json.
Generated ZIPs are not committed. They are included in the published site.
Run the root npm run build command to prepare a complete local preview.

CONTENTS
10 theme pages, plus the theme explorer and My selection.
250 final assets: 12 Build Kit and 13 Level Up Kit assets per theme.
30 ready-made ZIPs: Build Kit, Level Up Kit and Full Pack for each theme.
Each ZIP has sprite, background and asset folders.
The optional kit is consistently called Level Up Kit throughout the site.

CUSTOM DOWNLOADS
Tick individual assets on any page. The selection persists in this browser.
Use My selection to review or download a mixed pack. Theme subfolders keep
identical filenames separate, e.g. sprite/PixelPeaks/sPlayer_strip6.png.
The ZIP is assembled locally in the browser. No assets are uploaded anywhere.
Individual asset downloads and prebuilt kit ZIPs use ordinary file links.
Custom ZIP downloads need HTTP/HTTPS, as provided by GitHub Pages. If you
open index.html directly from disk, use the ready-made ZIP links instead.
For local HTTP testing: python3 -m http.server 8000

ARTWORK AND TECHNICAL STANDARD
Flat 2D foreground art generated from the approved theme concepts using
the built-in image-generation tool, then mechanically exported to exact sizes.
Characters use varied skin tones. Treasure Cove uses the girl pirate;
Dust & Dynamite uses the cowgirl. Other themes include non-human characters.
Player: 384 x 64 PNG, six 64 x 64 frames.
Enemy: 256 x 64 PNG, four 64 x 64 frames.
Solid, spikes, collectables, health, extra hazard, decorations: 64 x 64 PNG.
Theme goal: sGoal.png, 128 x 128 PNG, with natural proportions. Moving platform: 128 x 64 PNG.
Labels, result titles and buttons: 256 x 64 PNG.
Backgrounds: exactly 1280 x 640 PNG, repeated horizontally with matched edges.
Each theme has ONE 64 x 64 ground block, fully opaque, flat-topped and
repeatable in both directions. Use sSolid and oSolid for every ground position.
All ten goals and 70 labels/buttons use theme-specific illustrated art.
Festive Frenzy and Crystal Caverns have six new distinct full-width backgrounds
with blended repeat edges. Other themes retain their earlier reflected scenery. Site banners are promotional artwork
and are separate from the quieter gameplay backgrounds.
Music: original programmed instrumental arrangements, approximately 30-39
seconds, PCM WAV, loop-ready. Jump sounds: short synthesised PCM WAV effects.
See guides/sImportGuide.txt for collision-mask, origin and strip-import notes.

SITE BEHAVIOUR
Sidebar navigation links to one real HTML page for each theme.
Build Kit is shown first; Level Up Kit is an optional tab.
The theme explorer enlarges only the illustrated title graphic on hover/focus.
Animation preview buttons play the actual exported sprite strips.
Background Preview shows a 1280 x 640 room with optional objects, a 64-pixel
grid and a second background copy for inspecting horizontal repetition.
Audio is never autoplayed. Only one track plays at a time.
Reduced-motion preferences disable decorative hover animation.

VERIFICATION AND LIMITATIONS
The files were checked for exact dimensions, valid image decoding,
transparency, distinct animation frames, matching repeat-edge pixels,
audio duration and loop endpoints. ZIP contents and file bytes were checked.
The custom ZIP writer was executed separately and its output checked with
Python's ZIP reader, including duplicate filenames in different theme folders.
Live desktop/mobile browser interaction and visual fidelity checks could not
be completed in the creation environment: Chromium was unavailable and its
download failed, while the cloud browser blocked the local URL.
GameMaker itself was not available for a project import/playthrough test.
The packs contain artwork and audio, not a GameMaker project or game logic.

OFFICIAL REFERENCE
GitHub Pages:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
GameMaker sprite strips:
https://manual.gamemaker.io/monthly/en/The_Asset_Editors/Sprite_Properties/Sprite_Strips.htm

REVISION NOTES
sGoal.png replaces the old sFlag.png in every theme. Goals are 128 x 128,
bottom-centre origin (64, 128), and use a trigger mask around visible artwork.
See guides/sImportGuide.txt before updating an existing game.
Crystal Caverns now includes emerald, amber, rose quartz and amethyst decorations.

REVIEW THE REVISED ART
guides/sRevisionOverview.png shows the final exported signs, goals and terrain.
guides/sRoomExamples.png shows foreground assets over the backgrounds.
Both are reference sheets, not files to import as game sprites.

SINGLE GROUND BLOCK REVISION
Ten approved/revised designs now replace the earlier surface/fill pairs.
All ten ground PNGs fill the entire 64 x 64 square and have exactly matching
left/right and top/bottom edge pixels. No transparent gaps or outside border.
Icing, greenery and sand details repeat as part of the tile face.
Only sSolid is supplied; no extra fill object or parenting step is needed.
Four spike designs were redrawn with flat bases. All ten spike canvases were
checked/aligned so the base touches the bottom row of the 64 x 64 image.
Use top-left origin (0,0) for ground and spikes, then place spikes one grid
cell above ground. See the import guide for an existing-game migration note.

guides/sGroundAndSpikes.png shows actual final exports in repeated 4 x 3
patches with the real spike and decorative sprites placed above them.
It is an inspection sheet, not a sprite to import into GameMaker.
