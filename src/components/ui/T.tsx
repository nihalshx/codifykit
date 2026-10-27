import { isPlaceholder } from "@/lib/content";

/** Renders a content string; placeholder values get a dashed outline so they're easy to spot. */
export function T({ children }: { children: string | null | undefined }) {
  if (children == null) return null;
  if (isPlaceholder(children)) return <em className="ph" title="Replace in /content">{children}</em>;
  return <>{children}</>;
}
