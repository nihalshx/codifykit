"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Kitto } from "@/components/kitto/Kitto";
import styles from "./KittoButton.module.css";

/** Small Kitto bottom-right on every page except /talk. Opens the chat. */
export function KittoButton() {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  const [away, setAway] = useState(false);

  // step aside while the visitor scrolls down (so it never sits on top of what they're reading),
  // come back when they stop, and stay hidden over the footer, which has its own Kitto
  useEffect(() => {
    let last = window.scrollY;
    let timer = 0;
    let overFooter = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 4) setAway(true);
      last = y;
      clearTimeout(timer);
      timer = window.setTimeout(() => setAway(overFooter), 900);
    };
    const footer = document.querySelector("footer");
    const io = new IntersectionObserver(([e]) => {
      overFooter = e.isIntersecting;
      setAway(overFooter);
    });
    if (footer) io.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);
  // not on /talk (it is the chat), /contact (the form has its own buttons) or the 3D showcases
  if (["/talk", "/contact", "/work/web", "/work/apps"].some((p) => pathname.startsWith(p))) return null;
  return (
    <Link
      href="/talk/"
      className={styles.btn}
      data-away={away || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span className={styles.bubble}>Ask Kitto</span>
      <span className={styles.cat} aria-hidden="true">
        <Kitto mood={hover ? "happy" : "curious"} size={44} label="" />
      </span>
      <span className="sr-only">Chat with Kitto, our AI helper</span>
    </Link>
  );
}
