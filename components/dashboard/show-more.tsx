"use client";

import { useState } from "react";
import { Button } from "../ui/button";

/** Renders a long list in pages of 20 so phones never have to paint hundreds of cards at once. */
export function usePaged<T>(items: T[], pageSize = 20) {
  const [pages, setPages] = useState(1);
  const shown = items.slice(0, pages * pageSize);
  return { shown, hasMore: shown.length < items.length, remaining: items.length - shown.length, more: () => setPages((p) => p + 1) };
}

export function ShowMore({ remaining, onClick }: { remaining: number; onClick: () => void }) {
  return (
    <div className="flex justify-center pt-2">
      <Button variant="outline" onClick={onClick}>
        Show {Math.min(20, remaining)} more <span className="text-muted-foreground">({remaining} left)</span>
      </Button>
    </div>
  );
}
