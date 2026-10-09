"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">We hit a snag loading this page.</h1>
      <p className="mt-3 text-muted-foreground">Your data is safe. Try again, and if it keeps happening, come back in a minute.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Go home
        </Link>
      </div>
    </main>
  );
}
