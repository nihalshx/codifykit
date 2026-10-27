"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Kitto } from "@/components/kitto/Kitto";
import styles from "./KittoButton.module.css";

/** Small Kitto bottom-right on every page except /talk. Opens the chat. */
export function KittoButton() {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  // not on /talk (it is the chat), /contact (the form has its own buttons) or the 3D showcases
  if (["/talk", "/contact", "/work/web", "/work/apps"].some((p) => pathname.startsWith(p))) return null;
  return (
    <Link
      href="/talk/"
      className={styles.btn}
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
