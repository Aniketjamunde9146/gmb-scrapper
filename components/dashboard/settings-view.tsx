"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, KeyRound, LogOut, MessageSquareText, Moon, Sun, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { HoldToDelete } from "../ui/hold-to-delete";
import { PanelTitle } from "./page-header";
import { createClient } from "../../lib/supabase/client";
import { loadPrefs, savePrefs } from "../../lib/prefs";
import { niches } from "../../lib/site";

const field = "h-11 w-full rounded-xl border bg-card px-3.5 text-[15px] outline-none focus-visible:ring-4 focus-visible:ring-ring/20";

function Row({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0"><p className="font-medium">{title}</p><p className="mt-0.5 text-sm text-muted-foreground">{body}</p></div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
type Msg = { ok: boolean; text: string } | null;
const Status = ({ m }: { m: Msg }) => (m ? <p role="status" className={`mt-3 text-sm ${m.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{m.text}</p> : null);

export function SettingsView({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [pwBusy, setPwBusy] = useState(false);
  const [nm, setNm] = useState(name);
  const [nmMsg, setNmMsg] = useState<Msg>(null);
  const [nmBusy, setNmBusy] = useState(false);
  const [city, setCity] = useState("");
  const [niche, setNiche] = useState("");
  const [prefMsg, setPrefMsg] = useState<Msg>(null);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => { const p = loadPrefs(); setCity(p.city ?? ""); setNiche(p.niche ?? ""); }, []);

  function setTheme(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const v = nm.trim();
    if (v.length < 2) return setNmMsg({ ok: false, text: "Enter at least 2 characters." });
    setNmBusy(true);
    const { error } = await createClient().auth.updateUser({ data: { name: v } });
    setNmBusy(false);
    setNmMsg(error ? { ok: false, text: "Could not update your name. Try again." } : { ok: true, text: "Name updated. It is used to sign your messages." });
    if (!error) router.refresh();
  }

  function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    savePrefs({ city: city.trim() || undefined, niche: niche.trim() || undefined });
    setPrefMsg({ ok: true, text: "Saved. New searches start with these." });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setPwMsg({ ok: false, text: "Use at least 8 characters." });
    setPwBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    setPwMsg(error ? { ok: false, text: "Could not update the password. Log in again and retry." } : { ok: true, text: "Password updated." });
    if (!error) setPw("");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }
  async function deleteAccount() {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) { router.replace("/"); router.refresh(); } else setMsg({ ok: false, text: "Could not delete your account. Please contact support." });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <span className="grain-saffron grid size-12 place-items-center rounded-full text-lg font-semibold">{name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="truncate text-sm text-muted-foreground">{email}</p></div>
        </div>
        <form onSubmit={saveName} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1"><span className="flex items-center gap-2 text-sm font-medium"><User className="size-4 text-primary" aria-hidden /> Your name</span>
            <input value={nm} onChange={(e) => setNm(e.target.value)} maxLength={60} className={`mt-2 ${field}`} autoComplete="name" />
          </label>
          <Button type="submit" loading={nmBusy} disabled={nm.trim() === name}>Save name</Button>
        </form>
        <Status m={nmMsg} />
      </Card>

      <Card className="p-4 sm:p-5">
        <PanelTitle icon={MessageSquareText} title="Search defaults" hint="Searches start with your usual city and business type. Stored on this device." />
        <form onSubmit={savePreferences} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Default city</span><input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="e.g. Pune" className={field} /></label>
          <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Default business type</span><input value={niche} onChange={(e) => setNiche(e.target.value)} list="niches-p" maxLength={60} placeholder="e.g. dentist" className={field} /></label>
          <datalist id="niches-p">{niches.map((n) => <option key={n} value={n} />)}</datalist>
          <Button type="submit">Save defaults</Button>
        </form>
        <Status m={prefMsg} />
        <p className="mt-3 text-sm text-muted-foreground">Outreach messages use your name and can be edited in <Link href="/dashboard/templates" className="font-medium text-primary hover:underline">Templates</Link>.</p>
      </Card>

      <Card className="divide-y">
        <Row title="Appearance" body="Choose how GMB Scraper looks on this device.">
          <div className="inline-flex rounded-full border bg-muted/60 p-1">
            <Button size="sm" variant="ghost" onClick={() => setTheme(false)}><Sun /> Light</Button>
            <Button size="sm" variant="ghost" onClick={() => setTheme(true)}><Moon /> Dark</Button>
          </div>
        </Row>
        <Row title="Log out" body="Sign out of this browser."><Button variant="outline" size="sm" onClick={logout}><LogOut /> Log out</Button></Row>
      </Card>

      <Card className="p-4 sm:p-5">
        <form onSubmit={changePassword} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1"><span className="flex items-center gap-2 font-medium"><KeyRound className="size-4 text-primary" aria-hidden /> Change password</span>
            <input type="password" autoComplete="new-password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" className={`mt-2 ${field}`} />
          </label>
          <Button type="submit" loading={pwBusy} disabled={!pw}>Update password</Button>
        </form>
        <Status m={pwMsg} />
        <p className="mt-2 text-xs text-muted-foreground">Signed up with Google? You can set a password here to also log in with email.</p>
      </Card>

      <Card className="divide-y">
        <Row title="Download my data" body="Saved leads, notes and search history as one JSON file.">
          <a href="/api/account" download className="inline-flex h-8 items-center gap-2 rounded-lg border bg-card/60 px-3 text-[13px] font-medium hover:bg-accent"><Download className="size-4" aria-hidden /> Download</a>
        </Row>
      </Card>

      <Card className="border-destructive/30">
        <Row title="Delete account" body="Permanently erases your account, saved leads and history. This cannot be undone.">
          <HoldToDelete size="md" label="Hold to delete account" holdMs={2500} onConfirm={deleteAccount} />
        </Row>
        {msg && <p role="alert" className="px-5 pb-4 text-sm text-destructive">{msg.text}</p>}
      </Card>
    </div>
  );
}
