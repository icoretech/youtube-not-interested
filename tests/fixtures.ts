// Trimmed copies of the markup youtube.com serves (captured in LibreWolf,
// November 2026), plus a tiny stand-in for YouTube's menu behaviour.
import {
  DONT_RECOMMEND_ICON_PATHS,
  NOT_INTERESTED_ICON_PATHS,
  OTHER_ACTION_ICON_PATHS,
  REPORT_ICON_PATHS,
} from "../src/youtube/menu.js";

export const ICON = {
  queue: OTHER_ACTION_ICON_PATHS.addToQueue,
  watchLater: OTHER_ACTION_ICON_PATHS.watchLater,
  share: OTHER_ACTION_ICON_PATHS.share,
  notInterested: NOT_INTERESTED_ICON_PATHS[0] as string,
  dontRecommend: DONT_RECOMMEND_ICON_PATHS[0] as string,
  report: REPORT_ICON_PATHS[0] as string,
};

export type SheetEntry = { label: string; icon?: string; id: string };

/** An icon none of the matchers know. */
export const UNKNOWN_ICON = "M0 0h24v24H0Z";

/** The menu YouTube shows for a home-feed video, in Italian. */
export const ITALIAN_SHEET: SheetEntry[] = [
  { id: "queue", label: "Aggiungi alla coda", icon: ICON.queue },
  { id: "watch-later", label: "Salva in Guarda più tardi", icon: ICON.watchLater },
  { id: "share", label: "Condividi", icon: ICON.share },
  { id: "not-interested", label: "Non mi interessa", icon: ICON.notInterested },
  { id: "dont-recommend", label: "Non consigliare il canale", icon: ICON.dontRecommend },
  { id: "report", label: "Segnala", icon: ICON.report },
];

function sheetItem({ id, label, icon }: SheetEntry): string {
  const svg = icon ? `<div><svg viewBox="0 0 24 24"><path d="${icon}"></path></svg></div>` : "";
  return `<yt-list-item-view-model class="ytListItemViewModelHost" role="presentation" data-entry="${id}">
    <div class="ytListItemViewModelLayoutWrapper"><div class="ytListItemViewModelMainContainer">
      <div aria-hidden="true" class="ytListItemViewModelImageContainer"><span class="ytIconWrapperHost"><span class="yt-icon-shape">${svg}</span></span></div>
      <button class="ytButtonOrAnchorHost ytListItemViewModelButtonOrAnchor" role="menuitem">
        <div><div class="ytListItemViewModelTitleWrapper"><span class="ytAttributedStringHost ytListItemViewModelTitle" role="text">${label}</span></div></div>
      </button>
    </div></div>
  </yt-list-item-view-model>`;
}

export function sheetHtml(entries: SheetEntry[]): string {
  return `<ytd-popup-container><tp-yt-iron-dropdown aria-hidden="true" style="display: none">
    <yt-sheet-view-model class="ytSheetViewModelHost"><yt-contextual-sheet-layout class="ytContextualSheetLayoutHost">
      <yt-list-view-model class="ytListViewModelHost" role="menu">${entries.map(sheetItem).join("")}</yt-list-view-model>
    </yt-contextual-sheet-layout></yt-sheet-view-model>
  </tp-yt-iron-dropdown></ytd-popup-container>`;
}

export function lockupHtml(videoId: string): string {
  return `<ytd-rich-item-renderer><yt-lockup-view-model class="lockup ytLockupViewModelWrapper" data-video="${videoId}">
    <div class="ytLockupViewModelHost">
      <a href="/watch?v=${videoId}" class="ytLockupViewModelContentImage" aria-hidden="true">
        <yt-thumbnail-view-model class="ytThumbnailViewModelHost">
          <div class="ytThumbnailViewModelImage"><img alt="" data-role="thumb"></div>
          <button-view-model><button aria-label="Watch later" data-role="hover-button">W</button></button-view-model>
        </yt-thumbnail-view-model>
      </a>
      <div class="ytLockupViewModelMetadata"><yt-lockup-metadata-view-model class="ytLockupMetadataViewModelHost">
        <h3><a href="/watch?v=${videoId}" class="ytLockupMetadataViewModelTitle" data-role="title">Video ${videoId}</a></h3>
        <div class="ytLockupMetadataViewModelMenuButton"><button-view-model class="ytSpecButtonViewModelHost">
          <button aria-label="More actions" data-role="menu-button">⋮</button>
        </button-view-model></div>
      </yt-lockup-metadata-view-model></div>
    </div>
  </yt-lockup-view-model></ytd-rich-item-renderer>`;
}

export type FakeYouTube = {
  /** Entries clicked in the menu, as `<videoId>:<entry id>`. */
  clicks: string[];
  dropdown: HTMLElement;
};

/**
 * Mounts cards plus one shared menu and wires them like YouTube does: ⋮ opens
 * the menu for that card, picking an entry closes it.
 */
export function mountYouTube(
  document: Document,
  {
    videos = ["vid00000001", "vid00000002"],
    sheet = ITALIAN_SHEET,
    opensMenu = true,
  }: { videos?: string[]; sheet?: SheetEntry[]; opensMenu?: boolean } = {},
): FakeYouTube {
  document.body.innerHTML = `<div id="contents">${videos.map(lockupHtml).join("")}</div>${sheetHtml(sheet)}`;
  const dropdown = document.querySelector<HTMLElement>("tp-yt-iron-dropdown") as HTMLElement;
  const fake: FakeYouTube = { clicks: [], dropdown };
  let openFor: string | null = null;

  for (const button of document.querySelectorAll('[data-role="menu-button"]')) {
    button.addEventListener("click", () => {
      if (!opensMenu) {
        return;
      }
      openFor = button.closest("[data-video]")?.getAttribute("data-video") ?? null;
      dropdown.style.display = "";
      dropdown.removeAttribute("aria-hidden");
    });
  }
  for (const target of document.querySelectorAll('yt-list-item-view-model [role="menuitem"]')) {
    target.addEventListener("click", () => {
      const entry = target.closest("[data-entry]")?.getAttribute("data-entry");
      fake.clicks.push(`${openFor}:${entry}`);
      dropdown.style.display = "none";
      dropdown.setAttribute("aria-hidden", "true");
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdown.style.display = "none";
      dropdown.setAttribute("aria-hidden", "true");
    }
  });
  return fake;
}

export function rightClick(
  target: Element,
  init: MouseEventInit = {},
): { event: MouseEvent; dispatched: boolean } {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    button: 2,
    ...init,
  });
  const dispatched = target.dispatchEvent(event);
  return { event, dispatched };
}

export function get(document: Document, selector: string, index = 0): Element {
  const element = document.querySelectorAll(selector)[index];
  if (element === undefined) {
    throw new Error(`fixture is missing ${selector}`);
  }
  return element;
}
