import { findThumbnailHit, type ThumbnailHit } from "../youtube/card.js";
import {
  type FailureReason,
  markNotInterested,
  type NotInterestedOptions,
  type NotInterestedResult,
} from "../youtube/not-interested.js";
import { showToast } from "./toast.js";

/** Set on <html> while the extension drives a menu; content.css hides the popup. */
export const BUSY_ATTRIBUTE = "data-ynir-busy";
/** Set on the card being dismissed; content.css dims its thumbnail. */
export const PENDING_ATTRIBUTE = "data-ynir-pending";

const FAILURE_MESSAGES: Record<FailureReason, string> = {
  "menu-did-not-open": "Couldn't open this video's menu.",
  "no-not-interested-item": "This item has no “Not interested” option.",
  "menu-did-not-close": "YouTube didn't confirm “Not interested”.",
};

export type InstallOptions = NotInterestedOptions & {
  onHit?: (hit: ThumbnailHit) => void;
  onResult?: (result: NotInterestedResult, card: Element) => void;
};

/**
 * Right-click on a video thumbnail → "Not interested" for that video.
 *
 * - Only thumbnails are taken over; titles, links and the rest of the page
 *   keep the browser's context menu.
 * - Shift+right-click (and Alt/Cmd) always gets the browser's menu.
 */
export function install(document: Document, options: InstallOptions = {}): () => void {
  let busy = false;

  const onContextMenu = (event: MouseEvent): void => {
    if (event.shiftKey || event.altKey || event.metaKey) {
      return;
    }
    const hit = findThumbnailHit(document, event);
    if (hit === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (busy) {
      return;
    }

    busy = true;
    options.onHit?.(hit);
    const root = document.documentElement;
    root.setAttribute(BUSY_ATTRIBUTE, "");
    hit.card.setAttribute(PENDING_ATTRIBUTE, "");

    void markNotInterested(document, hit.menuButton, options)
      .catch((): NotInterestedResult => ({ ok: false, reason: "menu-did-not-open" }))
      .then((result) => {
        busy = false;
        root.removeAttribute(BUSY_ATTRIBUTE);
        hit.card.removeAttribute(PENDING_ATTRIBUTE);
        if (!result.ok) {
          showToast(document, FAILURE_MESSAGES[result.reason]);
        }
        options.onResult?.(result, hit.card);
      });
  };

  document.addEventListener("contextmenu", onContextMenu, true);
  return () => document.removeEventListener("contextmenu", onContextMenu, true);
}
