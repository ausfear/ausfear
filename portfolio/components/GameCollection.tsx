"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { games, type Game } from "@/data/games";
import gameHours from "@/data/game-hours.json";

const hoursByAppId = gameHours as Record<string, number>;

const CARD_WIDTH = 230; // desktop card width in px (mobile is smaller, see className)
const CARD_GAP = 12;
const MARQUEE_SPEED = 45; // px per second
// Each half of a row must be wider than the widest screen so the loop never shows a gap
const MIN_ROW_WIDTH = 2200;

const TYPE_MS = 55;
const DELETE_MS = 28;
const GENRE_ROLL_MS = 450;
const HOLD_MS = 2600;
const REDUCED_HOLD_MS = 3500;

/* ═══════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════ */

function GameCard({ game, highlighted, decorative }: { game: Game; highlighted: boolean; decorative: boolean }) {
  const hours = game.steamAppId ? hoursByAppId[game.steamAppId] : undefined;

  return (
    <li
      data-game={decorative ? undefined : game.name}
      data-game-any={game.name}
      aria-hidden={decorative || undefined}
      className={`group/card relative shrink-0 w-[168px] md:w-[230px] aspect-[460/215] rounded-lg overflow-hidden bg-white/[0.04] transition-[transform,box-shadow] duration-500 ${
        // z-10 keeps the glow above neighbouring cards painted later in the row
        highlighted ? "z-10 scale-[1.04] shadow-[0_0_0_2px_var(--color-pop),0_0_20px_rgba(255,107,43,0.35)]" : ""
      }`}
    >
      <Image
        src={game.image}
        alt={decorative ? "" : game.name}
        width={460}
        height={215}
        unoptimized
        loading="lazy"
        className={`w-full h-full object-cover transition-[filter] duration-500 ${
          highlighted
            ? "grayscale-0 brightness-100"
            : "grayscale brightness-[0.6] group-hover/card:grayscale-0 group-hover/card:brightness-100"
        }`}
      />
      {/* Name + hours on hover */}
      <div className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
        <p className="text-[11px] md:text-xs font-medium text-white leading-tight truncate">{game.name}</p>
        {hours !== undefined && (
          <p className="text-[10px] text-white/70 tracking-wider">{hours.toLocaleString("en-US")} hrs played</p>
        )}
      </div>
    </li>
  );
}

