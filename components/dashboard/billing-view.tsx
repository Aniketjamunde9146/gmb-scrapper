"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, Clock, Copy, MessageCircle, Smartphone, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PACKS, inr, perSearch, shortRef, upiLink, whatsappProofLink, type PaymentRow } from "../../lib/billing";
import { cn } from "../../lib/utils";

type Props = {
  needMore: boolean; freeLeft: number; credits: number; payments: PaymentRow[]; email: string;
  ready: boolean; upiId: string; upiName: string; qr: string; whatsapp: string;
};

const STATUS = {
  pending: { label: "Waiting for approval", icon: Clock, cls: "text-amber-500" },
  approved: { label: "Credits added", icon: CheckCircle2, cls: "text-emerald-500" },
  rejected: { label: "Rejected", icon: XCircle, cls: "text-destructive" },
} as const;

const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export function BillingView(p: Props) {
  const router = useRouter();
  const [packId, setPackId] = useState("growth");
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<PaymentRow | null>(null);
  const [copied, setCopied] = useState(false);
  const pack = PACKS.find((x) => x.id === packId)!;
  const left = p.freeLeft + p.credits;
  const cleanUtr = utr.replace(/\s/g, "");

  async function copyUpi() {
    try { await navigator.clipboard.writeText(p.upiId); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked: the ID is still visible */ }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return; // blocks a double tap
    setError("");
    if (!/^\d{12}$/.test(cleanUtr)) return setError("The UTR is a 12-digit number. You can find it in your UPI app under payment details.");
    setBusy(true);
    try {
      const res = await fetch("/api/billing/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pack: packId, utr: cleanUtr }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save your payment.");
      setSent(json.payment as PaymentRow);
      setUtr("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your payment.");
    } finally {
      setBusy(false);
    }
  }

  const proofHref = (row: PaymentRow) => whatsappProofLink({ ...row, email: row.email || p.email });

  return (
    <div className="flex flex-col gap-6">
      {p.needMore && left === 0 && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <p>You have used your free searches. Pick a pack below to keep searching.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs text-muted-foreground">Searches left</p><p className="mt-1 text-3xl font-semibold tabular-nums">{left}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Free searches left</p><p className="mt-1 text-3xl font-semibold tabular-nums">{p.freeLeft}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Paid credits</p><p className="mt-1 text-3xl font-semibold tabular-nums">{p.credits}</p></Card>
      </div>

      {sent ? (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">Payment received for checking</h2>
              <p className="mt-1 text-sm text-muted-foreground">Reference <span className="font-mono font-medium text-foreground">{shortRef(sent.id)}</span> · {sent.credits} searches · {inr(sent.amount_inr)}. Send the payment screenshot on WhatsApp so it is approved faster. Credits appear here as soon as it is approved.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.whatsapp && <Button asChild><a href={proofHref(sent)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Send screenshot on WhatsApp</a></Button>}
            <Button variant="outline" onClick={() => setSent(null)}>Buy another pack</Button>
          </div>
        </Card>
      ) : !p.ready ? (
        <Card className="p-6 text-sm text-muted-foreground">Payments are not switched on yet. The site owner needs to set <code>NEXT_PUBLIC_UPI_ID</code> and <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code> in the environment settings.</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {PACKS.map((k) => (
              <button key={k.id} type="button" onClick={() => setPackId(k.id)} aria-pressed={packId === k.id} className="text-left">
                <Card hot={packId === k.id} className={cn("h-full p-5 transition", packId === k.id ? "ring-2 ring-primary" : "hover:bg-accent/40")}>
                  <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-muted-foreground">{k.name}</h3>{k.hot && <span className="rounded-full border border-orange-500/40 bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium text-orange-500">Best value</span>}</div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{inr(k.price)}</p>
                  <p className="mt-1 text-sm">{k.credits} searches</p>
                  <p className="mt-1 text-xs text-muted-foreground">{perSearch(k)} per search</p>
                </Card>
              </button>
            ))}
          </div>

          <Card className="grid gap-6 p-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">1. Pay {inr(pack.price)} by UPI</h2>
              {p.qr && /^(\/|https?:\/\/)/.test(p.qr) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.qr} alt={`UPI QR code for ${p.upiName}`} width={176} height={176} className="size-44 rounded-xl border bg-white p-2" />
              )}
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-card/60 px-3 py-2 text-sm">
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">UPI ID · {p.upiName}</span><span className="block truncate font-mono">{p.upiId}</span></span>
                <Button type="button" variant="outline" size="sm" onClick={copyUpi}>{copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}</Button>
              </div>
              <Button asChild variant="outline" className="sm:hidden"><a href={upiLink(pack.price, pack.name)}><Smartphone /> Open my UPI app</a></Button>
              <p className="text-xs text-muted-foreground">Pay exactly {inr(pack.price)}. Then copy the 12-digit UTR (also called UPI reference number) from the payment details.</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
              <h2 className="text-lg font-semibold">2. Enter your UTR</h2>
              <label htmlFor="utr" className="sr-only">UTR number</label>
              <input id="utr" inputMode="numeric" autoComplete="off" maxLength={14} placeholder="12-digit UTR, e.g. 412345678901" value={utr} onChange={(e) => setUtr(e.target.value.replace(/[^\d\s]/g, ""))}
                className="h-11 rounded-lg border bg-background px-3 font-mono text-base outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-invalid={!!error} aria-describedby={error ? "utr-err" : undefined} />
              {error && <p id="utr-err" role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" loading={busy}>I have paid {inr(pack.price)}</Button>
              <p className="text-xs text-muted-foreground">Next you will get a WhatsApp button with your payment details already filled in. Attach your screenshot and send.</p>
            </form>
          </Card>
        </>
      )}

      {p.payments.length > 0 && (
        <section aria-labelledby="pay-h">
          <h2 id="pay-h" className="mb-3 text-lg font-semibold">Your payments</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {p.payments.map((row) => {
              const st = STATUS[row.status];
              return (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{row.credits} searches · {inr(row.amount_inr)} <span className="font-mono text-xs text-muted-foreground">#{shortRef(row.id)}</span></p>
                    <p className="text-xs text-muted-foreground">{when(row.created_at)} · UTR {row.utr}</p>
                    {row.status === "rejected" && row.admin_note && <p className="mt-1 text-xs text-destructive">{row.admin_note}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {row.status === "pending" && p.whatsapp && <a href={proofHref(row)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"><MessageCircle className="size-3.5" aria-hidden /> Send proof</a>}
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", st.cls)}><st.icon className="size-4" aria-hidden /> {st.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
