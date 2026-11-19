# Not Interested Right-Click for YouTube

Right-click a video thumbnail on youtube.com and that video is marked
**Not interested**, the same as opening its ⋮ menu and choosing
"Not interested" yourself.

Built for LibreWolf (any Firefox 142+ works too). A Chrome build is produced as
well, but only the Firefox build is tested on live YouTube.

## What it does

- **Right-click a thumbnail** to mark that video "Not interested". YouTube
  replaces the card with its own **Video removed · Undo · Tell us why** panel,
  so you can take it back with **Undo**.
- **Only thumbnails are taken over.** Right-clicking a title, channel name or
  anything else still opens the browser's context menu.
- **Shift + right-click** (or Alt/Cmd + right-click) on a thumbnail opens the
  browser's context menu as usual.
- While it works, the thumbnail dims and YouTube's menu stays invisible, so you
  don't see the menu flash open.
- If a video offers no "Not interested" (YouTube leaves it out of search
  results, for example), a short note appears in the bottom-left corner and
  nothing is clicked.

The menu entry is found without depending on the UI language: first by its
icon (circle with a slash), then by the data of YouTube's older menus, then by
its exact label in about twenty languages, and finally by its position just above
"Don't recommend channel" and "Report". When none of these is certain, the
extension clicks nothing.

The extension has no permissions, no background script, no storage and makes no
network requests. It runs one content script on `https://www.youtube.com/*`.

## Load it in LibreWolf

You need Node.js 24 or newer and npm.

```sh
npm ci
npm run build
```

1. In LibreWolf, open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `dist/firefox/manifest.json`.
3. Open or reload a youtube.com tab and right-click a thumbnail.

A temporary add-on stays loaded until LibreWolf restarts. After rebuilding,
click **Reload** next to it on the same page.

To keep it installed across restarts, package it and install the ZIP:

```sh
npm run package
```

In a LibreWolf profile that accepts unsigned add-ons
(`xpinstall.signatures.required` set to `false` in `about:config`), open
`about:addons`, click the gear, choose **Install Add-on From File**, and select
the ZIP in `artifacts/firefox/`. Alternatively, copy the ZIP to a name ending in
`.xpi` and open it as a `file:///…/name.xpi` URL; LibreWolf then asks to add the
extension. Either way it stays installed after a restart. To update it, build
and install again with the same steps. Standard Firefox only keeps signed
add-ons installed, so use the temporary install there.

For Chrome, Brave or Edge: enable **Developer mode** on the extensions page,
choose **Load unpacked**, and select `dist/chrome/`.

## Development

```sh
npm test            # Vitest + jsdom
npm run biome:ci    # format, lint and TypeScript
npm run web-ext:lint
npm run package     # ZIPs in artifacts/firefox and artifacts/chrome
```

The code is small:

- `src/youtube/card.ts` finds the card under the right-click and its ⋮ button,
  looking through YouTube's hover preview.
- `src/youtube/menu.ts` holds the icon paths and labels used to recognize
  "Not interested".
- `src/youtube/not-interested.ts` opens the menu, waits for it, and clicks the
  entry.
- `src/content/install.ts` handles the `contextmenu` event, the busy state and
  the failure note.

### Checking against live YouTube

When YouTube changes its markup, use the debug build to see what the extension
finds:

```sh
npm run build:debug
node scripts/debug-server.mjs
```

Load (or **Reload**) `dist/firefox/manifest.json` as above and right-click a
thumbnail. Each right-click is printed by the collector and appended to
`debug-reports.ndjson` (git-ignored): the card markup, which ⋮ button was used,
every menu entry with its label and icon path, and how "Not interested" was
matched. New icon paths go in `src/youtube/menu.ts`. Run `npm run build`
again before regular use; production builds contain no debug code.

## License

MIT
