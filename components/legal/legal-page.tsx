import Link from "next/link";
import { Logo } from "../logo";
import { ThemeToggle } from "../theme-toggle";
import { site } from "../../lib/site";

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16">
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {site.updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-10 flex flex-col gap-9 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:leading-relaxed [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_h2+p]:mt-3">
          {children}
        </div>
        <p className="mt-14 border-t pt-6 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </main>
    </>
  );
}

export const contactLine = site.email ? (
  <a className="font-medium text-primary underline underline-offset-4" href={`mailto:${site.email}`}>
    {site.email}
  </a>
) : (
  <span>the contact details published on this website</span>
);
