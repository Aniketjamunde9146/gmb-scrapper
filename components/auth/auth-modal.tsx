"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Mail, ShieldCheck, X } from "lucide-react";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { PageLoader } from "../ui/spinner";
import { safeNext } from "../../lib/utils";
import { createClient } from "../../lib/supabase/client";

type Mode = "login" | "signup";
type Ctx = { open: (mode?: Mode, next?: string) => void };
const AuthCtx = React.createContext<Ctx>({ open: () => {} });
export const useAuthModal = () => React.useContext(AuthCtx);

const field =
  "h-11 w-full rounded-xl border bg-background px-3.5 text-[15px] outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

/** The sign-in / sign-up form. Used inside the popup and on the /login and /signup pages. */
export function AuthPanel({ initialMode = "login", next = "/dashboard", initialError = "", onDone }: { initialMode?: Mode; next?: string; initialError?: string; onDone?: () => void }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [step, setStep] = React.useState<"start" | "details" | "sent" | "reset">("start");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState(initialError);
  const [busy, setBusy] = React.useState<"" | "email" | "google">("");
  const [redirecting, setRedirecting] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const signup = mode === "signup";
  const target = safeNext(next);

  const switchMode = (m: Mode) => { setMode(m); setError(""); setStep("start"); };

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (signup && !consent) return setError("Please accept the Terms and Privacy Policy to continue.");
    setStep("details");
  }

  async function google() {
    setError("");
    if (signup && !consent) return setError("Please accept the Terms and Privacy Policy to continue with Google.");
    setBusy("google");
    try {
      // The callback route reads this cookie and stores the consent timestamp on the new account.
      document.cookie = `gmb_terms=${Date.now()}; Path=/; Max-Age=900; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      const { error: err } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(target)}` },
      });
      if (err) throw err;
    } catch {
      setError("Google sign-in is not available right now. Use your email instead.");
      setBusy("");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy("email");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.get("password"), name: form.get("name"), consent }),
      });
      const json = (await res.json()) as { error?: string; confirm?: boolean };
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      if (json.confirm) { setStep("sent"); setBusy(""); return; }
      setRedirecting(true);
      onDone?.();
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy("");
    }
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy("email");
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent("/dashboard/settings")}` });
    setBusy("");
    if (err) return setError("Could not send the reset email. Try again in a minute.");
    setStep("sent");
  }

  if (redirecting) return <PageLoader label={signup ? "Account created. Opening your dashboard…" : "Logged in. Opening your dashboard…"} className="min-h-[18rem]" />;

  if (step === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 px-2 py-6 text-center" role="status">
        <CheckCircle2 className="size-12 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="max-w-xs text-sm text-muted-foreground">We sent a secure link to <span className="font-medium text-foreground">{email}</span>. Open it and you will land in your dashboard.</p>
        <Button variant="ghost" size="sm" onClick={() => switchMode("login")}>Back to log in</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Log in or sign up" className="grid grid-cols-2 rounded-lg border bg-muted/60 p-1 text-sm font-medium">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => switchMode(m)} className={`h-9 rounded-md transition ${mode === m ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tighter">{step === "reset" ? "Reset your password" : signup ? "Create your free account" : "Welcome back"}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{step === "reset" ? "We will email you a secure link." : signup ? "3 free searches. No card needed." : "Log in to see your leads."}</p>
      </div>

      {step === "start" && (
        <>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={google} disabled={!!busy}>
            {busy === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />} Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={onContinue} className="flex flex-col gap-3" noValidate>
            <label className="sr-only" htmlFor="am-email">Email</label>
            <input id="am-email" type="email" inputMode="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={field} required />
            {signup && <ConsentBox checked={consent} onChange={setConsent} />}
            {error && <Err>{error}</Err>}
            <Button type="submit" size="lg" className="w-full"><Mail /> Continue with email</Button>
          </form>
          {!signup && <p className="text-center text-xs text-muted-foreground">By continuing you agree to our <Link href="/terms" target="_blank" className="underline underline-offset-4">Terms</Link> and <Link href="/privacy" target="_blank" className="underline underline-offset-4">Privacy Policy</Link>.</p>}
        </>
      )}

      {step === "details" && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <button type="button" onClick={() => { setStep("start"); setError(""); }} className="-mb-1 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden /> {email}</button>
          {signup && (<><label className="sr-only" htmlFor="am-name">Full name</label><input id="am-name" name="name" autoComplete="name" placeholder="Full name" required minLength={2} className={field} autoFocus /></>)}
          <div className="relative">
            <label className="sr-only" htmlFor="am-pass">Password</label>
            <input id="am-pass" name="password" type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create a password (8+ characters)" : "Password"} required minLength={signup ? 8 : 1} className={`${field} pr-11`} autoFocus={!signup} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
          {error && <Err>{error}</Err>}
          <Button type="submit" size="lg" disabled={!!busy}>{busy === "email" && <Loader2 className="animate-spin" />}{signup ? "Create account" : "Log in"}</Button>
          {!signup && <button type="button" onClick={() => { setStep("reset"); setError(""); }} className="text-center text-sm text-primary underline-offset-4 hover:underline">Forgot password?</button>}
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={sendReset} className="flex flex-col gap-3">
          <input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={field} required aria-label="Email" autoFocus />
          {error && <Err>{error}</Err>}
          <Button type="submit" size="lg" disabled={!!busy}>{busy && <Loader2 className="animate-spin" />}Send reset link</Button>
          <button type="button" onClick={() => setStep("start")} className="text-center text-sm text-muted-foreground hover:text-foreground">Back</button>
        </form>
      )}
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" aria-hidden /> Your data is private to your account.</p>
    </div>
  );
}

