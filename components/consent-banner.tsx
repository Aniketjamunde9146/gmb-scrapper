"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "./ui/button";
import { getConsent, setConsent, type Consent } from "../lib/consent";

/** Cookie / data consent. Appears once, after the page is idle so it never competes with first paint. */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (getConsent()) return;
    const t = window.setTimeout(() => setShow(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  function choose(value: Consent) {
    setConsent(value);
    setShow(false);
  }

  if (!show) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border bg-card p-4 shadow-xl sm:inset-x-auto sm:bottom-5 sm:left-5 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Cookie className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="consent-title" className="text-sm font-semibold">
            Your privacy choices
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            We use essential cookies to keep you logged in and remember your theme. Optional cookies, if we add them later, stay off unless you accept. Read our{" "}
            <Link href="/privacy" className="font-medium text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("all")}>
              Accept all
            </Button>
            <Button size="sm" variant="outline" onClick={() => choose("essential")}>
              Essential only
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
