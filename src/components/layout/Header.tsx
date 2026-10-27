"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAudience, type Audience } from "./Audience";
import { CONTACT } from "@/lib/content";
import styles from "./Header.module.css";

const NAV = [
  { href: "/work/", label: "Work" },
  { href: "/services/", label: "Services" },
  { href: "/students/", label: "Students" },
  { href: "/about/", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { audience, setAudience } = useAudience();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // mobile sheet: lock scroll, trap focus, Esc closes
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    const focusables = () =>
      Array.from(sheet?.querySelectorAll<HTMLElement>("a, button") ?? []);
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

  useEffect(() => setOpen(false), [pathname]);

  const choose = (a: Audience) => {
    setAudience(a);
    if (a !== "students") return;
    if (isHome) document.getElementById("students")?.scrollIntoView({ behavior: "smooth", block: "start" });
    else router.push("/students/");
  };

  const Switch = (
    <div className={styles.switch} role="group" aria-label="Who is this for?">
      <button type="button" aria-pressed={audience === "business"} onClick={() => choose("business")}>
        For businesses
      </button>
      <button type="button" aria-pressed={audience === "students"} onClick={() => choose("students")}>
        For students
      </button>
    </div>
  );

  return (
    <header className={styles.header} data-hidden={hidden && !open} data-home={isHome}>
      <div className={styles.row}>
        <Link href="/" className={styles.logo} aria-label="Codifykit home">
          <Logo height={26} />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={styles.right}>
          <div className={styles.desktopOnly}>{Switch}</div>
          <Link href={isHome ? "#ask" : "/talk/"} className="btn btn--sm">
            Talk to us
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

      {open && (
        <div id="mobile-menu" ref={sheetRef} className={styles.sheet} role="dialog" aria-modal="true" aria-label="Menu">
          <div className={styles.sheetTop}>
            <Logo height={24} />
            <button type="button" className={styles.close} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav className={styles.sheetNav} aria-label="Mobile">
            <Link href="/">Home</Link>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
            <Link href="/talk/">Talk to Kitto</Link>
          </nav>
          {Switch}
          <div className={styles.sheetContact}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp {CONTACT.phone}</a>
          </div>
        </div>
      )}
    </header>
  );
}
