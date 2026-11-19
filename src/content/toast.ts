const TOAST_ID = "ynir-toast";
const TOAST_MS = 3_500;

/** A short message in the corner of the page. Used only when something went wrong. */
export function showToast(document: Document, message: string): void {
  document.getElementById(TOAST_ID)?.remove();
  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  (document.body ?? document.documentElement).append(toast);
  setTimeout(() => toast.remove(), TOAST_MS);
}
