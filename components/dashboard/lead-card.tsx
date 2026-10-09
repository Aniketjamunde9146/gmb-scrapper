import { Bookmark, BookmarkCheck, Check, Globe, Mail, MapPin, MessageCircle, MessageSquareText, Phone, Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import { scoreLead, waNumber, TIER_LABEL } from "../../lib/score";
import type { Lead } from "../../lib/types";

const pill = "inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card/60 px-3 text-[13px] font-medium transition-colors hover:bg-accent";

/** Circular score badge. The ring fills in proportion to the opportunity score. */
export function ScoreRing({ lead, className }: { lead: Lead; className?: string }) {
  const s = scoreLead(lead);
  const r = 17, c = 2 * Math.PI * r;
  const color = s.tier === "hot" ? "#ff8c00" : s.tier === "warm" ? "#fbbf24" : "rgb(148 148 148)";
  return (
    <div className={cn("relative grid size-11 shrink-0 place-items-center", className)} title={`${TIER_LABEL[s.tier]} lead, score ${s.value}. ${s.reasons.join(". ")}`} role="img" aria-label={`${TIER_LABEL[s.tier]} lead, score ${s.value} out of 100`}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(s.value / 100) * c} ${c}`} />
      </svg>
      <span className="text-[13px] font-semibold tabular-nums">{s.value}</span>
    </div>
  );
}

export function LeadCard({
  lead, saved, onToggleSave, onMessage, selected, onSelect, footer, contacted,
}: {
  lead: Lead;
  saved?: boolean;
  onToggleSave?: () => void;
  onMessage?: () => void;
  selected?: boolean;
  onSelect?: (v: boolean) => void;
  footer?: React.ReactNode;
  contacted?: boolean;
}) {
  const score = scoreLead(lead);
  return (
    <Card hot={selected} className={cn("flex h-full flex-col gap-3.5 p-4 sm:p-5", selected && "border-primary/60")}>
      <div className="flex items-start gap-3">
        {onSelect && (
          <input type="checkbox" checked={!!selected} onChange={(e) => onSelect(e.target.checked)} aria-label={`Select ${lead.name}`} className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--primary)]" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug">{lead.name}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {lead.category && <Badge>{lead.category}</Badge>}
            {!lead.website && <Badge variant="hot">No website</Badge>}
            {lead.rating != null && lead.rating < 3.5 && <Badge variant="danger">Low rating</Badge>}
            {lead.rating != null && (
              <Badge variant="outline">
                <Star className="size-3 fill-primary text-primary" aria-hidden /> {lead.rating.toFixed(1)}
                {lead.ratingCount != null && <span className="text-muted-foreground">({lead.ratingCount})</span>}
              </Badge>
            )}
            {contacted && <Badge variant="success"><Check className="size-3" aria-hidden /> Contacted</Badge>}
          </div>
        </div>
        <ScoreRing lead={lead} />
        {onToggleSave && (
          <Button variant={saved ? "secondary" : "outline"} size="icon" className="size-9 shrink-0" onClick={onToggleSave} aria-pressed={saved} aria-label={saved ? "Remove from saved leads" : "Save lead"}>
            {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
          </Button>
        )}
      </div>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="min-w-0 break-words">{lead.address ?? "Address not listed"}</span>
      </p>

      <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground"><span className="font-medium text-foreground">Best angle:</span> {score.pitch}</p>

      <div className="mt-auto flex flex-wrap gap-2">
        {lead.phone && (
          <>
            <a href={`tel:${lead.phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-[13px] font-semibold text-primary hover:bg-primary/20">
              <Phone className="size-3.5" aria-hidden /> {lead.phone}
            </a>
            <a href={`https://wa.me/${waNumber(lead.phone)}`} target="_blank" rel="noopener noreferrer" className={pill}>
              <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
            </a>
          </>
        )}
        {onMessage && (
          <button type="button" onClick={onMessage} className={cn(pill, "border-primary/40 text-primary hover:bg-primary/10")}>
            <MessageSquareText className="size-3.5" aria-hidden /> Write message
          </button>
        )}
        {lead.email && <a href={`mailto:${lead.email}`} className={pill}><Mail className="size-3.5" aria-hidden /> Email</a>}
        {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className={pill}><Globe className="size-3.5" aria-hidden /> Website</a>}
        <a href={lead.mapUrl} target="_blank" rel="noopener noreferrer" className={pill}><MapPin className="size-3.5" aria-hidden /> {lead.source === "google" ? "Google Maps" : "Map"}</a>
      </div>
      {footer}
    </Card>
  );
}
