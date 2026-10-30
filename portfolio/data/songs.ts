/**
 * Songs in the "Ingredients of my music library" spiderweb.
 *
 * trackId is the number at the end of an Apple Music song link
 * (music.apple.com/id/song/cold/1473421589 → 1473421589).
 * After editing, run `npm run songs:sync` to fetch title, artist, cover and the 30-second preview
 * into data/songs.generated.json and public/songs/.
 *
 * On desktop the cards sit at fixed spots around the title, one per entry (spiderwebLayout in
 * components/Interests.tsx), so adding a sixth song also needs a sixth position there.
 */
export type Song = {
  trackId: number;
  genre: string;
};

export const songs: Song[] = [
  { trackId: 1652371778, genre: "EDM - Melodic Bass" },
  { trackId: 1482863953, genre: "Acoustic" },
  { trackId: 1726193449, genre: "Koplo - Dangdut" },
  { trackId: 1813815070, genre: "Anime" },
  { trackId: 1473421589, genre: "Alt Z" },
];
