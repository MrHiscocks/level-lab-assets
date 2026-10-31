# Pulse

A static workout companion for home and gym, hosted alongside Unfold at `/pulse/`.

## Included

- 135 searchable exercises with two reference photographs, instructions, equipment and muscle filters.
- 10 ready-made sessions, a workout generator and an editable routine builder.
- A playlist-style workout player with circular interval timers, set segments, rest timers, left/right sequencing and an exercise queue.
- Saved routines, favourites, workout history and highest logged weights.
- JSON backup export and validated import that merges records by ID.

Everything runs in the browser. There are no accounts, database, analytics or paid API dependencies. Data is saved in localStorage on the current browser/device. Clearing website data removes those records. Export a backup regularly; there is no automatic device sync.

## Run and deploy

Serve this directory over HTTP, for example `python3 -m http.server 8000`, then visit localhost:8000. Opening index.html as a local file will not load ES modules reliably.

The parent repository's Pages workflow runs `npm --prefix pulse test`, copies this directory into `dist/pulse`, checks local references and deploys it with the existing site. All application URLs are relative, so it works below a GitHub Pages project path. It does not change Unfold's files or service worker scope.

On iPhone, open the deployed URL in Safari and use Share > Add to Home Screen. On supported browsers, Pulse can be installed from the browser menu. Visit once online first. The service worker caches the application shell and exercise photographs as they are viewed. Unvisited photographs still require a connection. Browser cache eviction can remove offline files.

The player pauses when the tab is hidden, and restores interrupted sessions paused. Strength sets advance when you tap Complete set; timed intervals advance automatically. Repetitions are entered by you, not detected by a camera or sensor. Weights start at zero and can be edited before completing each set.

## Exercise visuals and sources

Exercise records and reference photographs are selected from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), released under the Unlicense. The original licence is included in `EXERCISE-LICENCE.txt`. Images are resized and converted to WebP; some names, equipment metadata and instructions are clarified for Pulse. Each exercise links to its source.

The player alternates reference positions, not continuous video or biomechanically simulated animation. The home-page sculptural cover is AI-generated and decorative. General guidance links to the NHS and ACE are provided within the app. These records have not undergone a professional clinical or coaching review.

## Validation

Run `npm test` in this directory. Tests cover the complete exercise catalogue and image references, templates, equipment filtering, session sequencing, timing estimates and backup validation/merging. Browser checks cover search, favourites, routine editing, set completion/rest, pause/resume across reload, history, backup export/import and narrow phone layouts.
