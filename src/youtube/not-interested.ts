import { activate, pressEscape, waitFor } from "./dom.js";
import {
  findNotInterestedByPosition,
  findNotInterestedItem,
  findShownMenuPopups,
  iconsSettled,
  type MatchKind,
  type NotInterestedMatch,
} from "./menu.js";

export type FailureReason = "menu-did-not-open" | "no-not-interested-item" | "menu-did-not-close";

export type NotInterestedResult =
  | { ok: true; matchedBy: MatchKind; popup: Element }
  | { ok: false; reason: FailureReason; popup?: Element };

export type NotInterestedOptions = {
  /** How long YouTube gets to open the ⋮ menu. */
  openTimeoutMs?: number;
  /** How long lazily loaded menu icons get to appear before falling back to position. */
  iconTimeoutMs?: number;
  /** How long YouTube gets to close the menu after "Not interested". */
  closeTimeoutMs?: number;
};

const NO_MATCH = Symbol("no-match");

/**
 * Opens a card's ⋮ menu and picks "Not interested", exactly as a user would.
 * YouTube then swaps the card for its own "Video removed · Undo" notice.
 */
export async function markNotInterested(
  document: Document,
  menuButton: HTMLElement,
  {
    openTimeoutMs = 2_000,
    iconTimeoutMs = 1_000,
    closeTimeoutMs = 1_500,
  }: NotInterestedOptions = {},
): Promise<NotInterestedResult> {
  // A menu left open for another video must not be mistaken for this one.
  if (findShownMenuPopups(document).length > 0) {
    pressEscape(document);
    await waitFor(() => (findShownMenuPopups(document).length === 0 ? true : null), {
      timeoutMs: 500,
    });
  }
  const stale = new Set(findShownMenuPopups(document));

  activate(menuButton);
  const popup = await waitFor(
    () => findShownMenuPopups(document).find((candidate) => !stale.has(candidate)),
    { timeoutMs: openTimeoutMs },
  );
  if (popup === null) {
    return { ok: false, reason: "menu-did-not-open" };
  }

  // Icons can arrive a moment after the menu: keep looking until they have.
  const found = await waitFor<NotInterestedMatch | typeof NO_MATCH>(
    () => findNotInterestedItem(popup) ?? (iconsSettled(popup) ? NO_MATCH : null),
    { timeoutMs: iconTimeoutMs },
  );
  const match = found === NO_MATCH || found === null ? findNotInterestedByPosition(popup) : found;
  if (match === null) {
    pressEscape(document);
    return { ok: false, reason: "no-not-interested-item", popup };
  }

  activate(match.target);
  const closed = await waitFor(
    () => (findShownMenuPopups(document).includes(popup) ? null : true),
    { timeoutMs: closeTimeoutMs },
  );
  if (closed === null) {
    pressEscape(document);
    return { ok: false, reason: "menu-did-not-close", popup };
  }
  return { ok: true, matchedBy: match.matchedBy, popup };
}
