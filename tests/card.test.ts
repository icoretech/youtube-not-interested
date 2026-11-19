import { findThumbnailHit } from "../src/youtube/card.js";
import { get, mountYouTube } from "./fixtures.js";

const at = (target: Element) => ({ target, clientX: 10, clientY: 10 });

afterEach(() => {
  Reflect.deleteProperty(document, "elementsFromPoint");
});

describe("findThumbnailHit", () => {
  beforeEach(() => mountYouTube(document));

  it("resolves a thumbnail to its card and ⋮ button", () => {
    const hit = findThumbnailHit(document, at(get(document, '[data-role="thumb"]', 1)));
    expect(hit?.card.getAttribute("data-video")).toBe("vid00000002");
    expect(hit?.menuButton.getAttribute("data-role")).toBe("menu-button");
  });

  it("never picks a button drawn over the thumbnail", () => {
    const hit = findThumbnailHit(document, at(get(document, '[data-role="hover-button"]')));
    expect(hit?.menuButton.getAttribute("data-role")).toBe("menu-button");
  });

  it("ignores titles and everything outside thumbnails", () => {
    expect(findThumbnailHit(document, at(get(document, '[data-role="title"]')))).toBeNull();
    expect(findThumbnailHit(document, at(document.body))).toBeNull();
  });

  it("looks through YouTube's hover preview to the thumbnail underneath", () => {
    const preview = document.createElement("ytd-video-preview");
    preview.innerHTML = "<video></video>";
    document.body.append(preview);
    const video = preview.firstElementChild as Element;
    const thumb = get(document, '[data-role="thumb"]');
    Object.assign(document, { elementsFromPoint: () => [video, preview, thumb, document.body] });

    const hit = findThumbnailHit(document, at(video));
    expect(hit?.card.getAttribute("data-video")).toBe("vid00000001");
  });

  it("does not reach through other overlays such as the miniplayer", () => {
    const miniplayer = document.createElement("ytd-miniplayer");
    document.body.append(miniplayer);
    const thumb = get(document, '[data-role="thumb"]');
    Object.assign(document, { elementsFromPoint: () => [miniplayer, thumb, document.body] });

    expect(findThumbnailHit(document, at(miniplayer))).toBeNull();
  });
});
