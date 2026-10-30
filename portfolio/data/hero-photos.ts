/**
 * Hero photos, in the order they rotate.
 *
 * To change them:
 *   1. Put the full-resolution cutout (transparent PNG, roughly 5:6 portrait like the current
 *      1000×1200 ones) in assets/hero-photos/.
 *   2. List it here with alt text (what the photo shows, for screen readers).
 *   3. Run `npm run hero:photos`.
 *
 * The script bakes the black-and-white look into public/cutouts/ (no CSS filters: they made the
 * photo wipe stutter on iPhone) and names each file after its content, so browsers always fetch a
 * changed photo instead of reusing a cached old one. Nothing else needs editing: the hero and the
 * preloader read data/hero-photos.generated.json.
 */
export type HeroPhotoConfig = {
  /** File name in assets/hero-photos/ */
  file: string;
  alt: string;
};

export const heroPhotos: HeroPhotoConfig[] = [
  { file: "sunglasses.png", alt: "Audinta with sunglasses" },
  { file: "guitar.png", alt: "Audinta with guitar" },
  { file: "gamepad.png", alt: "Audinta with gamepad" },
  { file: "sunglasses2.png", alt: "Audinta posing with sunglasses" },
];
