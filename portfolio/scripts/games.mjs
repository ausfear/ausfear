#!/usr/bin/env node
/**
 * Game collection helper for the Gaming section.
 *
 *   npm run games:sync              Fetch the whole Steam library (hours + genre tags)
 *                                   into data/steam-library.json, refresh data/game-hours.json,
 *                                   then download any missing cover images.
 *   npm run games:images            Only download missing cover images for data/games.ts.
 *   npm run games:find -- "Hades"   Search your library and the Steam store by name,
 *                                   printing the appid and genre tags to copy into data/games.ts.
 *
 * Needs STEAM_API_KEY in .env.local (only for sync). The key is never printed.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIBRARY_FILE = join(ROOT, "data", "steam-library.json");
const HOURS_FILE = join(ROOT, "data", "game-hours.json");
const IMAGE_DIR = join(ROOT, "public", "games");
const STEAM_ID = "76561198847406404";
// SteamSpy asks for at most ~1 request per second
const STEAMSPY_DELAY_MS = 1100;
// Tags are only fetched for games played at least this long (keeps sync fast)
const TAG_MIN_HOURS = 1;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "ausfear-portfolio-games-script" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchTags(appid) {
  try {
    const data = await getJson(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`);
    return Object.keys(data.tags ?? {}).slice(0, 8);
  } catch {
    return [];
  }
}

export function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadCurated() {
  const mod = await import(pathToFileURL(join(ROOT, "data", "games.ts")).href);
  return mod.games;
}

/* ── sync ─────────────────────────────────────────────────────────── */

async function sync() {
  const key = process.env.STEAM_API_KEY;
  if (!key) {
    console.error("STEAM_API_KEY is missing. Add it to .env.local first.");
    process.exit(1);
  }

  let owned;
  try {
    const url =
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/" +
      `?key=${encodeURIComponent(key)}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1&format=json`;
    owned = (await getJson(url)).response?.games ?? [];
  } catch (e) {
    // Don't echo the URL: it contains the key
    console.error(`Steam API request failed (${e.message}). Check that the key is valid.`);
    process.exit(1);
  }

  const previous = await readJson(LIBRARY_FILE, []);
  const previousTags = new Map(previous.map((g) => [g.appid, g.tags]));

  const library = owned
    .map((g) => ({
      appid: g.appid,
      name: g.name,
      hours: Math.round((g.playtime_forever / 60) * 10) / 10,
      lastPlayed: g.rtime_last_played ? new Date(g.rtime_last_played * 1000).toISOString().slice(0, 10) : null,
      tags: previousTags.get(g.appid) ?? [],
    }))
    .sort((a, b) => b.hours - a.hours);

  const needTags = library.filter((g) => g.hours >= TAG_MIN_HOURS && g.tags.length === 0);
  console.log(`Library: ${library.length} games. Fetching genre tags for ${needTags.length} of them...`);
  for (const [i, g] of needTags.entries()) {
    g.tags = await fetchTags(g.appid);
    process.stdout.write(`\r  ${i + 1}/${needTags.length} ${g.name.slice(0, 40).padEnd(40)}`);
    await sleep(STEAMSPY_DELAY_MS);
  }
  if (needTags.length) process.stdout.write("\n");

  await mkdir(dirname(LIBRARY_FILE), { recursive: true });
  await writeFile(LIBRARY_FILE, JSON.stringify(library, null, 2) + "\n");

  const hours = Object.fromEntries(library.filter((g) => g.hours > 0).map((g) => [g.appid, g.hours]));
  await writeFile(HOURS_FILE, JSON.stringify(hours, null, 2) + "\n");

  console.log(`Wrote data/steam-library.json and data/game-hours.json`);
  await images();
}

/* ── images ───────────────────────────────────────────────────────── */

async function steamHeaderUrl(appid) {
  try {
    const data = await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`);
    const url = data[appid]?.data?.header_image;
    if (url) return url;
  } catch {
    // fall through to the legacy CDN path (works for most older or delisted apps)
  }
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

async function images() {
  const curated = await loadCurated();
  await mkdir(IMAGE_DIR, { recursive: true });
  const missing = [];

  for (const game of curated) {
    const file = join(ROOT, "public", game.image);
    if (await exists(file)) continue;

    if (!game.steamAppId) {
      missing.push(game);
      continue;
    }
    try {
      const res = await fetch(await steamHeaderUrl(game.steamAppId));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(file), { recursive: true });
      await sharp(buf).resize(460, 215, { fit: "cover" }).webp({ quality: 80 }).toFile(file);
      console.log(`  downloaded ${game.image}`);
    } catch (e) {
      console.warn(`  could not download cover for ${game.name}: ${e.message}`);
      missing.push(game);
    }
  }

  if (missing.length) {
    console.log("\nStill missing a cover image (add a 460x215 image at these paths):");
    for (const g of missing) console.log(`  public${g.image}  (${g.name})`);
  } else {
    console.log("All covers present.");
  }
}

/* ── find ─────────────────────────────────────────────────────────── */

async function find(query) {
  if (!query) {
    console.error('Usage: npm run games:find -- "game name"');
    process.exit(1);
  }
  const q = query.toLowerCase();
  const library = await readJson(LIBRARY_FILE, []);
  const owned = library.filter((g) => g.name.toLowerCase().includes(q));

  console.log(`\nIn your Steam library (${owned.length}):`);
  for (const g of owned.slice(0, 10)) {
    console.log(`  ${g.name}  | steamAppId: ${g.appid} | ${g.hours} h | tags: ${g.tags.join(", ") || "-"}`);
  }

  const store = await getJson(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&cc=id&l=english`
  ).catch(() => ({ items: [] }));
  console.log(`\nOn the Steam store (${store.items?.length ?? 0}):`);
  for (const item of (store.items ?? []).slice(0, 5)) {
    const tags = await fetchTags(item.id);
    console.log(`  ${item.name}  | steamAppId: ${item.id} | tags: ${tags.join(", ") || "-"}`);
    await sleep(STEAMSPY_DELAY_MS);
  }
  console.log(`\nSuggested image path: /games/${slugify(query)}.webp`);
}

/* ── main ─────────────────────────────────────────────────────────── */

const [command, ...rest] = process.argv.slice(2);
if (command === "sync") await sync();
else if (command === "images") await images();
else if (command === "find") await find(rest.join(" "));
else {
  console.log("Commands: sync | images | find <name>");
  process.exit(1);
}
