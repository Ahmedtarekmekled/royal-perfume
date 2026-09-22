import { cn } from "@/lib/utils";

/**
 * Background-only extract of Aceternity's "Grid Background" — the demo's own
 * bg-white/dark:bg-black + big "Backgrounds" heading are dropped since this
 * fills the Hero's existing `bg-black` section rather than standing alone.
 * Colors are hardcoded for a dark backdrop (no `dark:` variant) since the
 * Hero is always black regardless of site theme.
 */
export function GridBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]",
        )}
      />
      {/* Vignette: solid black at the edges, fading to reveal the grid in the center */}
      <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </div>
  );
}
