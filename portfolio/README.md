# ausfear

Personal site of Audinta Sakti Firmansyah (ausfear): a single-page Next.js app with a preloader, a parallax hero, and sections for music, gaming, and math.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (design tokens live in `app/globals.css`)
- framer-motion for all animation
- Vercel Web Analytics

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Structure

| Path | What's there |
| --- | --- |
| `app/layout.tsx` | Fonts, metadata, `<Providers>` wrapper |
| `app/opengraph-image.tsx`, `robots.ts`, `sitemap.ts` | Social preview card and SEO routes |
| `components/Providers.tsx` | Intro-ready context and `MotionConfig` (respects reduced motion) |
| `components/LoadingScreen.tsx` + `hooks/useAssetPreloader.ts` | Preloader that waits for the hero images and fonts |
| `components/Hero.tsx` | Hero with rotating photos and mouse parallax |
| `components/Interests.tsx` | Music (Apple Music embeds), Gaming (Steam widget), and Math |
| `components/GameCollection.tsx` | Gaming section: two-row cover marquee and the "I play [genre], like [game]." sentence |
| `data/games.ts` | The games shown in the Gaming section (edit this by hand) |
| `data/steam-library.json`, `data/game-hours.json` | Generated from Steam by `npm run games:sync` |
| `scripts/games.mjs` | `games:sync` / `games:images` / `games:find` helpers (`STEAM_API_KEY` in `.env.local`) |
| `public/cutouts/*.webp` | Hero photos. The full-resolution PNG originals are in `../cutout/` |
| `public/games/*.webp` | Game covers (460×215) |

## Notes

- The production URL is set in `lib/site.ts` and is used by the metadata, robots, and sitemap.
- To change a hero photo, export it as WebP into `public/cutouts/` and update the list in both `Hero.tsx` and `useAssetPreloader.ts`.
- Editing the game list (adding Steam and non-Steam games, refreshing hours) is documented at the top of `data/games.ts` and in `NOTES.md`, section 4.
