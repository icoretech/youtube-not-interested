import { isShown, normalizeText } from "./dom.js";
import { MENU_ITEM_SELECTOR, MENU_POPUP_SELECTOR } from "./selectors.js";

// Icons are the same in every UI language, so they are the primary match.
// Paths are compared whole (after collapsing whitespace): "Watch later",
// "Not interested" and "Don't recommend channel" share the same circle
// outline, so a prefix would not tell them apart.

/** "Not interested": a circle with a slash. */
export const NOT_INTERESTED_ICON_PATHS = [
  // Sheet menu (yt-list-item-view-model), seen on youtube.com in November 2026.
  "M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 018.246 12.605L4.755 6.661A8.99 8.99 0 0112 3ZM3.754 8.393l15.491 8.944A9 9 0 013.754 8.393Z",
];

/** "Don't recommend channel": a circle with a minus. Never clicked; used as a position anchor. */
export const DONT_RECOMMEND_ICON_PATHS = [
  "M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 110 18.001A9 9 0 0112 3Zm4 8H8a1 1 0 000 2h8a1 1 0 000-2Z",
];

/** "Report": a flag. Never clicked; used as a position anchor. */
export const REPORT_ICON_PATHS = [
  "m4 2.999-.146.073A1.55 1.55 0 003 4.454v16.545a1 1 0 102 0v-6.491a7.26 7.26 0 016.248.115l.752.376a8.94 8.94 0 008 0l.145-.073c.524-.262.855-.797.855-1.382V4.458a1.21 1.21 0 00-1.752-1.083 7.26 7.26 0 01-6.496 0L12 2.999a8.94 8.94 0 00-8 0Zm7.105 1.79v-.002l.752.376A9.26 9.26 0 0019 5.641v7.62a6.95 6.95 0 01-6.105-.052l-.752-.376A9.261 9.261 0 005 12.355v-7.62a6.94 6.94 0 016.105.054Z",
];

/**
 * Icons of the other sheet entries. The position fallback never picks an
 * entry that carries one of these (or the two anchors above).
 */
export const OTHER_ACTION_ICON_PATHS = {
  addToQueue:
    "M2 2.864v6.277a.5.5 0 00.748.434L9 6.002 2.748 2.43A.5.5 0 002 2.864ZM21 5h-9a1 1 0 100 2h9a1 1 0 100-2Zm0 6H9a1 1 0 000 2h12a1 1 0 000-2Zm0 6H9a1 1 0 000 2h12a1 1 0 000-2Z",
  watchLater:
    "M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 110 18.001A9 9 0 0112 3Zm0 3a1 1 0 00-1 1v5.565l.485.292 3.33 2a1 1 0 001.03-1.714L13 11.435V7a1 1 0 00-1-1Z",
  saveToPlaylist:
    "M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z",
  download:
    "M12 2a1 1 0 00-1 1v11.586l-4.293-4.293a1 1 0 10-1.414 1.414L12 18.414l6.707-6.707a1 1 0 10-1.414-1.414L13 14.586V3a1 1 0 00-1-1Zm7 18H5a1 1 0 000 2h14a1 1 0 000-2Z",
  share:
    "M10 3.158V7.51c-5.428.223-8.27 3.75-8.875 11.199-.04.487-.07.975-.09 1.464l-.014.395c-.014.473.578.684.88.32.302-.368.61-.73.925-1.086l.244-.273c1.79-1.967 3-2.677 4.93-2.917a18.011 18.011 0 012-.112v4.346a1 1 0 001.646.763l9.805-8.297 1.55-1.31-1.55-1.31-9.805-8.297A1 1 0 0010 3.158Zm2 6.27v.002-4.116l7.904 6.688L12 18.689v-4.212l-2.023.024c-1.935.022-3.587.17-5.197 1.024a9 9 0 00-1.348.893c.355-1.947.916-3.39 1.63-4.425 1.062-1.541 2.607-2.385 5.02-2.485L12 9.428Z",
};

const NOT_A_POSITION_CANDIDATE = [
  ...Object.values(OTHER_ACTION_ICON_PATHS),
  ...DONT_RECOMMEND_ICON_PATHS,
  ...REPORT_ICON_PATHS,
];

/** Icon names in the legacy Polymer popup's renderer data. */
const NOT_INTERESTED_ICON_TYPES = new Set(["NOT_INTERESTED", "NOT_INTERESTED_OUTLINE"]);

/** Exact menu labels, for when an icon has not loaded yet or YouTube redraws it. */
export const NOT_INTERESTED_LABELS = new Set(
  [
    "Not interested",
    "Non mi interessa",
    "Kein Interesse",
    "Pas intéressé",
    "Pas intéressé(e)",
    "No me interesa",
    "Não tenho interesse",
    "Não estou interessado",
    "Niet geïnteresseerd",
    "Nie interesuje mnie to",
    "Не интересует",
    "İlgilenmiyorum",
    "Inte intresserad",
    "Ikke interesseret",
    "Ikke interessert",
    "Ei kiinnosta",
    "Nezajímá mě to",
    "Nem érdekel",
    "Nu mă interesează",
    "Δεν με ενδιαφέρει",
    "Не цікавить",
    "興味なし",
    "관심 없음",
    "不感兴趣",
    "不感興趣",
  ].map((label) => label.toLocaleLowerCase()),
);

