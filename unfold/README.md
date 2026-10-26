# Unfold

An iPhone-first stretching and mobility HTML app, using native JavaScript and CSS. No accounts, analytics, external runtime libraries or health-data upload.

## Movement library

51 distinct movement guides across 14 focus areas and 21 routines. Each standard body-area library contains 8–11 movements, and the full-body library has 21. Relevant supporting movements are included alongside stretches for the named area. Seated preferences substitute suitable options and deduplicate the resulting library, so their available count can be lower.

Open a routine to browse every available movement as an illustrated card and inspect its instructions, target sensation and source. All original artwork uses neutral grey teaching mannequins with schematic green muscle highlights. 27 original guides use six illustrated positions; 24 additional guides share eight shared pose atlases, with two to four positions per new guide. These are schematic guides, not anatomical measurements or personal rehabilitation advice.

## Timing

Choose 5, 10 or 15 minutes of movement and 15, 30 or 60 seconds per timed step. Each side is a separate step. At 30 seconds, five minutes contains ten steps. The planner uses different movements before adding clearly labelled repeat rounds. Bilateral blocks always include equal left/right work. Each movement uses the chosen time, with comfortable repeats for mobility exercises and an easy sustained position for stretches.

Changeovers of 0, 3, 5, 10 or 15 seconds are added separately. The preview shows movement time, changeover time and actual total duration. There are no automatic 75-second padded slots or long filler recovery periods. Pause, resume, Back, Skip, swaps, preparation cues and completion tracking remain available. Skip does not count as completion.

An earlier paused session can resume using its original timeline. New saved sessions retain their per-step durations, sides, rounds and progress. Settings, favourites, sessions and history are stored in browser local storage; they do not sync between devices or browsers.

## Guidance and iPhone use

Animations loop on previews, follow timed movement or hold phases during a session, and freeze on pause. Enlarged guides offer pause/replay/position stepping. Reduced-motion settings keep the image still unless the user enables playback. Written cues and a comfortable range take priority over matching an illustration. Stop new or worsening pain. Source links and additional safety information are available in the app.

Open the HTTPS link in Safari, then Share → Add to Home Screen → turn on Open as Web App → Add. The Home Screen help reports when the app files and illustration atlases have finished saving offline. Audio uses available device services and voices. Wake lock depends on device/browser and power settings. Switching apps or prolonged suspension pauses the routine so movements are not skipped unseen. Physical iOS audio, installed-app storage and wake-lock behaviour require device checks.

## Development and publication

Serve this directory over HTTP(S). Relative paths support /level-lab-assets/unfold/. The existing repository build copies this directory to dist/unfold/ and publishes it through GitHub Pages. This edition uses unfold-2026-10-26-v5. Home Screen launches use launch.html, with a self-contained loading/recovery screen and a stable manifest identity. Module imports and the stylesheet are versioned together and matched exactly in the offline cache. Navigations check the network first and fall back to the saved launch page. Cache Storage errors do not block online requests. The worker registers independently of the app module, so a startup failure can still receive an update. Refresh app files checks the connection first, unregisters only this app worker, removes only downloaded Unfold caches, and reloads. It never clears local storage, session history, favourites or preferences. Active sessions are not forcibly reloaded. Physical iPhone Home Screen launch still requires device verification.
