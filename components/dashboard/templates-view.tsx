"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Mail, MessageCircle, Phone, RotateCcw, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import { ANGLE_LABEL, CHANNEL_LABEL, DEFAULT_TEMPLATES, VARIABLES, fill, loadOverrides, resolve, saveOverrides, type Channel, type Overrides, type Template } from "../../lib/templates";
import { useUser } from "./user-context";

const CH: { id: Channel; icon: typeof Mail }[] = [{ id: "whatsapp", icon: MessageCircle }, { id: "email", icon: Mail }, { id: "call", icon: Phone }];
const field = "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20";

function Editor({ base, overrides, onChange, preview }: { base: Template; overrides: Overrides; onChange: (o: Overrides) => void; preview: { business: string; category: string; city: string; sender: string } }) {
  const t = resolve(base, overrides);
  const [body, setBody] = useState(t.body);
  const [subject, setSubject] = useState(t.subject ?? "");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = body !== t.body || subject !== (t.subject ?? "");
  const custom = !!overrides[base.id];
  const shown = fill(body, { ...preview, rating: "3.2" });

  const save = () => { onChange({ ...overrides, [base.id]: { body, subject: base.subject ? subject : undefined } }); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  const reset = () => { const n = { ...overrides }; delete n[base.id]; onChange(n); setBody(base.body); setSubject(base.subject ?? ""); };
  const copy = async () => { try { await navigator.clipboard.writeText(base.subject ? `Subject: ${fill(subject, { ...preview, rating: "3.2" })}\n\n${shown}` : shown); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} };

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><h3 className="font-semibold">{base.title}</h3><Badge variant={base.angle === "general" ? "outline" : "hot"}>{ANGLE_LABEL[base.angle]}</Badge>{custom && <Badge variant="success">Edited</Badge>}</div>
      </div>
      {base.subject !== undefined && <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Subject</span><input value={subject} onChange={(e) => setSubject(e.target.value)} className={cn(field, "h-11 py-0")} /></label>}
      <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Template</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={base.channel === "call" ? 9 : 6} className={cn(field, "resize-y leading-relaxed")} /></label>
      <div className="rounded-xl border border-dashed bg-muted/40 p-3 text-sm">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Preview</p>
        <p className="whitespace-pre-wrap leading-relaxed">{shown}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={save} disabled={!dirty}>{saved ? <Check /> : <Save />} {saved ? "Saved" : "Save changes"}</Button>
        <Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="text-emerald-500" /> : <Copy />} {copied ? "Copied" : "Copy preview"}</Button>
        {(custom || dirty) && <Button size="sm" variant="ghost" onClick={reset}><RotateCcw /> Reset to original</Button>}
      </div>
    </Card>
  );
}

export function TemplatesView() {
  const user = useUser();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [overrides, setOverrides] = useState<Overrides | null>(null);
  const [biz, setBiz] = useState("Smile Craft Dental");
  const [cat, setCat] = useState("Dentist");
  const [city, setCity] = useState("Pune");

  useEffect(() => setOverrides(loadOverrides()), []);
  const list = useMemo(() => DEFAULT_TEMPLATES.filter((t) => t.channel === channel), [channel]);
  const update = (o: Overrides) => { setOverrides(o); saveOverrides(o); };

  if (!overrides) {
    return <div className="flex flex-col gap-4" aria-busy="true"><Skeleton className="h-11 w-full max-w-md rounded-lg" />{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <p className="text-sm text-muted-foreground sm:col-span-3">Preview with a sample business. Variables you can use: <span className="font-mono text-xs text-foreground">{VARIABLES.join("  ")}</span></p>
        {[["Business", biz, setBiz], ["Type", cat, setCat], ["City", city, setCity]].map(([l, v, set]) => (
          <label key={l as string} className="text-sm"><span className="mb-1.5 block text-muted-foreground">{l as string}</span><input value={v as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} maxLength={60} className={cn(field, "h-11 py-0")} /></label>
        ))}
      </Card>

      <div role="tablist" aria-label="Channel" className="grid w-full max-w-md grid-cols-3 rounded-lg border bg-card/60 p-1 text-sm">
        {CH.map(({ id, icon: Icon }) => (
          <button key={id} role="tab" type="button" aria-selected={channel === id} onClick={() => setChannel(id)} className={cn("flex h-9 items-center justify-center gap-1.5 rounded-md transition", channel === id ? "bg-foreground font-medium text-background" : "text-muted-foreground hover:text-foreground")}><Icon className="size-4" aria-hidden /> {CHANNEL_LABEL[id]}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((t) => <Editor key={`${t.id}-${channel}`} base={t} overrides={overrides} onChange={update} preview={{ business: biz || "Your business", category: cat || "local", city, sender: user.name || "Your name" }} />)}
      </div>
      <p className="text-xs text-muted-foreground">Edits are saved on this device. When you write a message from a lead, the template that matches its best angle is filled in automatically.</p>
    </div>
  );
}
