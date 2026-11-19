// Small DOM helpers shared by the YouTube modules.

/**
 * True when the element takes part in layout and is not hidden by an
 * ancestor. Opacity is deliberately ignored: the extension fades YouTube's
 * popup out while it works, and a transparent menu is still a usable menu.
 */
export function isShown(element: Element): boolean {
  if (!element.isConnected) {
    return false;
  }
  const view = element.ownerDocument.defaultView;
  if (view === null) {
    return false;
  }
  for (let node: Element | null = element; node !== null; node = node.parentElement) {
    if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") {
      return false;
    }
    if (view.getComputedStyle(node).display === "none") {
      return false;
    }
  }
  return view.getComputedStyle(element).visibility !== "hidden";
}

/**
 * Activates an element the way a mouse click would. YouTube's components
 * listen to different parts of the sequence (pointer, mouse or click), so all
 * of them are sent.
 */
export function activate(element: Element): void {
  const init = { bubbles: true, cancelable: true, composed: true, button: 0 };
  const view = element.ownerDocument.defaultView;
  const Pointer = view?.PointerEvent;
  const Mouse = view?.MouseEvent ?? MouseEvent;
  if (typeof Pointer === "function") {
    element.dispatchEvent(
      new Pointer("pointerdown", { ...init, buttons: 1, pointerType: "mouse" }),
    );
  }
  element.dispatchEvent(new Mouse("mousedown", { ...init, buttons: 1 }));
  if (typeof Pointer === "function") {
    element.dispatchEvent(new Pointer("pointerup", { ...init, pointerType: "mouse" }));
  }
  element.dispatchEvent(new Mouse("mouseup", init));
  if (element instanceof (view?.HTMLElement ?? HTMLElement)) {
    element.click();
  } else {
    element.dispatchEvent(new Mouse("click", init));
  }
}

/** Sends Escape to whatever has focus, which closes YouTube's popups. */
export function pressEscape(document: Document): void {
  const target = document.activeElement ?? document.body ?? document.documentElement;
  const view = document.defaultView;
  const Keyboard = view?.KeyboardEvent ?? KeyboardEvent;
  const init = { bubbles: true, cancelable: true, composed: true, key: "Escape", code: "Escape" };
  target.dispatchEvent(new Keyboard("keydown", { ...init, keyCode: 27 }));
  target.dispatchEvent(new Keyboard("keyup", { ...init, keyCode: 27 }));
}

/** Polls `probe` until it returns a value or the timeout passes. */
export function waitFor<T>(
  probe: () => T | null | undefined,
  { timeoutMs, intervalMs = 25 }: { timeoutMs: number; intervalMs?: number },
): Promise<T | null> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const tick = (): void => {
      const value = probe();
      if (value !== null && value !== undefined) {
        resolve(value);
      } else if (Date.now() >= deadline) {
        resolve(null);
      } else {
        setTimeout(tick, intervalMs);
      }
    };
    tick();
  });
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}
