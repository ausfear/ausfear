#!/usr/bin/env node
/**
 * Build the hero photos listed in data/hero-photos.ts.
 *
 *   npm run hero:photos
 *
 * Source: full-resolution transparent PNGs in assets/hero-photos/.
 * Output: public/cutouts/<name>.<hash>.webp and data/hero-photos.generated.json (read by the hero
 *         and the preloader). Old outputs in public/cutouts/ are removed.
 *
 * Why the black-and-white look is baked in: CSS filters on these large images were recomputed on
 * every frame of the photo wipe, which dropped it to a few frames per second on iPhone (NOTES.md 6b).
 * Matches the old CSS exactly: grayscale(1) contrast(1.12) brightness(1.02).
 *   contrast(c):   v → (v − 0.5)·c + 0.5      brightness(b): v → v·b
 *   combined (0–255): v → 1.12·1.02·v + 1.02·(127.5 − 127.5·1.12)
 *
 * Why the hash in the file name: browsers (and Safari especially) cache images by URL. With a fixed
 * name, a returning visitor can keep seeing an old photo; a new name for new content avoids that.
 */
import { readdir, mkdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "assets", "hero-photos");
const OUT_DIR = join(ROOT, "public", "cutouts");
const MANIFEST = join(ROOT, "data", "hero-photos.generated.json");
const CONTRAST = 1.12;
const BRIGHTNESS = 1.02;

const slope = CONTRAST * BRIGHTNESS;
const intercept = BRIGHTNESS * (127.5 - 127.5 * CONTRAST);

async function bake(file) {
  const src = sharp(join(SOURCE_DIR, file));
  const { data: grey, info } = await src
    .clone()
    .removeAlpha()
    .grayscale()
    .linear(slope, intercept)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data: alpha } = await src.clone().ensureAlpha().extractChannel("alpha").raw().toBuffer({ resolveWithObject: true });

  // Assemble RGBA explicitly (grey copied to R, G and B). Joining a 1-channel grey image with an
  // alpha channel gets misread by the WebP encoder as a two-channel colour image.
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < grey.length; i++, j += 4) {
    rgba[j] = rgba[j + 1] = rgba[j + 2] = grey[i];
    rgba[j + 3] = alpha[i]; // keep the cutout's transparency (also used as the name-overlay mask)
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toBuffer();
}

const { heroPhotos } = await import(pathToFileURL(join(ROOT, "data", "hero-photos.ts")).href);
await mkdir(OUT_DIR, { recursive: true });

const manifest = [];
const written = new Set();
for (const { file, alt } of heroPhotos) {
  const webp = await bake(file);
  const hash = createHash("sha256").update(webp).digest("hex").slice(0, 8);
  const name = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const outName = `${name}.${hash}.webp`;
  await writeFile(join(OUT_DIR, outName), webp);
  written.add(outName);
  manifest.push({ src: `/cutouts/${outName}`, alt });
  console.log(`  ${file} → public/cutouts/${outName} (${Math.round(webp.length / 1024)} KB)`);
}

// Drop outputs that are no longer listed (or were replaced by a new version)
for (const f of await readdir(OUT_DIR)) {
  if (!written.has(f)) {
    await rm(join(OUT_DIR, f));
    console.log(`  removed old public/cutouts/${f}`);
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log("Wrote data/hero-photos.generated.json");
