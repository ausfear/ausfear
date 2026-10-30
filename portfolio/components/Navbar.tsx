"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useIntroReady } from "./Providers";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useTheme } from "@/hooks/useTheme";
import { setTheme } from "@/lib/theme";

const navItems = [
  { label: "About", href: "#about", id: "about" },
  { label: "Interests", href: "#interests", id: "interests" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const introReady = useIntroReady();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const scrollBehavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  // Scroll detection & accurate section spy
  useEffect(() => {
    const handleScroll = () => {

      const vh = window.innerHeight;
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;

      // If at or very close to bottom, contact section is active
      if (scrollBottom >= docHeight - 80) {
        setActiveSection("contact");
        return;
      }

      const contactEl = document.getElementById("contact");
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        if (rect.top <= vh * 0.45) {
          setActiveSection("contact");
          return;
        }
      }

      const interestsEl = document.getElementById("interests");
      if (interestsEl) {
        const rect = interestsEl.getBoundingClientRect();
        if (rect.top <= vh * 0.35) {
          setActiveSection("interests");
          return;
        }
      }

      const aboutEl = document.getElementById("about");
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        // Only set to about if its top has entered the upper 35% of the viewport
        if (rect.top <= vh * 0.35) {
          setActiveSection("about");
          return;
        }
      }

      // Default: If above About, we are in Hero section
      setActiveSection("hero");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Lock page scroll while the mobile menu is open
  useScrollLock(mobileOpen);

  // Close the mobile menu with Escape and return focus to the toggle
  useEffect(() => {
    if (!mobileOpen) return;
    firstMenuLinkRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  const scrollToHero = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior });
    setActiveSection("hero");
    setMobileOpen(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: scrollBehavior });
    }
  };

  const isHero = activeSection === "hero";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={introReady ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className={`relative px-2 py-1.5 md:px-2.5 md:py-1.5 flex items-center gap-0.5 md:gap-1 rounded-full border transition-all duration-500 ${
            isHero
              ? "bg-transparent border-transparent shadow-none"
              : "nav-pill nav-pill-scrolled"
          }`}
        >
          {/* Logo Button (Replaces "Home" - No active indicator) */}
          <a
            href="#hero"
            onClick={scrollToHero}
            aria-label="Home"
            className="relative flex items-center justify-center p-1.5 md:px-2.5 md:py-1.5 rounded-full hover:bg-[var(--color-hover)] transition-colors z-10 mr-0.5 group"
          >
            <Image
              src="/icon.png"
              alt="ausfear logo"
              width={20}
              height={20}
              className="w-5 h-5 object-contain group-hover:scale-110 transition-transform duration-200"
              priority
            />
          </a>

          {/* Desktop Links (About, Interests, Contact) */}
          <div className="hidden md:flex items-center gap-0.5 relative">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative px-4 py-2 text-xs font-medium transition-colors duration-300 tracking-widest uppercase rounded-full z-10 ${
                    isActive
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {/* Animated pill indicator - only applied to these 3 buttons */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-active)]"
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Theme Toggle. Icons swap via CSS so the first paint is already correct */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark", { animate: true, persist: true })}
            className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Moon size={16} className="dark:hidden" />
            <Sun size={16} className="hidden dark:block" />
          </button>

          {/* Mobile Toggle */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-[var(--color-hover)] transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8"
          >
            {/* Logo in mobile menu */}
            <motion.a
              ref={firstMenuLinkRef}
              href="#hero"
              onClick={scrollToHero}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="p-2 mb-2 rounded-full hover:bg-[var(--color-hover)] transition-colors"
              aria-label="Home"
            >
              <Image
                src="/icon.png"
                alt="ausfear logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </motion.a>

            {navItems.map((item, i) => {
              const isActive = activeSection === item.id;
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.id)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  className={`font-[family-name:var(--font-syne)] text-3xl font-bold uppercase tracking-tight transition-colors ${
                    isActive
                      ? "text-[var(--color-pop)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {item.label}
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
