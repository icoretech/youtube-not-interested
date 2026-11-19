// Local collector for debug builds: prints every report the content script
// sends and appends it to debug-reports.ndjson (git-ignored).
//   npm run build:debug && node scripts/debug-server.mjs
import { appendFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = 47123;
const logFile = "debug-reports.ndjson";

createServer((request, response) => {
  response.setHeader("access-control-allow-origin", "*");
  if (request.method !== "POST") {
    response.end();
    return;
  }
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", async () => {
    await appendFile(logFile, `${body}\n`);
    const report = JSON.parse(body);
    console.log(JSON.stringify({ ...report, card: report.card?.tag, popupHtml: undefined }));
    response.end();
  });
}).listen(port, "127.0.0.1", () => console.log(`debug collector on http://127.0.0.1:${port}/`));
