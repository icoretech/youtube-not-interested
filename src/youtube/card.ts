import { isShown } from "./dom.js";
import {
  CARD_SELECTOR,
  HOVER_PREVIEW_SELECTOR,
  MENU_BUTTON_SELECTORS,
  MENU_POPUP_SELECTOR,
  THUMBNAIL_SELECTOR,
} from "./selectors.js";

export type ThumbnailHit = {
  card: Element;
  thumbnail: Element;
  menuButton: HTMLElement;
};

type PointerLike = Pick<MouseEvent, "target" | "clientX" | "clientY">;

/**
 * Finds the video card whose thumbnail was right-clicked. Returns null for
 * anything else (titles, channel links, the player, menus...), so those keep
 * the browser's own context menu.
 */
export function findThumbnailHit(document: Document, event: PointerLike): ThumbnailHit | null {
  for (const element of elementsUnderPointer(document, event)) {
    const hit = hitFromElement(element);
    if (hit !== null) {
      return hit;
    }
    // A hover preview floats above the thumbnail it previews: look through it.
    // Anything else on top (miniplayer, dialogs, menus) blocks the thumbnail.
    if (element.closest(HOVER_PREVIEW_SELECTOR) === null) {
      return null;
    }
  }
  return null;
}

function* elementsUnderPointer(document: Document, event: PointerLike): Generator<Element> {
  const target = event.target;
  if (target instanceof Element) {
    yield target;
  }
  if (typeof document.elementsFromPoint !== "function") {
    return;
  }
  for (const element of document.elementsFromPoint(event.clientX, event.clientY)) {
    if (element !== target) {
      yield element;
    }
  }
}

function hitFromElement(element: Element): ThumbnailHit | null {
  if (element.closest(MENU_POPUP_SELECTOR) !== null) {
    return null;
  }
  const thumbnail = element.closest(THUMBNAIL_SELECTOR);
  if (thumbnail === null) {
    return null;
  }
  // Cards nest (a shorts lockup inside a rich item, for example). Walk outwards
  // until a card that owns a ⋮ button is found.
  for (let card = thumbnail.closest(CARD_SELECTOR); card !== null; ) {
    const menuButton = findMenuButton(card);
    if (menuButton !== null) {
      return { card, thumbnail, menuButton };
    }
    card = card.parentElement?.closest(CARD_SELECTOR) ?? null;
  }
  return null;
}

/** The card's ⋮ button. Buttons drawn over the thumbnail (Watch later...) are skipped. */
export function findMenuButton(card: Element): HTMLElement | null {
  const view = card.ownerDocument.defaultView;
  if (view === null) {
    return null;
  }
  for (const selector of MENU_BUTTON_SELECTORS) {
    for (const candidate of card.querySelectorAll(selector)) {
      if (
        candidate instanceof view.HTMLElement &&
        candidate.closest(THUMBNAIL_SELECTOR) === null &&
        !candidate.matches(":disabled") &&
        isShown(candidate)
      ) {
        return candidate;
      }
    }
  }
  return null;
}