const Err = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{children}</p>
);

function ConsentBox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/50 p-3 text-[13px] leading-snug">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" />
      <span>
        I agree to the <Link href="/terms" target="_blank" className="font-medium text-primary underline underline-offset-4">Terms</Link> and have read the <Link href="/privacy" target="_blank" className="font-medium text-primary underline underline-offset-4">Privacy Policy</Link>. I will use leads only for lawful outreach.
      </span>
    </label>
  );
}

/**
 * Wrap the app once. Any link to /login or /signup opens the popup instead of navigating
 * (middle-click and ctrl-click still open the real page). Also opens from ?auth=login|signup.
 */
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ open: boolean; mode: Mode; next: string }>({ open: false, mode: "login", next: "/dashboard" });
  const open = React.useCallback((mode: Mode = "login", next = "/dashboard") => setState({ open: true, mode, next }), []);
  const pathname = usePathname();

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname !== "/login" && url.pathname !== "/signup")) return;
      e.preventDefault();
      open(url.pathname === "/signup" ? "signup" : "login", url.searchParams.get("next") ?? "/dashboard");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  React.useEffect(() => { setState((s) => (s.open ? { ...s, open: false } : s)); }, [pathname]);

  return (
    <AuthCtx.Provider value={{ open }}>
      {children}
      <React.Suspense fallback={null}><UrlTrigger open={open} /></React.Suspense>
      <Dialog.Root open={state.open} onOpenChange={(o) => setState((s) => ({ ...s, open: o }))}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-[60] max-h-[92dvh] overflow-y-auto rounded-t-3xl border bg-card p-6 pb-safe text-card-foreground shadow-2xl outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 sm:data-[state=open]:zoom-in-95">
            <Dialog.Title className="sr-only">Log in or sign up</Dialog.Title>
            <Dialog.Description className="sr-only">Continue with Google or your email address.</Dialog.Description>
            <div className="mb-5 flex items-center justify-between">
              <Logo />
              <Dialog.Close className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Close"><X className="size-5" /></Dialog.Close>
            </div>
            <AuthPanel key={`${state.mode}-${state.open}`} initialMode={state.mode} next={state.next} onDone={() => setState((s) => ({ ...s, open: false }))} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AuthCtx.Provider>
  );
}

function UrlTrigger({ open }: { open: Ctx["open"] }) {
  const sp = useSearchParams();
  const router = useRouter();
  React.useEffect(() => {
    const a = sp.get("auth");
    if (a === "login" || a === "signup") { open(a, sp.get("next") ?? "/dashboard"); router.replace(location.pathname, { scroll: false }); }
  }, [sp, open, router]);
  return null;
}
