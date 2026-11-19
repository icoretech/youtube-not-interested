import { reportHit, reportLoaded, reportResult } from "./debug.js";
import { install } from "./install.js";

declare const __DEBUG__: boolean;

if (__DEBUG__) {
  reportLoaded();
  install(document, { onHit: reportHit, onResult: reportResult });
} else {
  install(document);
}
