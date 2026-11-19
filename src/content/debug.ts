// Debug builds only (`npm run build:debug`): sends what happened on each
// right-click to a local collector (`node scripts/debug-server.mjs`), so the
// extension can be checked against live YouTube without opening devtools.
// Production builds drop this module entirely.

import type { ThumbnailHit } from "../youtube/card.js";
import { findMenuItems, iconPaths, itemLabel } from "../youtube/menu.js";
import type { NotInterestedResult } from "../youtube/not-interested.js";

const COLLECTOR_URL = "http://127.0.0.1:47123/";

export function reportResult(result: NotInterestedResult, card: Element): void {
  const popup = result.popup;
  send({
    result: { ...result, popup: undefined },
    card: describe(card),
    items: popup
      ? findMenuItems(popup).map((item) => ({ label: itemLabel(item), icon: iconPaths(item) }))
      : [],
    popupHtml: popup ? trim(popup.outerHTML) : undefined,
  });
}

export function reportHit(hit: ThumbnailHit): void {
  const path: string[] = [];
  for (
    let node: Element | null = hit.menuButton;
    node && node !== hit.card;
    node = node.parentElement
  ) {
    path.unshift(`${node.tagName.toLowerCase()}.${Array.from(node.classList).join(".")}`);
  }
  send({
    hit: describe(hit.card),
    thumbnail: hit.thumbnail.tagName.toLowerCase(),
    menuButtonPath: path,
  });
}

export function reportLoaded(): void {
  send({ loaded: location.href });
}

function describe(card: Element): Record<string, unknown> {
  return {
    tag: card.tagName.toLowerCase(),
    html: trim(card.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>")),
  };
}

function trim(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 20_000);
}

function send(payload: unknown): void {
  void fetch(COLLECTOR_URL, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: JSON.stringify({ at: new Date().toISOString(), ...(payload as object) }),
  }).catch(() => undefined);
}
