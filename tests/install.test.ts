import { BUSY_ATTRIBUTE, type InstallOptions, install } from "../src/content/install.js";
import type { NotInterestedResult } from "../src/youtube/not-interested.js";
import { get, ITALIAN_SHEET, mountYouTube, rightClick } from "./fixtures.js";

const fast = { openTimeoutMs: 150, iconTimeoutMs: 100, closeTimeoutMs: 150 };

let uninstall: () => void = () => undefined;
afterEach(() => uninstall());

function setup(options: InstallOptions = {}) {
  const results: NotInterestedResult[] = [];
  const settled = new Promise<NotInterestedResult>((resolve) => {
    uninstall = install(document, {
      ...fast,
      ...options,
      onResult: (result) => {
        results.push(result);
        resolve(result);
      },
    });
  });
  return { results, settled };
}

describe("right-click on a thumbnail", () => {
  it("picks “Not interested” for that video and suppresses the browser menu", async () => {
    const youtube = mountYouTube(document);
    const { settled } = setup();

    const { dispatched } = rightClick(get(document, '[data-role="thumb"]', 1));
    expect(dispatched).toBe(false);
    expect(document.documentElement.hasAttribute(BUSY_ATTRIBUTE)).toBe(true);

    expect(await settled).toMatchObject({ ok: true, matchedBy: "icon" });
    expect(youtube.clicks).toEqual(["vid00000002:not-interested"]);
    expect(document.documentElement.hasAttribute(BUSY_ATTRIBUTE)).toBe(false);
    expect(document.getElementById("ynir-toast")).toBeNull();
  });

  it("leaves the browser menu alone on titles", () => {
    const youtube = mountYouTube(document);
    setup();
    expect(rightClick(get(document, '[data-role="title"]')).dispatched).toBe(true);
    expect(youtube.clicks).toEqual([]);
  });

  it("leaves Shift/Alt/Cmd + right-click to the browser", () => {
    mountYouTube(document);
    setup();
    const thumb = get(document, '[data-role="thumb"]');
    expect(rightClick(thumb, { shiftKey: true }).dispatched).toBe(true);
    expect(rightClick(thumb, { altKey: true }).dispatched).toBe(true);
    expect(rightClick(thumb, { metaKey: true }).dispatched).toBe(true);
  });

  it("ignores repeat right-clicks while one is in progress", async () => {
    const youtube = mountYouTube(document);
    const { settled } = setup();
    rightClick(get(document, '[data-role="thumb"]', 0));
    expect(rightClick(get(document, '[data-role="thumb"]', 1)).dispatched).toBe(false);
    await settled;
    expect(youtube.clicks).toEqual(["vid00000001:not-interested"]);
  });

  it("shows a note and clicks nothing when the menu has no “Not interested”", async () => {
    const youtube = mountYouTube(document, {
      sheet: ITALIAN_SHEET.filter((entry) => entry.id !== "not-interested"),
    });
    const { settled } = setup();
    rightClick(get(document, '[data-role="thumb"]'));

    expect(await settled).toMatchObject({ ok: false, reason: "no-not-interested-item" });
    expect(youtube.clicks).toEqual([]);
    expect(youtube.dropdown.getAttribute("aria-hidden")).toBe("true");
    expect(document.getElementById("ynir-toast")?.textContent).toContain("Not interested");
  });

  it("reports a menu that never opens", async () => {
    mountYouTube(document, { opensMenu: false });
    const { settled } = setup();
    rightClick(get(document, '[data-role="thumb"]'));
    expect(await settled).toMatchObject({ ok: false, reason: "menu-did-not-open" });
  });

  it("stops listening after uninstall", () => {
    mountYouTube(document);
    setup();
    uninstall();
    expect(rightClick(get(document, '[data-role="thumb"]')).dispatched).toBe(true);
  });
});
