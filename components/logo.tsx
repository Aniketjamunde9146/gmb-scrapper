import Link from "next/link";
import { MapPin } from "lucide-react";
import { site } from "../lib/site";

/** Same mark as the landing header: saffron tile with a black map pin. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={`flex items-center gap-2 font-semibold tracking-tight ${className ?? ""}`}>
      <span className="grid size-7 place-items-center rounded-md bg-gradient-to-b from-orange-400 to-orange-600 text-black shadow-[0_0_18px_-4px_rgba(255,140,0,.7)]">
        <MapPin className="size-4" strokeWidth={2.4} aria-hidden />
      </span>
      <span className="text-[17px]">{site.name}</span>
    </Link>
  );
}
