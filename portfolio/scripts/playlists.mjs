#!/usr/bin/env node
/**
 * Playlist data for the music carousel.
 *
 *   npm run playlists:sync
 *
 * For each playlist in data/playlists.ts:
 *   1. Read its public page on music.apple.com. The page embeds its data as JSON
 *      (<script id="serialized-server-data">): title, curator, cover, and the track list in order.
 *   2. Look the tracks up on the iTunes API for 30-second previews.
 *   3. Write data/playlists.generated.json, plus covers in public/playlists/ and public/songs/.
 *
 * No API key needed. The page format is not a documented API: if Apple changes it, this script
 * fails loudly and the site keeps using the last generated file.
 */
import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "data", "playlists.generated.json");
const COUNTRY = "id";
const DEFAULT_LIMIT = 8;
const UA = { "User-Agent": "Mozilla/5.0 (ausfear-portfolio playlists script)" };

const exists = (p) => access(p).then(() => true, () => false);

async function saveImage(url, file, size) {
  if (await exists(file)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  await mkdir(dirname(file), { recursive: true });
  await sharp(Buffer.from(await res.arrayBuffer())).resize(size, size, { fit: "cover" }).webp({ quality: 82 }).toFile(file);
}

/** Pull the embedded JSON out of a public playlist page and find its header and track list */
async function readPlaylistPage(slug, id) {
  const url = `https://music.apple.com/${COUNTRY}/playlist/${slug}/${id}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`playlist page HTTP ${res.status} (is it public?)`);
  const html = await res.text();
  const match = html.match(/<script type="application\/json" id="serialized-server-data">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("no serialized-server-data on the page (Apple may have changed the format)");

  // Locate sections by kind rather than position, so reordering on Apple's side doesn't break this
  const sections = JSON.parse(match[1]).data?.[0]?.data?.sections ?? [];
  const kindOf = (s) => s.itemKind ?? s.id ?? "";
  const header = sections.find((s) => kindOf(s).includes("containerDetailHeader"))?.items?.[0];
  const tracks = sections.find((s) => kindOf(s).includes("trackLockup"))?.items ?? [];
  if (!header || tracks.length === 0) throw new Error("header or track list not found (Apple may have changed the format)");

  return {
    url,
    title: header.title,
    curator: header.subtitleLinks?.[0]?.title ?? "",
    trackCount: header.trackCount ?? tracks.length,
    coverTemplate: header.artwork?.dictionary?.url ?? null,
    trackIds: tracks
      .map((t) => Number(t.contentDescriptor?.identifiers?.storeAdamID))
      .filter((n) => Number.isFinite(n) && n > 0),
  };
}

async function lookup(ids) {
  const out = new Map();
  // The lookup endpoint accepts many IDs at once; keep batches comfortably small
  for (let i = 0; i < ids.length; i += 150) {
    const batch = ids.slice(i, i + 150);
    const res = await fetch(`https://itunes.apple.com/lookup?id=${batch.join(",")}&country=${COUNTRY}&entity=song`);
    if (!res.ok) throw new Error(`iTunes lookup HTTP ${res.status}`);
    for (const r of (await res.json()).results) if (r.trackId) out.set(r.trackId, r);
  }
  return out;
}

const { playlists } = await import(pathToFileURL(join(ROOT, "data", "playlists.ts")).href);
const result = [];

for (const config of playlists) {
  const page = await readPlaylistPage(config.slug, config.id);
  const wanted = config.trackIds ?? page.trackIds;
  const found = await lookup(wanted);
  const limit = config.trackIds ? config.trackIds.length : (config.limit ?? DEFAULT_LIMIT);

  const tracks = [];
  for (const id of wanted) {
    if (tracks.length >= limit) break;
    const r = found.get(id);
    if (!r?.previewUrl) continue; // not in this storefront, or no preview: skip to the next song
    const artwork = `/songs/${id}.webp`;
    await saveImage(r.artworkUrl100.replace(/\/\d+x\d+bb\./, "/300x300bb."), join(ROOT, "public", artwork), 160);
    tracks.push({
      id: String(id),
      title: r.trackName,
      artist: r.artistName,
      previewUrl: r.previewUrl,
      appleMusicUrl: r.trackViewUrl,
      artwork,
    });
  }

  let cover = null;
  if (page.coverTemplate) {
    cover = `/playlists/${config.slug}.webp`;
    const coverUrl = page.coverTemplate.replace("{w}", "600").replace("{h}", "600").replace("{f}", "jpg");
    await saveImage(coverUrl, join(ROOT, "public", cover), 480);
  }

  result.push({
    id: config.id,
    label: config.label,
    title: page.title,
    curator: page.curator,
    url: page.url,
    trackCount: page.trackCount,
    cover,
    tracks,
  });
  console.log(`  ${page.title}: ${tracks.length} of ${page.trackCount} songs`);
}

await writeFile(OUT_FILE, JSON.stringify(result, null, 2) + "\n");
console.log("Wrote data/playlists.generated.json");
