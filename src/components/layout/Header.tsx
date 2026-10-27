"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/ui/Logo";
import { CONTACT, SERVICES, serviceHref } from "@/lib/content";
import styles from "./Header.module.css";

type Item = { href: string; label: string; note?: string };
type Group = { key: string; label: string; href: string; items: Item[] };

// The site map in one place: the header, its dropdowns and the phone menu all read from it.
const WORK: Group = {
  key: "work",
  label: "Work",
  href: "/work/",
  items: [
    { href: "/work/", label: "All work", note: "Every app, website and campaign" },
    { href: "/work/web/", label: "Websites in 3D", note: "Our sites on floating laptops" },
    { href: "/work/apps/", label: "Apps in 3D", note: "Our apps on floating phones" },
    { href: "/work/posters/", label: "Posters & creatives", note: "Flip through the deck" },
    { href: "/work/videos/", label: "Reels & AI videos", note: "The video wheel" },
  ],
};
const SERVICE_GROUP: Group = {
  key: "services",
  label: "Services",
  href: "/services/",
  items: [
    ...SERVICES.map((s) => ({ href: serviceHref(s), label: s.name, note: s.short })),
    { href: "/services/", label: "All services", note: "One team, the whole job" },
  ],
};
const GROUPS = [WORK, SERVICE_GROUP];
const LINKS: Item[] = [
  { href: "/students/", label: "Students" },
  { href: "/about/", label: "About" },
];

const isIn = (pathname: string, href: string) => pathname === href || pathname.startsWith(href);

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false); // phone menu
  const [drop, setDrop] = useState<string | null>(null); // desktop dropdown
  const [mounted, setMounted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const hoverAt = useRef(0); // when a hover opened a dropdown, so the click that follows does not close it

  useEffect(() => setMounted(true), []);

  // hide on scroll down, show on scroll up (never while a dropdown is open)
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 160);
      if (Math.abs(y - last) > 4) setDrop(null);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // dropdowns: Escape or a click outside closes them
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrop(null);
    const onDown = (e: PointerEvent) => !navRef.current?.contains(e.target as Node) && setDrop(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [drop]);

  // phone menu: lock scroll, trap focus, Esc closes
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    const focusables = () => Array.from(sheet?.querySelectorAll<HTMLElement>("a, button") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setDrop(null);
  }, [pathname]);

  const sheet = (
    <div id="mobile-menu" ref={sheetRef} className={styles.sheet} role="dialog" aria-modal="true" aria-label="Menu">
      <div className={styles.sheetTop}>
        <Link href="/" aria-label="Codifykit home"><Logo height={24} /></Link>
        <button type="button" className={styles.close} onClick={() => setOpen(false)}>Close</button>
      </div>
      <nav className={styles.sheetNav} aria-label="Mobile">
        <Link href="/" aria-current={isHome ? "page" : undefined}>Home</Link>
        {GROUPS.map((g) => (
          <details key={g.key} className={styles.sheetGroup} open={isIn(pathname, g.href)}>
            <summary>{g.label}</summary>
            <ul>
              {g.items.map((i) => (
                <li key={i.href + i.label}>
                  <Link href={i.href} aria-current={pathname === i.href ? "page" : undefined}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isIn(pathname, l.href) ? "page" : undefined}>{l.label}</Link>
        ))}
        <Link href="/talk/">Talk to Kitto</Link>
      </nav>
      <Link href="/contact/" className="btn btn--violet">Start a project</Link>
      <div className={styles.sheetContact}>
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp {CONTACT.phone}</a>
      </div>
    </div>
  );

  return (
    <header className={styles.header} data-hidden={hidden && !open && !drop} data-home={isHome}>
      <div className={styles.row}>
        <Link href="/" className={styles.logo} aria-label="Codifykit home">
          <Logo height={26} />
        </Link>
        <nav ref={navRef} className={styles.nav} aria-label="Main">
          {GROUPS.map((g) => (
            <div
              key={g.key}
              className={styles.group}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                hoverAt.current = performance.now();
                setDrop(g.key);
              }}
              onPointerLeave={(e) => e.pointerType === "mouse" && setDrop((d) => (d === g.key ? null : d))}
            >
              <button
                type="button"
                className={styles.top}
                aria-expanded={drop === g.key}
                aria-controls={`drop-${g.key}`}
                aria-current={isIn(pathname, g.href) ? "page" : undefined}
                onClick={() => setDrop((d) => (d === g.key && performance.now() - hoverAt.current > 400 ? null : g.key))}
              >
                {g.label}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
              <div id={`drop-${g.key}`} className={styles.drop} data-open={drop === g.key || undefined} data-wide={g.items.length > 6 || undefined}>
                <ul>
                  {g.items.map((i) => (
                    <li key={i.href + i.label}>
                      <Link href={i.href} aria-current={pathname === i.href ? "page" : undefined} tabIndex={drop === g.key ? 0 : -1}>
                        <strong>{i.label}</strong>
                        {i.note && <span>{i.note}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.top} aria-current={isIn(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={styles.right}>
          <Link href="/talk/" className={styles.kitto}>Talk to Kitto</Link>
          <Link href="/contact/" className={`btn btn--sm btn--violet ${styles.cta}`}>
            Start a project
          </Link>
          <button
            ref={menuBtnRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* the phone menu goes to <body>: inside the header, its blur and transform would trap a fixed sheet */}
      {open && mounted && createPortal(sheet, document.body)}
    </header>
  );
}
