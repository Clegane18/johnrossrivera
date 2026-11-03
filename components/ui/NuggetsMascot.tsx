import { cn } from "@/lib/utils/cn";

export type MascotState = "idle" | "happy" | "thinking" | "rest";

/**
 * Nuggets: a blue window-pane block with eyes, arms and feet. Drawn as SVG so it stays sharp from
 * the 24px message avatar to the launcher, and animated in CSS (globals.css, `.nug-*`):
 * - idle: a slow bob, a blink, and a wave now and then
 * - happy: a hop with both arms up and closed ^^ eyes (on click)
 * - thinking: a sway, eyes glancing side to side and a bobbing "?" (while an answer is generating)
 * - rest: the idle pose, standing still (older chat messages, so the history is not all moving)
 * Reduced motion keeps every pose but drops the movement.
 */
export function NuggetsMascot({
  state = "idle",
  size = 36,
  className,
}: {
  state?: MascotState;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("nug overflow-visible", `nug-${state}`, className)}
    >
      <ellipse cx="50" cy="95" rx="28" ry="3.5" className="nug-shadow" fill="currentColor" opacity="0.14" />

      <g className="nug-body">
        {/* Feet */}
        <ellipse cx="37" cy="88" rx="9" ry="6" fill="#fff" stroke="#1B2A7A" strokeWidth="2" />
        <ellipse cx="63" cy="88" rx="9" ry="6" fill="#fff" stroke="#1B2A7A" strokeWidth="2" />

        {/* Arms sit behind the body, so only the hands show at its edges. */}
        <g className="nug-arm nug-arm-l">
          <ellipse cx="14" cy="50" rx="7" ry="10" fill="#fff" stroke="#1B2A7A" strokeWidth="2" transform="rotate(-20 14 50)" />
        </g>
        <g className="nug-arm nug-arm-r">
          <ellipse cx="86" cy="52" rx="7" ry="10" fill="#fff" stroke="#1B2A7A" strokeWidth="2" transform="rotate(20 86 52)" />
        </g>

        <rect x="16" y="14" width="68" height="68" rx="17" fill="#2E45B8" stroke="#1B2A7A" strokeWidth="2.5" />
        {/* A soft top light, so the block reads as a solid object rather than a flat square. */}
        <rect x="21" y="18" width="58" height="22" rx="11" fill="#fff" opacity="0.08" />

        {/* The three panes of the mark */}
        <rect x="29" y="27" width="19" height="42" rx="3.5" fill="#F7F8FC" />
        <rect x="52" y="27" width="19" height="20" rx="3.5" fill="#F7F8FC" />
        <rect x="52" y="50" width="19" height="19" rx="3.5" fill="#F7F8FC" />

        {/* Eyes: open ovals, swapped for ^^ arcs when happy */}
        <g className="nug-eyes">
          <g className="nug-eyes-open">
            <ellipse cx="38.5" cy="41" rx="3" ry="4.6" fill="#1E2F8F" />
            <ellipse cx="61.5" cy="37" rx="3" ry="4.6" fill="#1E2F8F" />
          </g>
          <g className="nug-eyes-closed" fill="none" stroke="#1E2F8F" strokeWidth="3" strokeLinecap="round">
            <path d="M34 42 Q38.5 36 43 42" />
            <path d="M57 38 Q61.5 32 66 38" />
          </g>
        </g>
      </g>

      {/* Happy: the little burst lines from the reference */}
      <g className="nug-burst" stroke="#2E45B8" strokeWidth="3.5" strokeLinecap="round">
        <path d="M9 14 L14 20" />
        <path d="M3 25 L10 27" />
        <path d="M19 6 L20 13" />
      </g>

      {/* Thinking: a question mark over the shoulder */}
      <text className="nug-q" x="86" y="16" textAnchor="middle" fontSize="24" fontWeight="800" fill="#2E45B8" fontFamily="system-ui, sans-serif">
        ?
      </text>
    </svg>
  );
}
