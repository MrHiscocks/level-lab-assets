# Unfold

An iPhone-first stretching and mobility web app. Built with HTML, CSS and native JavaScript, with no external runtime dependencies, accounts or analytics.

## Routines

11 routines, each available as 5, 10 or 15 minutes: Morning reset, Evening unwind, Upper back & posture, Lower back, Shoulders, Gentle knee movement, After sitting, Squash & padel recovery, After upper-body training, After leg training, and optional Knee & hip strength basics.

18 guided movements use neutral statue illustrations with schematic muscle highlights, technique cues and links to NHS information. Demonstrations animate through six illustrated key positions. The player provides automatic preparation, movement/repetition and recovery timers, with side changes, pause, back, skip and alternatives.

Each step lasts 75 seconds including preparation, modest movement/hold timings and recovery. Longer routines add steps rather than extending every stretch. Preparation can be set to 5, 10 or 15 seconds. Session history distinguishes completed, skipped and stopped sessions.

Settings, favourites, paused sessions and history are held in browser local storage only. They do not sync between devices or browsers. Optional speech uses the device's available speech service; its offline availability depends on installed voices. Wake lock is requested only while the routine is running, where supported. Switching away, locking the device or prolonged browser suspension pauses the session.

## Animated guides

The home and routine previews loop through a gentle demonstration. During a session, body positions follow the preparation, movement, hold and release cues. Pausing the session freezes the figure. The enlarged guide has separate play/pause, replay and next-position controls. When reduced motion is enabled on the device, the illustrations stay still until the user explicitly chooses Play motion.

The guides use lightweight WebP sprite sheets and native JavaScript, with no video downloads, autoplay permissions or external animation service required. Thumbnails stay still to keep routine browsing calm. Muscle highlights are schematic; the written technique and comfortable range take priority over matching the figure exactly.

## iPhone use

Open the published link in Safari. Share → Add to Home Screen. Open the in-app Home Screen help to check that offline routines and illustrations have finished saving. The service worker requires HTTPS. Audio and wake-lock behaviour depend on the device, power settings and browser.

## Development and publication

Serve this directory with any static HTTP server. JavaScript modules need HTTP(S), rather than opening the file directly. All asset and module paths are relative, so the app can live at `/level-lab-assets/unfold/`.

The repository build script copies this folder to `dist/unfold/`; the existing GitHub Pages workflow publishes it. The animated edition uses cache version `unfold-2026-10-26-v2`. Update the cache version in `sw.js` when shipping future changes. Existing tabs may need closing and reopening to activate a new cached version.

## Exercise information

This is general mobility guidance, not diagnosis or a personalised rehabilitation prescription. Stop movements that worsen symptoms and seek appropriate clinical advice for persistent pain. Safety guidance and source links are available inside the app. The session timings are Unfold's general routines, not NHS-prescribed programmes.
