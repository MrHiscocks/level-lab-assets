# Level Lab asset libraries

One repository, two student libraries and a shared Level Lab menu.

| Resource | Source folder | Student address |
| --- | --- | --- |
| Level Lab menu | `index.html` | https://mrhiscocks.github.io/level-lab-assets/ |
| Game Forge | `game-forge/` | https://mrhiscocks.github.io/level-lab-assets/game-forge/ |
| Prototype Chamber | `prototype-chamber/` | https://mrhiscocks.github.io/level-lab-assets/prototype-chamber/ |

## Publish

In this repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. This must be enabled before deployment can succeed. Then push to `main`, or use **Actions → Build and publish Level Lab libraries → Run workflow**.

The workflow installs Game Forge dependencies, runs its tests, builds both libraries, checks published paths and site size, and deploys the combined root `dist/` folder. If a deployment ran before Pages was enabled, enable Pages and re-run the failed workflow jobs.

If deployment returns a 404, check that GitHub Pages is enabled and its source is set to GitHub Actions.

## Where files belong

- `game-forge/assets/`: original Game Forge sprites and sounds, organised by category.
- `game-forge/src/`: Game Forge React interface.
- `game-forge/public/brand/`: Game Forge branding. Catalogue and thumbnails are generated during the build.
- `prototype-chamber/`: the complete static theme explorer, including all ten theme pages and their assets.
- `scripts/prototype-pack-recipes.json`: exact file lists and asset-list text for the thirty Prototype Chamber packs. The ZIPs are generated during the build, rather than storing duplicate copies in Git.
- `.github/workflows/pages.yml`: shared publishing workflow.

Add Game Forge assets inside the existing category folders, then commit and push. Keep Prototype Chamber's relative folder paths intact. If Prototype Chamber pack contents change, update the corresponding pack recipes as well.

Game Forge originals are downloaded from `raw.githubusercontent.com`, pinned to the same commit as the catalogue. Prototype Chamber files and its generated packs are served directly from Pages. Both hosts must be accessible on student devices. The Pages size check covers the combined site.

## Local checks and preview

Requires Node.js 24 and Python 3.12 or later. Run from the repository root:

```sh
npm --prefix game-forge ci
python3 -m pip install -r game-forge/requirements.txt
npm test
npm run build
npm run check:site
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/. This build includes local Game Forge downloads. GitHub uses `npm run build:external` with a commit-specific `ASSET_BASE_URL` ending in `/game-forge/assets/`.

Before sharing with a class, check a sprite, animation, audio file and custom ZIP on the school network. GameMaker import and game behaviour still need checking in the classroom project.
