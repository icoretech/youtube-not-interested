import {
  findNotInterestedByPosition,
  findNotInterestedItem,
  findShownMenuPopups,
  iconsSettled,
} from "../src/youtube/menu.js";
import { ITALIAN_SHEET, type SheetEntry, sheetHtml, UNKNOWN_ICON } from "./fixtures.js";

function popupFor(entries: SheetEntry[]): Element {
  document.body.innerHTML = sheetHtml(entries);
  const popup = document.querySelector("yt-sheet-view-model");
  if (popup === null) {
    throw new Error("no popup");
  }
  return popup;
}

const entryOf = (match: ReturnType<typeof findNotInterestedItem>) =>
  match?.item.getAttribute("data-entry");

describe("findNotInterestedItem", () => {
  it("matches by icon, whatever the language", () => {
    const korean = ITALIAN_SHEET.map((entry, index) => ({ ...entry, label: `항목 ${index}` }));
    const match = findNotInterestedItem(popupFor(korean));
    expect(entryOf(match)).toBe("not-interested");
    expect(match?.matchedBy).toBe("icon");
    expect(match?.target.getAttribute("role")).toBe("menuitem");
  });

  it("does not confuse icons that share the circle outline", () => {
    const sheet = ITALIAN_SHEET.filter((entry) => entry.id !== "not-interested").map((entry) => ({
      ...entry,
      label: "?",
    }));
    expect(findNotInterestedItem(popupFor(sheet))).toBeNull();
  });

  it("falls back to the localized label while icons are missing", () => {
    const noIcons = ITALIAN_SHEET.map(({ icon: _icon, ...entry }) => entry);
    const match = findNotInterestedItem(popupFor(noIcons));
    expect(entryOf(match)).toBe("not-interested");
    expect(match?.matchedBy).toBe("label");
  });

  it("matches legacy Polymer items through their renderer data", () => {
    document.body.innerHTML = `<ytd-menu-popup-renderer role="menu">
      <ytd-menu-service-item-renderer data-entry="share"><tp-yt-paper-item role="menuitem">Partager</tp-yt-paper-item></ytd-menu-service-item-renderer>
      <ytd-menu-service-item-renderer data-entry="not-interested"><tp-yt-paper-item role="menuitem">???</tp-yt-paper-item></ytd-menu-service-item-renderer>
    </ytd-menu-popup-renderer>`;
    const items = document.querySelectorAll("ytd-menu-service-item-renderer");
    Object.assign(items[0] as Element, { data: { icon: { iconType: "SHARE" } } });
    Object.assign(items[1] as Element, { data: { icon: { iconType: "NOT_INTERESTED" } } });
    const match = findNotInterestedItem(
      document.querySelector("ytd-menu-popup-renderer") as Element,
    );
    expect(entryOf(match)).toBe("not-interested");
    expect(match?.matchedBy).toBe("renderer-data");
    expect(match?.target.tagName).toBe("TP-YT-PAPER-ITEM");
  });
});

describe("findNotInterestedByPosition", () => {
  it("takes the entry above “Don't recommend channel” when Report follows it", () => {
    const changedIcon = ITALIAN_SHEET.map((entry) =>
      entry.id === "not-interested" ? { ...entry, label: "???", icon: UNKNOWN_ICON } : entry,
    );
    const match = findNotInterestedByPosition(popupFor(changedIcon));
    expect(entryOf(match)).toBe("not-interested");
    expect(match?.matchedBy).toBe("position");
  });

  it("refuses when the neighbours are not the expected ones", () => {
    const withoutReport = ITALIAN_SHEET.filter((entry) => entry.id !== "report");
    expect(findNotInterestedByPosition(popupFor(withoutReport))).toBeNull();
    const withoutAnchor = ITALIAN_SHEET.filter((entry) => entry.id !== "dont-recommend");
    expect(findNotInterestedByPosition(popupFor(withoutAnchor))).toBeNull();
  });

  it("never lands on a known action when “Not interested” is absent", () => {
    // The slot above "Don't recommend channel" is then "Share".
    const withoutNotInterested = ITALIAN_SHEET.filter((entry) => entry.id !== "not-interested");
    expect(findNotInterestedByPosition(popupFor(withoutNotInterested))).toBeNull();
  });
});

describe("popup helpers", () => {
  it("reports icons as settled only when every entry has one", () => {
    expect(iconsSettled(popupFor(ITALIAN_SHEET))).toBe(true);
    const oneMissing = ITALIAN_SHEET.map((entry, index) =>
      index === 0 ? { id: entry.id, label: entry.label } : entry,
    );
    expect(iconsSettled(popupFor(oneMissing))).toBe(false);
  });

  it("lists only shown popups, outermost element only", () => {
    popupFor(ITALIAN_SHEET);
    expect(findShownMenuPopups(document)).toHaveLength(0);
    const dropdown = document.querySelector<HTMLElement>("tp-yt-iron-dropdown") as HTMLElement;
    dropdown.style.display = "";
    dropdown.removeAttribute("aria-hidden");
    const shown = findShownMenuPopups(document);
    expect(shown.map((popup) => popup.tagName)).toEqual(["YT-SHEET-VIEW-MODEL"]);
  });
});
