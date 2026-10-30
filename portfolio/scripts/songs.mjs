#!/usr/bin/env node
/**
 * Song card data for the music section.
 *
 *   npm run songs:sync   Look up every song in data/songs.ts on the iTunes API and write
 *                        data/songs.generated.json (title, artist, preview URL, Apple Music link)
 *                        plus a cover per song in public/songs/<trackId>.webp.
 *
 * No API key needed. Re-run it if a preview stops playing: Apple occasionally moves preview files.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "data", "songs.generated.json");
const COVER_DIR = join(ROOT, "public", "songs");
// Storefront for titles and preview availability
const COUNTRY = "id";

const { songs } = await import(pathToFileURL(join(ROOT, "data", "songs.ts")).href);
const ids = songs.map((s) => s.trackId);

const res = await fetch(`https://itunes.apple.com/lookup?id=${ids.join(",")}&country=${COUNTRY}&entity=song`);
if (!res.ok) {
  console.error(`iTunes lookup failed: HTTP ${res.status}`);
  process.exit(1);
}
const results = new Map((await res.json()).results.map((r) => [r.trackId, r]));

await mkdir(COVER_DIR, { recursive: true });
const out = {};
for (const id of ids) {
  const r = results.get(id);
  if (!r) {
    console.warn(`  ${id}: not found in the ${COUNTRY} storefront, skipped`);
    continue;
  }
  if (!r.previewUrl) console.warn(`  ${id} (${r.trackName}): no preview available`);

  // Artwork URLs end in a size like 100x100bb.jpg; ask for a larger one, then shrink locally
  const artUrl = r.artworkUrl100.replace(/\/\d+x\d+bb\./, "/600x600bb.");
  const art = Buffer.from(await (await fetch(artUrl)).arrayBuffer());
  await sharp(art).resize(240, 240, { fit: "cover" }).webp({ quality: 82 }).toFile(join(COVER_DIR, `${id}.webp`));

  out[id] = {
    title: r.trackName,
    artist: r.artistName,
    previewUrl: r.previewUrl ?? null,
    appleMusicUrl: r.trackViewUrl,
    artwork: `/songs/${id}.webp`,
  };
  console.log(`  ${id}: ${r.trackName} — ${r.artistName}`);
}

await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
console.log("Wrote data/songs.generated.json");
