/**
 * Games shown in the Gaming section: the two-row "Game Collection" marquee and the
 * "I play [genre], like [game]." sentence both read from this list.
 *
 * Editing:
 * - Remove a game: delete its line.
 * - Reorder: the marquee follows this order (games alternate between the two rows).
 * - Genres: written to read naturally in "I play ___, like ___." A game can have several.
 *   The sentence picks a genre, then a random game from that genre.
 * - Add a Steam game: `npm run games:find -- "name"` prints its steamAppId and tags.
 *   Add a line, then run `npm run games:images` to download the cover.
 * - Add a non-Steam game: leave out steamAppId and put a 460x215 image at public/<image>.
 * - Hours on hover come from data/game-hours.json (refreshed by `npm run games:sync`).
 *
 * The full Steam library (all owned games, hours, tags) is in data/steam-library.json.
 */
export type Game = {
  name: string;
  genres: string[];
  /** Path under public/, e.g. "/games/subnautica.webp" */
  image: string;
  steamAppId?: number;
};

export const games: Game[] = [
  { name: "Counter-Strike 2", genres: ["tactical shooters"], image: "/games/counter-strike-2.webp", steamAppId: 730 },
  { name: "Fishing Planet", genres: ["chill simulators"], image: "/games/fishing-planet.webp", steamAppId: 380600 },
  { name: "Metal Gear Solid V", genres: ["stealth games"], image: "/games/metal-gear-solid-v.webp", steamAppId: 287700 },
  { name: "Left 4 Dead 2", genres: ["zombie co-op"], image: "/games/left-4-dead-2.webp", steamAppId: 550 },
  { name: "Euro Truck Simulator 2", genres: ["chill simulators"], image: "/games/euro-truck-simulator-2.webp", steamAppId: 227300 },
  { name: "Death Stranding 2", genres: ["story-driven games"], image: "/games/death-stranding-2.webp", steamAppId: 3280350 },
  { name: "Surviving Mars", genres: ["management games"], image: "/games/surviving-mars.webp", steamAppId: 464920 },
  { name: "Umamusume: Pretty Derby", genres: ["gacha games", "gambling games"], image: "/games/umamusume-pretty-derby.webp", steamAppId: 3224770 },
  { name: "Forza Horizon 6", genres: ["racing games"], image: "/games/forza-horizon-6.webp", steamAppId: 2483190 },
  { name: "Just Cause 2", genres: ["open-world chaos"], image: "/games/just-cause-2.webp", steamAppId: 8190 },
  { name: "Geometry Dash", genres: ["rage games"], image: "/games/geometry-dash.webp", steamAppId: 322170 },
  { name: "Upload Labs", genres: ["management games"], image: "/games/upload-labs.webp", steamAppId: 3606890 },
  { name: "Hitman: World of Assassination", genres: ["stealth games"], image: "/games/hitman-world-of-assassination.webp", steamAppId: 1659040 },
  { name: "Brawlhalla", genres: ["fighting games"], image: "/games/brawlhalla.webp", steamAppId: 291550 },
  { name: "Watch_Dogs", genres: ["open-world chaos"], image: "/games/watch-dogs.webp", steamAppId: 243470 },
  { name: "The Crew 2", genres: ["racing games"], image: "/games/the-crew-2.webp", steamAppId: 646910 },
  { name: "Control Resonant", genres: ["story-driven games"], image: "/games/control-resonant.webp", steamAppId: 3669870 },
  { name: "Delta Force", genres: ["tactical shooters"], image: "/games/delta-force.webp", steamAppId: 2507950 },
  { name: "Where Winds Meet", genres: ["open-world RPGs"], image: "/games/where-winds-meet.webp", steamAppId: 3564740 },
  { name: "Rainbow Six Siege", genres: ["tactical shooters"], image: "/games/rainbow-six-siege.webp", steamAppId: 359550 },
  { name: "Skyrim", genres: ["open-world RPGs"], image: "/games/skyrim.webp", steamAppId: 489830 },
  { name: "Detroit: Become Human", genres: ["story-driven games"], image: "/games/detroit-become-human.webp", steamAppId: 1222140 },
  { name: "PUBG: Battlegrounds", genres: ["battle royales"], image: "/games/pubg-battlegrounds.webp", steamAppId: 578080 },
  { name: "The Forest", genres: ["survival games", "co-op horror"], image: "/games/the-forest.webp", steamAppId: 242760 },
  { name: "CloverPit", genres: ["gambling games"], image: "/games/cloverpit.webp", steamAppId: 3314790 },
  { name: "Arknights: Endfield", genres: ["gacha games"], image: "/games/arknights-endfield.webp", steamAppId: 4732690 },
  { name: "Dying Light", genres: ["zombie co-op"], image: "/games/dying-light.webp", steamAppId: 239140 },
  { name: "Phasmophobia", genres: ["co-op horror"], image: "/games/phasmophobia.webp", steamAppId: 739630 },
  { name: "Subnautica", genres: ["survival games"], image: "/games/subnautica.webp", steamAppId: 264710 },
  { name: "Starward", genres: ["fighting games"], image: "/games/starward.webp", steamAppId: 2764370 },
  { name: "Apex Legends", genres: ["battle royales"], image: "/games/apex-legends.webp", steamAppId: 1172470 },
];
