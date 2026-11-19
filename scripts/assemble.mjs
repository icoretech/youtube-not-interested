// Lays out one unpacked extension per browser from the shared Vite bundle:
//   dist/chrome  -> load via chrome://extensions ("Load unpacked")
//   dist/firefox -> load via about:debugging (Firefox, LibreWolf)
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundleDir = join(rootDir, "dist/.bundle");
const targets = ["chrome", "firefox"];

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const base = await readJson(join(rootDir, "manifest/base.json"));
const { version } = await readJson(join(rootDir, "package.json"));

for (const target of targets) {
  const outDir = join(rootDir, "dist", target);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const overrides = await readJson(join(rootDir, `manifest/${target}.json`));
  const manifest = { ...base, ...overrides, version };
  await writeFile(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  await cp(join(bundleDir, "content.js"), join(outDir, "content.js"));
  await cp(join(rootDir, "src/content/content.css"), join(outDir, "content.css"));
  await cp(join(rootDir, "assets/icons"), join(outDir, "icons"), { recursive: true });
}

console.log(`assembled ${targets.map((t) => `dist/${t}`).join(", ")} (v${version})`);
