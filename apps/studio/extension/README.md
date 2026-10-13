# Lexica Capture (Chrome extension)

Sends Threads posts, links and selected text to Lexica Studio → Radar.
Setup: see "Radar: saving posts while browsing" in [`../README.md`](../README.md). Quick guide (Vietnamese): [`../RADAR.md`](../RADAR.md).

Plain JavaScript, no build step. `lib/extract.js` holds the page-reading logic and is tested
with the Studio tests (`pnpm --filter @cortex/studio test`).
