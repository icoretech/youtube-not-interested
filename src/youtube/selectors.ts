// YouTube DOM knowledge lives here. YouTube ships two generations of video
// cards and menus side by side (Polymer `ytd-*` renderers and the newer
// `*-view-model` components), so every selector lists both.

/** A video card: the element that owns one video's ⋮ menu button. */
export const CARD_SELECTORS = [
  "yt-lockup-view-model",
  "ytm-shorts-lockup-view-model",
  "ytm-shorts-lockup-view-model-v2",
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-reel-item-renderer",
  "ytd-playlist-video-renderer",
] as const;

/** The thumbnail area of a card. Only right-clicks here are taken over. */
export const THUMBNAIL_SELECTORS = [
  "yt-thumbnail-view-model",
  ".ytLockupViewModelContentImage",
  "ytd-thumbnail",
  "ytd-playlist-thumbnail",
  "a#thumbnail",
  ".shortsLockupViewModelHostThumbnailContainer",
  "a.shortsLockupViewModelHostEndpoint",
  "a.reel-item-endpoint",
] as const;

/**
 * Hover previews that YouTube floats above a thumbnail. A right-click on one
 * of these is treated as a right-click on the thumbnail underneath.
 */
export const HOVER_PREVIEW_SELECTORS = [
  "ytd-video-preview",
  "#video-preview",
  "#inline-preview-player",
] as const;

/** The ⋮ button inside a card, most specific first. */
export const MENU_BUTTON_SELECTORS = [
  ".ytLockupMetadataViewModelMenuButton button",
  ".shortsLockupViewModelHostOutsideMetadataMenu button",
  ".shortsLockupViewModelHostMetadataMenu button",
  "ytd-menu-renderer yt-icon-button#button button",
  "ytd-menu-renderer button#button",
  'button[aria-haspopup="true"]',
  'button[aria-haspopup="menu"]',
  "button-view-model button",
  "yt-button-shape button",
] as const;

/** The popup that the ⋮ button opens (new sheet, then legacy popup). */
export const MENU_POPUP_SELECTORS = [
  "yt-contextual-sheet-layout",
  "yt-sheet-view-model",
  "ytd-menu-popup-renderer",
] as const;

/** One entry inside the popup. */
export const MENU_ITEM_SELECTORS = [
  "yt-list-item-view-model",
  "ytd-menu-service-item-renderer",
  "ytd-menu-navigation-item-renderer",
] as const;

export const CARD_SELECTOR = CARD_SELECTORS.join(", ");
export const THUMBNAIL_SELECTOR = THUMBNAIL_SELECTORS.join(", ");
export const HOVER_PREVIEW_SELECTOR = HOVER_PREVIEW_SELECTORS.join(", ");
export const MENU_POPUP_SELECTOR = MENU_POPUP_SELECTORS.join(", ");
export const MENU_ITEM_SELECTOR = MENU_ITEM_SELECTORS.join(", ");
