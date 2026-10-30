/**
 * Playlists in the music carousel (center card = active).
 *
 * id and slug come from the public playlist link:
 *   music.apple.com/id/playlist/<slug>/<id>
 * The playlist must be public. After editing, run `npm run playlists:sync`.
 *
 * Each card shows `limit` songs (default 8): the first ones in the playlist that have a preview,
 * or exactly `trackIds` (song IDs, in that order) to hand-pick them. "Open full playlist" links to the rest.
 */
export type PlaylistConfig = {
  id: string;
  slug: string;
  /** Short label on the pill under the card */
  label: string;
  limit?: number;
  trackIds?: number[];
};

export const playlists: PlaylistConfig[] = [
  { id: "pl.u-kv9l2aaIJ36ybe0", slug: "acoustic", label: "acoustic" },
  { id: "pl.u-KVXBkXVCLedbN9B", slug: "2024-recap-ytmusic", label: "2024 recap | edm" },
  { id: "pl.u-KVXBkPLtLedbN9B", slug: "jowo", label: "jowo" },
];
