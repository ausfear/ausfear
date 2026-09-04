"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/ausfear/", icon: InstagramIcon },
  {
    label: "X",
    href: "https://x.com/ausfear",
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/audinta-sakti/", icon: LinkedinIcon },
  { label: "GitHub", href: "https://github.com/ausfear", icon: GithubIcon },
  {
    label: "Steam",
    href: "https://steamcommunity.com/id/ausfear/",
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12.021-5.373 12.021-12S18.606 0 11.979 0z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com/users/421225666307162122",
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const MARQUEE_REPEATS = 8;

export default function Footer() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* ── Kinetic Typography Marquee ── */}
      <div className="py-8 md:py-16 overflow-hidden">
        <div className="marquee-track">
          {[...Array(MARQUEE_REPEATS)].map((_, i) => (
            <span key={i} className="marquee-word text-[18vw] md:text-[12vw] lg:text-[10vw] px-[3vw]">
              ausfear
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="w-full h-[1px] bg-[var(--color-border)]" />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-28">
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 50 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 md:space-y-8"
        >
          <h2 className="font-[family-name:var(--font-syne)] text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]">
            Let&apos;s
            <br />
            Talk<span className="text-[var(--color-pop)]">.</span>
          </h2>

          <p className="text-[var(--color-text-muted)] text-sm md:text-base lg:text-lg max-w-lg">
            Got something cool to talk about? Want to play a game? 
            Or just want to say hi? I&apos;m always down.
          </p>

          <div className="pt-1 md:pt-2">
            <a
              href="mailto:audintasf@gmail.com"
              className="cta-underline group inline-flex items-center gap-2 md:gap-3 text-base md:text-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
            >
              <Mail size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              audintasf@gmail.com
              <ArrowUpRight
                size={14}
                className="opacity-0 group-hover:opacity-60 transition-all duration-300 -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0"
              />
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 md:gap-3 pt-2 md:pt-4"
          >
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-pop)] hover:border-[var(--color-pop)] transition-all duration-300"
                >
                  <Icon />
                  <span className="text-[10px] md:text-xs tracking-wider uppercase font-medium">
                    {social.label}
                  </span>
                </a>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 md:pt-8 border-t border-[var(--color-border)]">
          <p className="text-[10px] md:text-xs text-[var(--color-text-faint)] tracking-wider">
            © {new Date().getFullYear()} Audinta Sakti Firmansyah
          </p>
          <p className="text-[10px] md:text-xs text-[var(--color-text-faint)] tracking-wider">
            Just vibing on the internet
          </p>
        </div>
      </div>
    </footer>
  );
}