function MarqueeRow({ rowGames, reverse, highlighted }: { rowGames: Game[]; reverse: boolean; highlighted: string | null }) {
  // Repeat the row until one half is wider than any screen, then double it for a seamless -50% loop
  const repeats = Math.max(1, Math.ceil(MIN_ROW_WIDTH / (rowGames.length * (CARD_WIDTH + CARD_GAP))));
  const half = Array.from({ length: repeats }, () => rowGames).flat();
  const items = [...half, ...half];
  const duration = (half.length * (CARD_WIDTH + CARD_GAP)) / MARQUEE_SPEED;

  return (
    <ul
      className={`game-marquee-track flex w-max gap-3 ${reverse ? "game-marquee-reverse" : ""}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {items.map((game, i) => (
        <GameCard
          key={`${game.name}-${i}`}
          game={game}
          highlighted={highlighted === game.name}
          // Only the first copy of each game is exposed to assistive tech
          decorative={i >= rowGames.length}
        />
      ))}
    </ul>
  );
}

/* ═══════════════════════════════════════════════════
   "I PLAY [GENRE], LIKE [GAME]." SENTENCE
   ═══════════════════════════════════════════════════ */

type Pick = { game: Game; genre: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomOf = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** Names of games whose cover is fully inside the screen's middle band right now. */
function visibleGames(marqueeRef: RefObject<HTMLDivElement | null>) {
  const visible = new Set<string>();
  marqueeRef.current?.querySelectorAll<HTMLElement>("[data-game-any]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.left > window.innerWidth * 0.08 && r.right < window.innerWidth * 0.92) {
      visible.add(el.dataset.gameAny!);
    }
  });
  return visible;
}

/** Prefer a game whose cover is on screen right now, so its highlight is actually visible. */
function pickNext(marqueeRef: RefObject<HTMLDivElement | null>, previous: Pick): Pick {
  const visible = visibleGames(marqueeRef);
  const candidates = games.filter((g) => g.name !== previous.game.name);
  const onScreen = candidates.filter((g) => visible.has(g.name));
  const game = randomOf(onScreen.length ? onScreen : candidates);
  // Avoid repeating the previous genre when the game offers another one
  const genres = game.genres.filter((g) => g !== previous.genre);
  return { game, genre: randomOf(genres.length ? genres : game.genres) };
}

function PlaySentence({
  marqueeRef,
  onHighlight,
}: {
  marqueeRef: RefObject<HTMLDivElement | null>;
  onHighlight: (name: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduceMotion = useReducedMotion();

  // Server render shows a complete sentence; the loop takes over once it's on screen
  const [current, setCurrent] = useState<Pick>({ game: games[0], genre: games[0].genres[0] });
  const [typed, setTyped] = useState(games[0].name);
  const currentRef = useRef(current);
  const typedRef = useRef(typed);

  const allGenres = useMemo(() => [...new Set(games.flatMap((g) => g.genres))], []);

  useEffect(() => {
    if (!inView) {
      onHighlight(null);
      return;
    }
    let cancelled = false;
    const setTypedBoth = (value: string) => {
      typedRef.current = value;
      setTyped(value);
    };

    (async () => {
      // The opening sentence comes from the server, not pickNext, so its cover may be off screen.
      // Only light it up (and linger) when it's visible; otherwise move on quickly.
      if (visibleGames(marqueeRef).has(currentRef.current.game.name)) {
        onHighlight(currentRef.current.game.name);
        await sleep(reduceMotion ? REDUCED_HOLD_MS : HOLD_MS);
      } else {
        await sleep(900);
      }

      while (!cancelled) {
        // Delete the current game name
        if (!reduceMotion) {
          for (let i = typedRef.current.length - 1; i >= 0 && !cancelled; i--) {
            setTypedBoth(typedRef.current.slice(0, i));
            await sleep(DELETE_MS);
          }
        }
        if (cancelled) break;

        // Roll to the next genre and light up the chosen cover
        const next = pickNext(marqueeRef, currentRef.current);
        currentRef.current = next;
        setCurrent(next);
        onHighlight(next.game.name);

        if (reduceMotion) {
          setTypedBoth(next.game.name);
        } else {
          await sleep(GENRE_ROLL_MS);
          for (let i = 1; i <= next.game.name.length && !cancelled; i++) {
            setTypedBoth(next.game.name.slice(0, i));
            await sleep(TYPE_MS);
          }
        }
        await sleep(reduceMotion ? REDUCED_HOLD_MS : HOLD_MS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, reduceMotion, marqueeRef, onHighlight]);

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-10">
      <p className="sr-only">
        I play {allGenres.join(", ")}.
      </p>
      {/* Connecting words in light Inter; the changing values carry the Syne display face.
          min-height reserves the longest case so the content below doesn't jump as names change. */}
      <p
        aria-hidden="true"
        className="font-light text-white/60 leading-[1.6] text-xl sm:text-2xl md:text-3xl lg:text-4xl min-h-[5.4em] sm:min-h-[3.6em] xl:min-h-[2em]"
      >
        I play{" "}
        {/* Keep the comma glued to the genre chip */}
        <span className="whitespace-nowrap">
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            // leading-[1.2] + baseline makes this flex chip match the plain-inline game chip's box exactly
            className="relative inline-flex overflow-hidden align-baseline leading-[1.2] rounded-lg px-2.5 md:px-3 py-0.5 bg-[var(--color-pop)]/10 border border-[var(--color-pop)]/30 font-[family-name:var(--font-syne)] font-semibold tracking-tight text-[var(--color-pop)]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.genre}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{ duration: GENRE_ROLL_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block whitespace-nowrap"
              >
                {current.genre}
              </motion.span>
            </AnimatePresence>
          </motion.span>
          ,
        </span>{" "}
        like{" "}
        {/* Plain inline (not inline-flex) so long names can wrap; box-decoration-clone repeats
            the chip's border and padding on every line it spans */}
        <span className="box-decoration-clone rounded-lg px-2.5 md:px-3 py-0.5 bg-white/[0.06] border border-white/10 font-[family-name:var(--font-syne)] font-semibold tracking-tight text-white">
          {typed || " "}
          <span className="game-caret inline-block ml-1 w-[2px] h-[0.95em] align-[-0.12em] bg-[var(--color-pop)]" />
        </span>
        .
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION BLOCK
   ═══════════════════════════════════════════════════ */

export default function GameCollection() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Alternate games between the two rows so both get a mix of genres
  const [topRow, bottomRow] = useMemo(
    () => [games.filter((_, i) => i % 2 === 0), games.filter((_, i) => i % 2 === 1)],
    []
  );

  return (
    // Visible gaps stay 40px / 56px: these values + the marquee's 20px vertical padding
    <div className="space-y-5 md:space-y-9">
      <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-end justify-between gap-4">
        <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50 font-semibold">
          Game Collection
        </span>
        <span className="hidden md:block text-[10px] md:text-xs tracking-wider text-white/50">
          Hover a cover for hours played
        </span>
      </div>

      {/* Full-bleed, two rows moving in opposite directions. The edge-fade mask clips to this box,
          so py-5 grows it to fit a highlighted card's scale + ring (the parent's gaps are reduced to match). */}
      <div ref={marqueeRef} role="group" aria-label="Game collection" className="game-marquee space-y-3 py-5">
        <MarqueeRow rowGames={topRow} reverse={false} highlighted={highlighted} />
        <MarqueeRow rowGames={bottomRow} reverse highlighted={highlighted} />
      </div>

      <PlaySentence marqueeRef={marqueeRef} onHighlight={setHighlighted} />
    </div>
  );
}
