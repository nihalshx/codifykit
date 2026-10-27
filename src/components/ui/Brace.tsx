/** Wraps a word in violet braces, the {accent} used in the section headings. */
export function Brace({ children }: { children: React.ReactNode }) {
  return (
    <span className="brace">
      <span aria-hidden="true">{"{"}</span>
      {children}
      <span aria-hidden="true">{"}"}</span>
    </span>
  );
}
