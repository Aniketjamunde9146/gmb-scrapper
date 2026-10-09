"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, LogOut, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Logo } from "../logo";

/** Shown instead of the dashboard when an admin has blocked the account. They can still log out or contact support. */
export function BlockedScreen({ reason, whatsapp }: { reason: string | null; whatsapp: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <Logo />
        <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive"><Ban className="size-6" aria-hidden /></span>
        <h1 className="text-xl font-semibold">Your account is suspended</h1>
        <p className="text-sm text-muted-foreground">You cannot search or use your credits right now.{reason ? <> Reason: <span className="text-foreground">{reason}</span></> : null}</p>
        <p className="text-sm text-muted-foreground">If you think this is a mistake, contact us and we will look into it.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {whatsapp && <Button asChild><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Contact support</a></Button>}
          <Button variant="outline" onClick={logout} loading={leaving}>{!leaving && <LogOut />} Log out</Button>
        </div>
      </Card>
    </div>
  );
}
