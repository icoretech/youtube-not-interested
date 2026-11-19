# Not Interested

![Not Interested wordmark beside a glass video card with a red no sign](assets/banner.webp)

Not Interested clears videos from your YouTube recommendations with a single
right-click. Right-click a thumbnail and the video is marked **Not interested**,
the same as opening its ⋮ menu and choosing "Not interested" yourself.

![A YouTube feed where one video was replaced by YouTube's Video removed panel after a right-click](assets/screenshots/shot-1-feed.webp)

| You do | What happens |
| --- | --- |
| **Right-click a thumbnail** | YouTube replaces the card with its own **Video removed · Undo · Tell us why** panel. |
| **Click Undo** | The video comes back, as with YouTube's own menu. |
| **Shift + right-click** (or Alt/Cmd) | The browser's context menu opens as usual. |
| **Right-click a title or channel name** | The browser's context menu opens: only thumbnails are taken over. |

While it works, the thumbnail dims and YouTube's menu stays invisible, so the
menu doesn't flash open. If a video has no "Not interested" entry (YouTube
leaves it out of search results, for example), a short note appears in the
bottom-left corner and nothing is clicked. The extension works in any YouTube
language; the screenshots show YouTube in Italian.

<details>
<summary>More screenshots</summary>

![The same YouTube feed before and after one right-click on a thumbnail](assets/screenshots/shot-2-before-after.webp)

</details>

## Install in LibreWolf or Firefox

From the repository root, use Node.js 24 or newer and npm:

```sh
npm ci
npm run build
```

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `dist/firefox/manifest.json`.
3. Open or reload a youtube.com tab and right-click a thumbnail.

A temporary add-on stays loaded until the browser restarts. After rebuilding,
click **Reload** next to it on the same page.

To keep it installed across restarts, package it and install the ZIP:

```sh
npm run package
```

In a LibreWolf profile that accepts unsigned add-ons
(`xpinstall.signatures.required` set to `false` in `about:config`), open
`about:addons`, click the gear, choose **Install Add-on From File**, and select
the ZIP in `artifacts/firefox/`. It stays installed after a restart. To update,
build and install again the same way. Standard Firefox keeps only
Mozilla-signed add-ons installed, so use the temporary installation there.

**Chrome, Brave, Edge, or Arc:** open the browser's extensions page, enable
**Developer mode**, choose **Load unpacked**, and select `dist/chrome/`. Only the
Firefox build is tested on live YouTube.

## How it works

On a right-click over a thumbnail, the extension opens that video's ⋮ menu,
finds the "Not interested" entry, and clicks it. YouTube then handles the
dismissal exactly as if you had clicked the entry yourself.

The entry is found without relying on the UI language: first by its icon
(a circle with a slash), then by the data of YouTube's older menus, then by its
exact label in about twenty languages, and finally by its position directly
above "Don't recommend channel" and "Report". When none of these is certain,
the extension clicks nothing.

The extension runs one content script on `https://www.youtube.com/*`. It has no
permissions, no background script, and no storage, and it makes no network
requests of its own.

## Development

```sh
npm test
npm run biome:ci
npm run package
npm run web-ext:lint
```

`npm run biome:ci` checks formatting, lint, and TypeScript. `npm run package`
builds both browsers and writes their ZIPs to `artifacts/firefox/` and
`artifacts/chrome/`. `scripts/make-icons.sh` rebuilds the icons from
`assets/brand/logo-source.png` (requires ImageMagick 7).

If YouTube changes its markup, start with the
[card and thumbnail selectors](src/youtube/selectors.ts),
[thumbnail hit-testing](src/youtube/card.ts),
[menu matching](src/youtube/menu.ts), or the
[menu automation](src/youtube/not-interested.ts).
[`install.ts`](src/content/install.ts) handles the `contextmenu` event, the busy
state, and the failure note.

### Checking against live YouTube

The debug build reports what the extension finds on each right-click:

```sh
npm run build:debug
node scripts/debug-server.mjs
```

Load (or **Reload**) `dist/firefox/manifest.json` as above and right-click a
thumbnail. The collector prints each right-click and appends it to
`debug-reports.ndjson` (git-ignored). Each record holds the card markup, the
⋮ button used, every menu entry with its label and icon path, and how
"Not interested" was matched. New icon paths go in
[`menu.ts`](src/youtube/menu.ts). Run `npm run build` again before regular use:
production builds contain no debug code.

## License

[MIT](LICENSE). Not Interested is an independent project and is unaffiliated
with YouTube or Google.
