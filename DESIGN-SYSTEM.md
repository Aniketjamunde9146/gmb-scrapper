# GMB Scraper design system (taken from the landing page)

**Theme** Pure black canvas (#000), panels #0b0b0c to #121212, 10% white borders. One accent: saffron
(#ff8c00 > #ffa24a > #ffd89a). Emerald for success, red for low ratings. Light mode is warm cream (#fffaf3)
with dark brown text. Dark tokens live in `app/globals.css`.

**Type** Inter 400 to 700. Headings are weight 600, tracking -0.03em to -0.04em, filled with a white-to-60% gradient.
Body is 15 to 17px at 55 to 60% white. Sentence case everywhere, plain verbs, no all-caps labels.

**Buttons** `Button` default = white gradient (the landing "Btn light"). `outline` = glass (the "Btn dark").
`variant="glow"` = black pill with the travelling saffron ring ("GlowButton"). All press down on click.
`loading` shows a spinner and blocks double clicks.

**Cards** `Card` has the hover border light that circles the card (`.gcard`). `hot` keeps it lit.

**Illustrations** 240x140 outline scenes with a saffron fill, in `components/landing/illustrations.tsx`.
Every dashboard page and empty state uses one (`PageHeader art=...`, `ScenePanel`, `EmptyState`).

**Loading** Route progress bar (top), `Spinner`, `PageLoader` (logo in ring), shimmer `Skeleton` set,
and a `loading.tsx` for every route that mirrors the real layout.
