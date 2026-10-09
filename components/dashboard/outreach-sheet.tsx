"use client";

import * as React from "react";
import { Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { cn } from "../../lib/utils";
import { scoreLead, waNumber } from "../../lib/score";
import { CHANNEL_LABEL, DEFAULT_TEMPLATES, fill, loadOverrides, resolve, type Channel } from "../../lib/templates";
import type { Lead } from "../../lib/types";
import { useUser } from "./user-context";

const CHANNELS: { id: Channel; icon: typeof Mail }[] = [
  { id: "whatsapp", icon: MessageCircle },
  { id: "email", icon: Mail },
  { id: "call", icon: Phone },
];

/**
 * Write the first message in one step: the best template for this lead is picked from its score,
 * filled with the business details, and opens straight into WhatsApp or your mail app.
 */
export function OutreachSheet({ lead, city, open, onOpenChange, onSent }: { lead: Lead | null; city?: string; open: boolean; onOpenChange: (v: boolean) => void; onSent?: (lead: Lead) => void }) {
  const user = useUser();
  const [channel, setChannel] = React.useState<Channel>("whatsapp");
  const [text, setText] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const score = React.useMemo(() => (lead ? scoreLead(lead) : null), [lead]);
  const firstName = user.name.split(" ")[0] || "me";

  // Pick the right channel and fill the template whenever a new lead opens.
  React.useEffect(() => {
    if (!lead || !open) return;
    setChannel(lead.phone ? "whatsapp" : lead.email ? "email" : "call");
  }, [lead, open]);

  React.useEffect(() => {
    if (!lead || !score) return;
    const o = loadOverrides();
    const base = DEFAULT_TEMPLATES.find((t) => t.channel === channel && t.angle === score.angle) ?? DEFAULT_TEMPLATES.find((t) => t.channel === channel)!;
    const t = resolve(base, o);
    const vars = { business: lead.name, category: lead.category || "local", city: city || "", sender: user.name || firstName, rating: lead.rating?.toFixed(1) };
    setText(fill(t.body, vars));
    setSubject(fill(t.subject ?? "", vars));
    setCopied(false);
  }, [lead, score, channel, city, user.name, firstName]);

  if (!lead || !score) return null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(channel === "email" ? `Subject: ${subject}\n\n${text}` : text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const openWhatsApp = () => { window.open(`https://wa.me/${waNumber(lead.phone!)}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer"); onSent?.(lead); };
  const openMail = () => { window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`; onSent?.(lead); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Message {lead.name}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2"><Badge variant={score.tier}>{score.value} · {score.pitch}</Badge></SheetDescription>
        </SheetHeader>

        <div role="tablist" aria-label="Channel" className="grid grid-cols-3 rounded-lg border bg-muted/60 p-1 text-sm">
          {CHANNELS.map(({ id, icon: Icon }) => (
            <button key={id} role="tab" type="button" aria-selected={channel === id} onClick={() => setChannel(id)} className={cn("flex h-9 items-center justify-center gap-1.5 rounded-md transition", channel === id ? "bg-foreground font-medium text-background" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="size-4" aria-hidden /> {CHANNEL_LABEL[id]}
            </button>
          ))}
        </div>

        {channel === "email" && (
          <label className="block text-sm"><span className="mb-1.5 block text-muted-foreground">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full rounded-xl border bg-card px-3.5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20" />
          </label>
        )}
        <label className="block text-sm"><span className="mb-1.5 block text-muted-foreground">{channel === "call" ? "Call script" : "Message"}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={channel === "call" ? 12 : 9} className="w-full resize-y rounded-xl border bg-card px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-ring/20" />
        </label>

        <div className="mt-auto flex flex-col gap-2">
          {channel === "whatsapp" && (lead.phone ? <Button onClick={openWhatsApp}><MessageCircle /> Open in WhatsApp</Button> : <p className="text-sm text-muted-foreground">This business has no phone listed. Copy the message or try email.</p>)}
          {channel === "email" && (lead.email ? <Button onClick={openMail}><Mail /> Open in your mail app</Button> : <p className="text-sm text-muted-foreground">This business has no email listed. Copy the message to send it another way.</p>)}
          {channel === "call" && lead.phone && <Button asChild><a href={`tel:${lead.phone}`} onClick={() => onSent?.(lead)}><Phone /> Call {lead.phone}</a></Button>}
          <Button variant="outline" onClick={copy}>{copied ? <Check className="text-emerald-500" /> : <Copy />} {copied ? "Copied" : "Copy"}</Button>
          <p className="text-center text-xs text-muted-foreground">Sending marks the lead as contacted. Edit the wording in Templates.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
