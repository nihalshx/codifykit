"use client";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/** Standard reveal: fades and slides up once, when 20% of the element is in view. */
export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-in={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
