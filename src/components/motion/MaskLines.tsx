import type { ReactNode } from "react";

/**
 * Authored lines, each inside its own clipping mask, ready for a scrubbed reveal.
 * Lines are explicit (not measured), so a resize never re-splits a running timeline.
 */
export function MaskLines({
  lines,
  as: Tag = "span",
  className,
  lineClassName,
}: {
  lines: readonly ReactNode[];
  as?: "span" | "div" | "p";
  className?: string;
  lineClassName?: string;
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`mask ${lineClassName ?? ""}`}>
          <span data-line>{line}</span>
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
