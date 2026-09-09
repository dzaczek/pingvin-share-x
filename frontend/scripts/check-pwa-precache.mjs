import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const frontend = new URL("../", import.meta.url);
const worker = readFileSync(new URL("public/sw.js", frontend), "utf8");
const nextAssets = [...worker.matchAll(/\burl:\s*"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => url.startsWith("/_next/"));

assert(nextAssets.length > 0, "No Next.js assets found in the PWA precache");

// Build metadata can exist under .next without being served by Next.js.
// Precaching such a URL returns 404 and aborts service worker installation.
for (const url of nextAssets) {
  assert(
    url.startsWith("/_next/static/"),
    `PWA precache includes a non-public Next.js asset: ${url}`,
  );
  assert(
    existsSync(new URL(url.replace(/^\/_next\//, ".next/"), frontend)),
    `PWA precache asset is missing from the build: ${url}`,
  );
}

console.log(
  `PWA precache verified: ${nextAssets.length} public Next.js assets`,
);