export type MatchKind = "icon" | "renderer-data" | "label" | "position";

export type NotInterestedMatch = {
  item: Element;
  target: HTMLElement;
  matchedBy: MatchKind;
};

/** Every menu popup that is on screen, outermost element only. */
export function findShownMenuPopups(document: Document): Element[] {
  const shown = Array.from(document.querySelectorAll(MENU_POPUP_SELECTOR)).filter(
    (popup) => isShown(popup) && popup.querySelector(MENU_ITEM_SELECTOR) !== null,
  );
  return shown.filter((popup) => !shown.some((other) => other !== popup && other.contains(popup)));
}

export function findMenuItems(popup: Element): Element[] {
  return Array.from(popup.querySelectorAll(MENU_ITEM_SELECTOR));
}

/**
 * The "Not interested" entry, matched without relying on the UI language:
 * by icon, then legacy renderer data, then exact localized label.
 */
export function findNotInterestedItem(popup: Element): NotInterestedMatch | null {
  const items = findMenuItems(popup);
  const matchers: [MatchKind, (item: Element) => boolean][] = [
    ["icon", (item) => hasIcon(item, NOT_INTERESTED_ICON_PATHS)],
    ["renderer-data", hasNotInterestedRendererData],
    ["label", (item) => NOT_INTERESTED_LABELS.has(itemLabel(item).toLocaleLowerCase())],
  ];
  for (const [matchedBy, matches] of matchers) {
    const item = items.find(matches);
    if (item !== undefined) {
      return toMatch(item, matchedBy);
    }
  }
  return null;
}

/**
 * Last resort for an unknown language whose icon also changed: YouTube lists
 * "Not interested" directly above "Don't recommend channel", which sits
 * directly above "Report". Requires both neighbours to be recognized by icon
 * and the candidate to carry no icon of another known action (a menu without
 * "Not interested" has "Share" in that slot), so a reshuffled menu yields no
 * match rather than a wrong click.
 */
export function findNotInterestedByPosition(popup: Element): NotInterestedMatch | null {
  const items = findMenuItems(popup);
  const index = items.findIndex((item) => hasIcon(item, DONT_RECOMMEND_ICON_PATHS));
  const candidate = items[index - 1];
  const report = items[index + 1];
  if (index < 1 || candidate === undefined || report === undefined) {
    return null;
  }
  if (!hasIcon(report, REPORT_ICON_PATHS) || hasIcon(candidate, NOT_A_POSITION_CANDIDATE)) {
    return null;
  }
  return toMatch(candidate, "position");
}

/** True once every item has drawn its icon (YouTube loads some icons lazily). */
export function iconsSettled(popup: Element): boolean {
  return findMenuItems(popup).every((item) => iconPaths(item).length > 0);
}

export function iconPaths(item: Element): string[] {
  return Array.from(item.querySelectorAll("svg path"))
    .map((path) => normalizeText(path.getAttribute("d")))
    .filter((d) => d.length > 0);
}

export function itemLabel(item: Element): string {
  const title = item.querySelector(".ytListItemViewModelTitle, yt-formatted-string.title");
  return normalizeText((title ?? item).textContent);
}

function hasIcon(item: Element, known: readonly string[]): boolean {
  return iconPaths(item).some((d) => known.includes(d));
}

/**
 * Legacy renderers keep their data on the element as page-script properties.
 * Firefox content scripts only see those through `wrappedJSObject`.
 */
function hasNotInterestedRendererData(item: Element): boolean {
  const page = (item as Element & { wrappedJSObject?: object }).wrappedJSObject ?? item;
  try {
    const data: unknown = Reflect.get(page, "data");
    const icon: unknown =
      typeof data === "object" && data !== null ? Reflect.get(data, "icon") : null;
    const iconType: unknown =
      typeof icon === "object" && icon !== null ? Reflect.get(icon, "iconType") : null;
    return typeof iconType === "string" && NOT_INTERESTED_ICON_TYPES.has(iconType);
  } catch {
    return false; // Cross-compartment access can throw; the other matchers still apply.
  }
}

function toMatch(item: Element, matchedBy: MatchKind): NotInterestedMatch | null {
  const view = item.ownerDocument.defaultView;
  if (view === null) {
    return null;
  }
  // Sheet items put the handler on an inner <button role="menuitem">;
  // legacy items on <tp-yt-paper-item>.
  const inner = item.querySelector('[role="menuitem"], tp-yt-paper-item, button, a[href]');
  if (inner instanceof view.HTMLElement) {
    return { item, target: inner, matchedBy };
  }
  return item instanceof view.HTMLElement ? { item, target: item, matchedBy } : null;
}
