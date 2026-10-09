"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Press and hold to confirm a destructive action. A ring fills while held; releasing early cancels.
 * Works with mouse, touch, and keyboard (hold Space or Enter). Screen readers get a plain label.
 */
export function HoldToDelete({
  onConfirm,
  label = "Hold to delete",
  holdMs = 1100,
  size = "sm",
  className,
  ariaLabel,
}: {
  onConfirm: () => void | Promise<void>;
  label?: string;
  holdMs?: number;
  size?: "sm" | "md" | "icon";
  className?: string;
  ariaLabel?: string;
}) {
  const [p, setP] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const raf = React.useRef(0);
  const start = React.useRef(0);
  const holding = React.useRef(false);

  const stop = React.useCallback(() => {
    holding.current = false;
    cancelAnimationFrame(raf.current);
    setP(0);
  }, []);

  const tick = React.useCallback(
    (now: number) => {
      if (!holding.current) return;
      const v = Math.min(1, (now - start.current) / holdMs);
      setP(v);
      if (v >= 1) {
        holding.current = false;
        setDone(true);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(30);
        Promise.resolve(onConfirm()).finally(() => {
          setDone(false);
          setP(0);
        });
        return;
      }
      raf.current = requestAnimationFrame(tick);
    },
    [holdMs, onConfirm],
  );

  const begin = () => {
    if (holding.current || done) return;
    holding.current = true;
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const R = 9;
  const C = 2 * Math.PI * R;
  const pad = size === "icon" ? "size-9" : size === "md" ? "h-11 px-4 text-sm" : "h-8 px-3 text-[13px]";

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      disabled={done}
      onPointerDown={(e) => { if (e.pointerType === "mouse" && e.button !== 0) return; begin(); }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") stop(); }}
      onBlur={stop}
      className={cn(
        "relative inline-flex shrink-0 touch-none select-none items-center justify-center gap-2 overflow-hidden rounded-full border border-destructive/30 font-semibold text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/50 disabled:opacity-60",
        p > 0 && "hold-active bg-destructive/10",
        pad,
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 bg-destructive/20" style={{ width: `${p * 100}%` }} />
      <span className="relative flex items-center gap-2">
        {size === "icon" ? (
          <Trash2 className="size-4" aria-hidden />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="size-4 -rotate-90" aria-hidden>
              <circle cx="12" cy="12" r={R} fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
              <circle cx="12" cy="12" r={R} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
            </svg>
            {done ? "Deleting…" : p > 0 ? "Keep holding…" : label}
          </>
        )}
      </span>
    </button>
  );
}
