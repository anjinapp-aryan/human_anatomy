# Anatomy Atelier — Repository Analysis & Product Transformation Blueprint

**Engagement date:** 2026-08-06
**Local workspace:** `D:\CLAUDE_WORKSPACE\human_anatomy\anatomy`
**Upstream:** https://github.com/anjinapp-aryan/anatomy
**Live deployment cross-referenced:** https://anatomy-livid.vercel.app/

---

# Part 0 — Repository Verification

| Check | Result |
|---|---|
| Clone | Succeeded (fresh clone into `D:\CLAUDE_WORKSPACE\human_anatomy\anatomy`) |
| Current branch | `main` (only branch; `origin/HEAD -> origin/main`) |
| Latest commit SHA | `c44eaa0e5bb0670925a49c6c76eba06f123487ef` |
| Commit subject | `feat: add Vercel configuration and update build scripts for Next.js integration` |
| Commit author / date | `thebuggeddev` — 2026-08-02 16:59:21 +0530 |
| Working tree | Clean (`git status --porcelain` empty) |
| Total commits | 6 — all authored on 2026-08-02 |
| Tracked files | 95 |
| Package manager | npm (only `package-lock.json` present; lockfileVersion 3, 384.8 KB) |
| Node engine | `>=22.13.0` (local: v24.14.1, npm 11.11.0) |
| Config files detected | `package.json`, `tsconfig.json`, `next.config.ts`, `vite.config.ts`, `vercel.json`, `eslint.config.mjs`, `postcss.config.mjs`, `drizzle.config.ts`, `.openai/hosting.json`, `.gitignore`, `.vercelignore` |
| CI/CD config | **None** — no `.github/`, no `Dockerfile`, no `docker-compose`, no `.env*` files |
| Dependency install | `npm install` → **517 packages, exit 0**, two deprecation warnings (`@esbuild-kit/esm-loader`, `@esbuild-kit/core-utils`) |

### Full commit history

```
c44eaa0 2026-08-02  feat: add Vercel configuration and update build scripts for Next.js integration
758b397 2026-08-02  feat: update organ illustrations and enhance layout for improved visual presentation
48d714f 2026-08-02  feat: implement depth prepass for improved organ fading and rendering
cab3e54 2026-08-02  refactor: anatomy Asset Manager and Viewer for improved performance and organization
0fc4ad7 2026-08-02  feat: add organ images and improve performance
bfbea1e 2026-08-02  Build Anatomy Atelier 3D learning platform
```

The entire product was built in a single day across six commits. There is no branching strategy, no PR history, no release tagging, and no CI gate.

---

# Part 1 — Repository Discovery

## 1.1 Directory map

```
anatomy/
├── app/                          # Next.js App Router (single route)
│   ├── layout.tsx                # Root layout, fonts, metadata, OG tags
│   ├── page.tsx                  # 5 lines — renders <AnatomyApp />
│   ├── globals.css               # 563 lines of hand-written CSS
│   ├── chatgpt-auth.ts           # SIWC helpers — NEVER IMPORTED
│   ├── components/
│   │   ├── AnatomyApp.tsx        # 335 lines — entire UI shell
│   │   └── OrganViewer.tsx       # 189 lines — canvas host + tool rail
│   └── lib/
│       ├── anatomy-data.ts       # 312 lines — 9 organs, hardcoded
│       └── three/
│           ├── viewer.ts         # 643 lines — Three.js scene engine
│           ├── loaders.ts        # 214 lines — GLTF asset manager + LRU
│           ├── hotspots.ts       # 372 lines — sprite marker layer
│           ├── dispose.ts        # 15 lines — GPU resource teardown
│           └── tsl-materials.ts  # 8 lines — NEVER IMPORTED
├── build/sites-vite-plugin.ts    # Packages .openai + drizzle into dist
├── db/                           # Drizzle + D1 — schema is EMPTY
├── drizzle/meta/_journal.json    # Zero migration entries
├── examples/d1/                  # Starter example, outside the router
├── worker/index.ts               # Cloudflare Worker entry — INERT on Vercel
├── tests/rendered-html.test.mjs  # STALE starter tests — both FAIL
├── public/
│   ├── models/*.glb              # 9 organs, 28.9 MB total
│   ├── anatomy/<organ>/*.webp    # 45 illustrations (5 per organ)
│   ├── draco/                    # 1.0 MB — DEAD, never wired
│   ├── basis/                    # 0.6 MB — DEAD, never wired
│   └── icons, og.jpg, svg assets
├── next.config.ts                # EMPTY config object
└── vercel.json                   # framework: nextjs, buildCommand: build:next
```

## 1.2 Technology stack (from `package.json`)

**Runtime dependencies (7):**
`next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`, `three@^0.185.1`, `gsap@^3.15.0`, `lucide-react@^1.28.0`, `drizzle-orm@0.45.2`

**Dev dependencies (18):** TypeScript 5.9.3, Tailwind CSS 4.2.1 (+ `@tailwindcss/postcss`), ESLint 9.39.4 + `eslint-config-next`, Vite 8.0.13, `vinext@0.0.50`, `@cloudflare/vite-plugin`, `wrangler@4.92.0`, `drizzle-kit`, `@vitejs/plugin-rsc`.

## 1.3 The two-build-target problem

This is the single most consequential structural fact in the repository.

`package.json` scripts target **Cloudflare Workers via vinext**:

```json
"dev":   "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext dev",
"build": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext build",
"start": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext start",
"build:next": "next build"
```

`vercel.json` overrides that and targets **stock Next.js on Vercel**:

```json
{ "framework": "nextjs", "buildCommand": "npm run build:next" }
```

Consequences, all verified:

- `worker/index.ts` — including the Cloudflare Images optimization endpoint at `/_vinext/image` — **never executes in production.** It exists only to satisfy the local Vite/Miniflare build.
- The D1 binding path (`db/index.ts` → `getDb()`) is unreachable on Vercel; `cloudflare:workers` is not a Vercel runtime module.
- `build/sites-vite-plugin.ts` packages `.openai/hosting.json` and `drizzle/` into `dist/.openai` — an artifact Vercel never reads.
- The `dev` / `build` / `start` scripts use POSIX inline env-var syntax (`VAR=value cmd`), which **fails on Windows PowerShell/cmd**. Windows contributors must use Git Bash or WSL. Not documented anywhere.
- `.vercelignore` carries a comment explaining that `build/`, `worker/`, and `db/` must be kept because `tsconfig.json` type-checks `**/*.ts` — i.e. dead runtime code is being retained purely to keep the type-checker from failing. That is a maintenance liability encoded as a config comment.

## 1.4 README is not this product's README

`README.md` documents **vinext-starter**, not Anatomy Atelier. It describes D1 bindings, ChatGPT sign-in helpers, and `npm run db:generate`. It says nothing about the anatomy application, the 3D pipeline, model authoring, hotspot coordinate authoring, Vercel deployment, or the Windows script incompatibility. A new engineer joining this repo receives actively misleading onboarding.

---

# Part 2 — Execution Results (Step 4)

All commands run locally against the clean clone.

| Command | Result |
|---|---|
| `npm install` | ✅ exit 0 — 517 packages in 12s |
| `npx next build` (the Vercel path) | ✅ exit 0 — compiled in 2.6s, TypeScript clean in 2.1s, 3 static pages, routes `/` and `/_not-found`, both `○ (Static)` |
| `npx vinext build` (the Cloudflare path) | ✅ built — but warns `Some chunks are larger than 500 kB after minification` and `Some routes could not be classified` |
| `npx eslint .` | ❌ **exit 1** |
| `node --test tests/rendered-html.test.mjs` | ❌ **both tests fail** |

### Lint failure — root cause

ESLint is pointed at the repository root with only `dist` and `.next` excluded, so it lints the vendored Emscripten bundles in `public/`:

```
public/basis/basis_transcoder.js
  9:772  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
public/draco/draco_decoder.js
  8:1680 error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
```

Hundreds of additional warnings come from the same minified vendor files. The only finding in **first-party** code is one legitimate warning:

```
app/components/AnatomyApp.tsx:57  warning  Using `<img>` could result in slower LCP  @next/next/no-img-element
```

Because lint exits non-zero, no CI gate can be adopted without first fixing the ignore configuration. Fix is one line in `eslint.config.mjs` — add `public/**` to `globalIgnores`.

### Test failure — root cause

`tests/rendered-html.test.mjs` is the **untouched vinext starter test suite**. It asserts on scaffolding that was deleted when the anatomy app was built:

```
✖ server-renders the starter loading skeleton
  ERR_MODULE_NOT_FOUND: file:///.../dist/server/index.js
✖ keeps the loading skeleton scoped and disposable
  ENOENT: no such file or directory, open '.../app/_sites-preview/SkeletonPreview.tsx'
```

It asserts `layout` contains `title: "Starter Project"` (actual title is `Anatomy Atelier — …`) and that `package.json` contains `"react-loading-skeleton": "3.5.0"` (not a dependency). Test coverage of the actual product is **zero percent**. `npm test` is permanently red.

---

# Part 3 — Cross-Reference: Local vs. Live (Step 5)

Fetched and inspected https://anatomy-livid.vercel.app/.

**Feature parity: the live site matches local `HEAD` exactly.** Verified identical: title and tagline, five nav items (Explore / Systems / Lessons / Library / Notes), hardcoded "MA" profile chip, all nine organs with the same system labels, the seven-tool 3D rail (Rotate, Zoom, Isolate, Cross-section, Layers, Compare, Reset), the heart hotspot set (Aorta, Left Atrium, Right Ventricle, …), key facts, medical note, and all six learning cards. Asset paths (`/anatomy/heart/thumb.webp`, `/anatomy/heart/organ.webp`, `/anatomy/heart/microscopic.webp`) resolve as in the repo.

**There are no unreleased local changes and no missing features.** The gap is not *feature drift* — it is **capability drift between the code's stated architecture and its deployed reality**:

| Capability present in code | Status on the live Vercel deployment |
|---|---|
| Cloudflare Worker + `/_vinext/image` optimization | **Inert.** Vercel runs `next build`; the worker is never invoked. Images ship as raw `<img>` with no optimizer. |
| D1 database (`db/index.ts`, `drizzle.config.ts`) | **Unreachable.** `cloudflare:workers` import cannot resolve on Vercel; schema is empty anyway. |
| ChatGPT sign-in (`app/chatgpt-auth.ts`) | **Unreachable.** Dispatch owns `/signin-with-chatgpt` on OpenAI Sites only; on Vercel those routes 404. |
| Draco + Basis decoders in `public/` | **1.6 MB of dead bytes** served from the origin, never requested by any code path. |
| OG image base URL | Falls back correctly — `VERCEL_PROJECT_PRODUCTION_URL` is consumed in `app/layout.tsx:31`. This one path is Vercel-aware. |

Additionally, the live site is a **single URL**. There is no `/organ/heart` route, so a teacher cannot link a class to a specific organ, and Google indexes exactly one page for a nine-organ product.

---

# Part 4 — Complete Technical Analysis (Step 6)

## 4.1 Architecture

**Pattern:** thin server shell + one large client island.

`app/page.tsx` (5 lines) renders `<AnatomyApp />`, which is `"use client"`. Everything below it is client-side. `app/layout.tsx` is the only meaningful server component, and it does static metadata only. The build output confirms it: both routes are `○ (Static)` prerendered.

**What this means in practice:** React Server Components, streaming, server data fetching, and per-request personalization are all architecturally available (Next 16 App Router) and **entirely unused**. The app is a statically-hosted SPA wearing a Next.js jacket.

**Rendering strategy:** SSG for the shell; CSR for all interaction. Three.js is correctly deferred behind `void import("../lib/three/viewer")` in `app/components/OrganViewer.tsx:58`, so the 668 KB viewer chunk is not in the critical path.

## 4.2 Component hierarchy

```
RootLayout (server)
└── Home (server)
    └── AnatomyApp ("use client")  ← owns 6 useState hooks, all app state
        ├── header.topbar          — brand, nav, search, profile
        ├── aside.organ-library    — filtered organ list, prefetch on hover
        ├── OrganViewer ("use client")
        │   ├── div.three-mount    → AnatomyViewer (imperative, non-React)
        │   │   ├── AnatomyAssetManager  (GLTF load, normalize, LRU cache)
        │   │   └── HotspotLayer         (sprite markers, surface snapping)
        │   ├── .viewer-tools      — 7 tool buttons
        │   ├── .hotspot-callout   — positioned imperatively, no re-render
        │   └── ul.hotspot-index   — screen-reader equivalent of the dots
        ├── aside.info-panel       — facts, GSAP reveal on organ change
        ├── section.compare-strip  — conditional
        ├── section.learning-cards — 6 cards
        └── LearningModal          — 4 variants (lesson/quiz/animation/system)
```

`AnatomyApp.tsx` is 335 lines and holds every concern: layout shell, navigation, search, library, info panel, comparison strip, six learning cards, and the modal system. It is the primary refactor target.

## 4.3 State management

There is no state library. All state is six `useState` calls in `AnatomyApp.tsx:70-75`:

```tsx
const [organId, setOrganId] = useState<OrganId>("heart");
const [autoRotate, setAutoRotate] = useState(true);
const [compare, setCompare] = useState(false);
const [modal, setModal] = useState<Modal>(null);
const [query, setQuery] = useState("");
const [mobileLibrary, setMobileLibrary] = useState(false);
```

For the current scope this is correct and appropriately minimal. It becomes a hard ceiling the moment learner progress, assignments, or multi-user sessions are introduced — none of that can live in component state.

A deliberate and well-executed decision: the 3D layer keeps its own state **outside** React. `OrganViewer.tsx:95-98` attaches the hotspot callout imperatively so that a spinning model never triggers a React render. Mirror refs (`organRef`, `autoRotateRef`) prevent the init effect from re-running. This is exactly right.

## 4.4 The 3D engine — the strongest part of this codebase

`app/lib/three/viewer.ts` is genuinely well-engineered. Documented, deliberate decisions:

- **Render-on-demand loop** (`viewer.ts:381-403`). Frames are drawn only when `dirty` is set or a `busyUntil` window is open. Idle cost is near zero — critical for battery life on school tablets.
- **Visibility gating** — a `ResizeObserver` plus an `IntersectionObserver` (120px root margin) plus `document.visibilitychange` all suspend rendering.
- **Fixed pixel ratio, decided once** (`viewer.ts:74-80`). The comment records that a dynamic quality controller was removed because vsync-quantised frame intervals made it oscillate and never recover. This is the kind of institutional knowledge most codebases lose.
- **Baked contact shadow instead of shadow mapping** (`viewer.ts:95`, `174-187`) — avoids a second full pass over ~350k triangles every frame.
- **Depth prepass during fades** (`viewer.ts:324-377`). Transparent solid meshes would otherwise blend in draw order and reveal their own interiors. The prepass proxy is parented to the mesh so it inherits the intro animation for free, and it is torn down on completion.
- **PMREM environment from a 16×32 generated gradient** (`viewer.ts:207-234`) — real material response for one bake, no HDR download.
- **Screen-space hotspot picking** (`hotspots.ts:254-270`) — projects up to six sprites instead of raycasting a 350k-triangle mesh.
- **Cone-filtered surface snapping** (`hotspots.ts:315-371`) — authored hotspot coordinates are snapped onto the mesh shell using direction cones *before* distance, so a dot can't tunnel to the far side of the organ. One linear vertex pass per organ.
- **LRU asset cache, limit 3** (`loaders.ts:10`, `179-187`), with `resetMaterials()` undoing wireframe/clipping/fade state before a cached organ returns.
- **Thorough disposal** (`viewer.ts:600-625`, `dispose.ts`) — geometries, materials, textures, listeners, observers, and the canvas element are all released.

**Where the 3D layer is structurally limited:**

Every GLB contains exactly **one mesh**. Verified by parsing all nine GLB JSON chunks:

| Model | Size | Triangles | Meshes | Images | Animations | Extensions |
|---|---|---|---|---|---|---|
| skin.glb | 5.52 MB | 356,333 | 1 | 3 | 0 | meshopt, quantization, volume |
| pancreas.glb | 4.62 MB | 346,596 | 1 | 3 | 0 | meshopt, quantization, volume |
| lungs.glb | 4.25 MB | 350,772 | 1 | 3 | 0 | meshopt, quantization, volume |
| heart.glb | 3.17 MB | 386,597 | 1 | 3 | 0 | meshopt, quantization |
| liver.glb | 2.54 MB | 345,526 | 1 | 1 | 0 | meshopt, quantization, volume, webp |
| brain.glb | 2.45 MB | 377,692 | 1 | 3 | 0 | meshopt, quantization, volume, webp |
| eyeball.glb | 2.10 MB | 320,250 | 1 | 3 | 0 | meshopt, quantization, volume, webp |
| kidneys.glb | 2.09 MB | 327,452 | 1 | 3 | 0 | meshopt, quantization, volume, webp |
| intestine.glb | 1.89 MB | 308,748 | 1 | 3 | 0 | meshopt, quantization, volume, webp |
| **Total** | **28.6 MB** | **3.12 M** | — | — | **0** | — |

Three consequences follow directly:

1. **"Isolate" and "Layers" cannot do what their names promise.** With one mesh, `toggleIsolate()` (`viewer.ts:551-558`) only fades the *plinth*, and `toggleLayers()` (`viewer.ts:587-598`) flips global wireframe. There is no per-structure isolation because there are no per-structure nodes. Real anatomical layer peeling requires re-authored, segmented models — this is an **asset problem, not a code problem**, and it is the highest-leverage fix in the entire product.
2. **"Animate" is not 3D.** No GLB has animations, so `assets.hasAnimation` is always `false` and the mixer path is dead. The Animate button opens a modal that applies a CSS `heartbeat` keyframe to a static 2D WebP (`globals.css:470`).
3. **No LOD, no draw-call budget for low-end hardware.** ~350k triangles per organ on a shared school Chromebook or a low-end Android tablet is aggressive. The renderer drops to `pixelRatio 1.5` and disables antialiasing under 780px width or `hardwareConcurrency < 6` (`viewer.ts:74`), which helps fill rate but does nothing about vertex load.

**Dead decoder payload:** `GLTFLoader` is configured with `setMeshoptDecoder(MeshoptDecoder)` only (`loaders.ts:31`). `DRACOLoader` and `KTX2Loader` are never constructed. The models confirm Draco and KTX2/Basis are unused. Therefore `public/draco/` (1.0 MB) and `public/basis/` (0.6 MB) are **1.6 MB of files that no code path can ever request** — pure repository and origin bloat.

## 4.5 Performance

**Built bundle sizes (Vite/Cloudflare output, gzip not applied):**

| Chunk | Size |
|---|---|
| `viewer-*.js` (Three.js + viewer) | 668.1 KB |
| `framework-*.js` (React) | 185.4 KB |
| `index-*.js` | 78.9 KB |
| `gsap-*.js` | 67.9 KB |
| `AnatomyApp-*.js` | 35.5 KB |
| `index-*.css` | 30.4 KB |

Next.js output mirrors this (largest chunk 674.4 KB). The viewer chunk is lazy so it does not block first paint, but **668 KB of JavaScript to see one organ is the dominant cost on a school network**, followed immediately by a 2–5.5 MB model download.

**What is already done well:**
- Three.js is dynamically imported — off the critical path.
- Model prefetch on `pointerenter` **and** `onFocus` (`AnatomyApp.tsx:149-150`) — keyboard users get the same warm cache as mouse users. Good detail.
- Illustration prefetch on selection (`AnatomyApp.tsx:94-99`).
- Fonts via `next/font/google` — self-hosted, no layout shift.
- Illustrations are WebP; the largest is 135 KB.
- `loading="eager"` on thumbnails, `lazy` on everything else (`AnatomyApp.tsx:63`).

**Gaps:**
- **No `next/image`.** The only first-party lint warning. On Vercel this means no automatic resizing, no AVIF, no responsive `srcset` for 45 illustrations.
- **No Three.js tree-shaking strategy.** The full library lands in one chunk.
- **No LOD / progressive mesh.** The 350k-triangle model is the only representation.
- **No service worker / offline cache.** For schools with intermittent connectivity, re-downloading 3 MB per organ per session is a real cost. Icons for a PWA (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) are already shipped, but **there is no `manifest.json`** — the PWA is half-built.
- **No cache headers configured.** `next.config.ts` is an empty object; `vercel.json` sets no `headers`. Immutable models and images get default caching only.
- **No performance budget or measurement.** No Lighthouse CI, no bundle analyzer, no Web Vitals reporting.

## 4.6 Accessibility

**Done well — and clearly deliberate:**
- `ul.hotspot-index` (`OrganViewer.tsx:163-167`) is a visually-hidden list of every hotspot label and detail, so screen-reader users get the canvas content in text. Properly clipped in CSS (`globals.css:312`).
- The canvas carries a descriptive `aria-label` and `tabIndex = 0` (`viewer.ts:97-101`), with arrow-key rotation, `+`/`-` zoom, and `Escape` to deselect (`viewer.ts:518-526`).
- `OrganArt` (`AnatomyApp.tsx:35-67`) makes a correct decision most codebases get wrong: when `alt` is empty it renders `aria-hidden` instead of an unlabeled `role="img"`, avoiding a double announcement where a wrapping control already names the element.
- Two inline comments document why artwork-as-button avoids nested interactive elements (`AnatomyApp.tsx:233-234`, `253-259`) — with proper `aria-label`s on the wrapping buttons.
- `aria-pressed` on toggle tools (`OrganViewer.tsx:136`), `role="status"` + `aria-live="polite"` on the loader (`OrganViewer.tsx:170`).
- Visible focus rings on buttons, inputs, and the canvas (`globals.css:32-35`).
- `@media (prefers-reduced-motion: reduce)` blanket rule (`globals.css:560-562`).

**Real defects:**

1. **The modal has no focus management.** `LearningModal` (`AnatomyApp.tsx:279-334`) sets `role="dialog"` and `aria-modal="true"` but never moves focus into the dialog, never traps Tab, and never restores focus to the trigger on close. A keyboard user opening the quiz is stranded behind the backdrop. This is a WCAG 2.4.3 / 2.1.2 failure.
2. **No Escape-to-close on modals.** `Escape` is handled only on the canvas element (`viewer.ts:524`). The modal ignores it.
3. **`prefers-reduced-motion` is CSS-only.** The GSAP timelines (`AnatomyApp.tsx:87-90`, `viewer.ts:302-305`) and the continuous `controls.autoRotate` are JavaScript-driven and completely ignore the preference. For a vestibular-sensitive learner, the organ keeps spinning. The CSS rule creates a false impression of compliance.
4. **Dead navigation announced as live.** `Systems`, `Library`, and `Notes` (`AnatomyApp.tsx:122,124,125`) are focusable buttons with no handler. `Explore` is hardcoded `className="active"` with no `aria-current`.
5. **Missing `type="button"`** on most `<button>`s inside `.main-nav` and elsewhere — they default to `type="submit"`.
6. **No skip link** to bypass the header and library and reach the viewer.
7. **Hotspot dots are not individually focusable.** The sr-only index is a read-only substitute; a keyboard user cannot *select* a specific hotspot to open its callout.
8. **No colour-contrast audit.** The muted palette (`--muted: #8d847c` on `#f7f0e7`) and 8–11px label text in `.compare-strip` and `.modal-facts` are very likely below WCAG AA — a serious concern for a K-12 audience.
9. **No dark mode.** Single light theme, `themeColor: "#f7f0e7"` only.

## 4.7 Security

The current attack surface is genuinely small — static site, no API routes, no user input reaching a server, no cookies, no third-party scripts, no `dangerouslySetInnerHTML`.

**Notable positive:** `safeRelativeReturnPath()` in `app/chatgpt-auth.ts:57-70` correctly defends against open redirect — it rejects protocol-relative `//evil.com`, parses against a sentinel origin, verifies the origin is unchanged, and blocks the reserved auth paths. Good code. It is also **completely unused**.

**Gaps, all of which become urgent the moment accounts or AI are added:**
- **No security headers.** `next.config.ts` is empty; `vercel.json` sets none. There is no CSP, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Strict-Transport-Security`, no `Permissions-Policy`.
- **No dependency scanning.** No Dependabot, no `npm audit` gate, no lockfile CI verification.
- **No `SECURITY.md`**, no disclosure path.
- Two deprecated transitive packages surfaced at install time.
- **No rate limiting or abuse controls** exist because no server endpoints exist — this must be designed in before Phase 2, not retrofitted.
- **Compliance posture is absent.** A K-12 product touching student data in the US must address **FERPA** and **COPPA** (under-13), and in the EU, **GDPR** with parental consent. Nothing in this repo addresses any of it. This is a go/no-go blocker for school procurement, not a nice-to-have.

## 4.8 Testing

- **Zero tests exercise the product.** The only suite is the stale starter test described in Part 2, and it fails.
- No unit tests (`anatomy-data`, `snapToSurface`, LRU eviction, `safeRelativeReturnPath` — all trivially testable and all untested).
- No component tests. No E2E. No visual regression. No WebGL smoke test.
- No coverage reporting, no CI.

For a product intended for classrooms, the absence of any automated verification of the 3D pipeline — the part most likely to break silently on a driver update or a Three.js minor bump — is the largest engineering risk in the repository.

## 4.9 Build pipeline, deployment, environment

- **Build:** Turbopack via `next build` on Vercel; Vite + Rolldown via `vinext build` locally. Both succeed. TypeScript is `strict: true` and passes clean.
- **Deployment:** Vercel, `main` branch, no preview-environment configuration beyond defaults, no deploy gate.
- **Environment variables:** only two, both optional and both consumed at `app/layout.tsx:29-33` — `NEXT_PUBLIC_SITE_URL` (explicit override) and `VERCEL_PROJECT_PRODUCTION_URL` (Vercel-provided), falling back to `https://anatomy-atelier.openai.site`. The fallback is a stale origin from the OpenAI Sites lineage. **No secrets exist anywhere in the repository** — correct, because there is nothing to authenticate to.
- **No `.env.example`**, so the two supported variables are undiscoverable without reading `layout.tsx`.

## 4.10 API and AI integrations

**API integrations: none.** No `app/api/` directory. `examples/d1/app/api/notes/route.ts` lives outside the App Router and is never mounted.

**AI integrations: none.** Despite the product framing, there is no LLM, no embeddings, no vector store, no speech, no vision, no recommendation logic, and no AI SDK in `package.json`. Every "intelligent" surface is static:

- The quiz (`AnatomyApp.tsx:302-308`) is one hardcoded question with three fixed options; **all three buttons call `onClose`.** A wrong answer and a right answer are indistinguishable. There is no scoring, no explanation, no adaptivity.
- All nine organs' content is hand-authored literal strings in `anatomy-data.ts`.
- The "lesson" modal shows one generic paragraph identical for every organ.

**This is the central gap between the product's positioning and its implementation, and Part 5 addresses it directly.**

## 4.11 Technical debt and dead code — itemized

| # | Item | Location | Impact |
|---|---|---|---|
| 1 | Stale starter tests, permanently failing | `tests/rendered-html.test.mjs` | `npm test` red; blocks CI |
| 2 | Starter README describing the wrong product | `README.md` | Misleads every new contributor |
| 3 | ESLint lints vendored Emscripten bundles → exit 1 | `eslint.config.mjs` | Blocks CI; one-line fix |
| 4 | Draco + Basis decoders never wired | `public/draco/`, `public/basis/` | 1.6 MB dead payload |
| 5 | `medicalRimNode` TSL export never imported | `app/lib/three/tsl-materials.ts` | Dead module |
| 6 | `AnatomyViewer.prefetch()` never called (UI uses raw `fetch`) | `viewer.ts:238-240` vs `AnatomyApp.tsx:107-111` | Duplicate prefetch logic, dead method |
| 7 | `illustrated` flag is `true` for all 9 organs | `anatomy-data.ts` | Entire `OrganArt` fallback branch unreachable |
| 8 | Drizzle + D1 stack fully installed, zero tables | `db/`, `drizzle/`, `drizzle.config.ts` | Dependency and cognitive weight for nothing |
| 9 | `chatgpt-auth.ts` never imported, unreachable on Vercel | `app/chatgpt-auth.ts` | 87 lines of dead auth |
| 10 | `worker/index.ts` never executes in production | `worker/index.ts` | Image optimization silently absent |
| 11 | `examples/d1/` starter leftovers | `examples/` | Noise |
| 12 | Tailwind 4 installed and imported, essentially unused | `globals.css:1`, `postcss.config.mjs` | 563 lines of hand-CSS alongside an unused framework |
| 13 | `next.config.ts` is an empty object | `next.config.ts` | No headers, no image config, no redirects |
| 14 | POSIX-only npm scripts | `package.json:9-12` | Windows contributors blocked, undocumented |
| 15 | Three dead nav buttons + hardcoded profile "MA" | `AnatomyApp.tsx:120-131` | Demo artifacts shipped to production |
| 16 | Quiz answers all identical (`onClose`) | `AnatomyApp.tsx:305-307` | Feature is theatre |
| 17 | Single route — no per-organ URL | `app/page.tsx` | No deep linking, no sharing, no SEO |
| 18 | `AnatomyApp.tsx` owns every concern at 335 lines | `AnatomyApp.tsx` | Primary refactor target |
| 19 | Stale fallback origin `anatomy-atelier.openai.site` | `layout.tsx:33` | Wrong OG assets if env vars are unset |
| 20 | No `robots.txt`, no `sitemap.xml`, no `manifest.json` | `public/` | PWA icons shipped with no manifest |
| 21 | No error boundary around the viewer | `OrganViewer.tsx` | A WebGL failure yields a blank panel |
| 22 | No WebGL-unsupported fallback | `viewer.ts:82` | `new WebGLRenderer` throws on unsupported hardware, uncaught |

**Refactoring opportunities, in priority order:**
1. Split `AnatomyApp.tsx` into `TopBar`, `OrganLibrary`, `InfoPanel`, `LearningCards`, `CompareStrip`, `LearningModal`.
2. Introduce `/organ/[id]` dynamic routes with `generateStaticParams()` — deep linking, SEO, and per-organ metadata in one change.
3. Move `anatomy-data.ts` behind a content interface so it can later be served from a CMS or database without touching components.
4. Delete items 4, 5, 6, 8, 9, 10, 11 above, or commit to Cloudflare and delete `vercel.json` instead. **Pick one target.**
5. Extract a `useAnatomyViewer()` hook to isolate the imperative Three.js bridge from `OrganViewer`'s presentation.

## 4.12 Scalability and maintainability

**Content scalability — the binding constraint.** Adding organ #10 today requires: authoring a GLB, hand-tuning six hotspot XYZ coordinates against the normalized `FIT_SIZE = 3.8` cube by trial and error, producing five WebP illustrations, and writing ~25 literal fields in `anatomy-data.ts`. There is no authoring tool, no validation, no preview. **This does not scale past roughly 20 organs, and a full K-12 anatomy curriculum needs 200+ structures.**

**Traffic scalability:** excellent by accident. Fully static, CDN-cacheable, no backend to saturate. A single school district's simultaneous load is a non-issue *today* — and becomes an entirely new problem the moment accounts and AI endpoints exist.

**Maintainability:** genuinely mixed. The `app/lib/three/` modules are among the better-documented graphics code you will find — comments explain *why*, including decisions that were tried and reverted. The application layer is the opposite: one monolithic component, dead code throughout, no tests, and a README for a different product.

**Current bus factor: 1.**

---

# Part 5 — Product Reimagination (Step 7)

## 5.1 Honest assessment of what exists

Anatomy Atelier is a **beautiful, technically accomplished 3D organ viewer.** The rendering engineering is real and hard-won. The visual design is distinctive — the atelier framing, the warm paper palette, the serif/script pairing — and it does not look like the sterile medical software that dominates this category.

It is **not yet a learning platform.** A learning platform must answer: *Who is the learner? What should they know? Did they learn it? What do we do about it if they didn't?* This product currently answers none of those. It has no learners, no curriculum, no assessment, and no feedback loop.

The gap is not a flaw — it is the roadmap.

## 5.2 Product vision

> **Anatomy Atelier becomes the AI teaching assistant for human biology in K-12 classrooms: every student explores a real 3D body at their own level, every question gets answered instantly and safely, and every teacher walks into class already knowing who is struggling and why.**

Three defensible pillars, in dependency order:

1. **See it** — segmented, layered, animated 3D anatomy that runs on the cheapest device in the room.
2. **Ask it** — a grounded, curriculum-aware AI tutor that answers a child's question about the exact structure they are looking at, in their reading level, and refuses to answer what it shouldn't.
3. **Prove it** — adaptive assessment and teacher analytics that convert exploration into evidence of learning, mapped to standards.

## 5.3 The four users

| User | What they need | What they get today |
|---|---|---|
| **Student (Grade 4–12)** | Curiosity satisfied instantly, at their level, in their language | A viewer and one fake quiz |
| **Teacher** | Ready-made lessons, class assignment, live progress, standards mapping | Nothing |
| **Principal / Education board** | Standards alignment, safety and compliance evidence, outcome data, procurement-ready pricing | Nothing |
| **Parent** | Visibility into what their child is learning; assurance about data and AI safety | Nothing |

## 5.4 Capability blueprint

### Pillar 1 — See it (3D that actually teaches)

- **Segmented models.** Re-author each GLB with named, hierarchical sub-meshes (`heart/left_ventricle`, `heart/mitral_valve`). This single asset change makes Isolate, Layers, Cross-section, and per-structure hotspots *actually work* rather than approximating.
- **Layer peeling.** Skin → fascia → muscle → skeleton → organs → vessels → nerves, with an opacity slider per layer.
- **Real 3D animation.** Skeletal/morph animation authored into the GLB: heart beating with valve motion, lungs inflating with diaphragm descent, peristalsis, blood flow particles. The mixer plumbing already exists (`loaders.ts:148-152`) and is waiting for content.
- **LOD + progressive streaming.** Ship a ~40k-triangle LOD0 that displays in under a second, stream LOD1 behind it. Non-negotiable for school Chromebooks.
- **Guided 3D tours.** Camera fly-throughs narrated step by step: "follow one red blood cell from the right atrium to the fingertip."
- **Body Explorer.** A full-body entry model where students click through to organs — the mental map the current organ-by-organ list cannot give them.
- **Draw-on-model annotation.** Students mark and label structures directly on the 3D surface; teachers grade the annotations.

### Pillar 2 — Ask it (the AI layer — this is the differentiator)

Every item below is currently absent and every one is genuinely achievable.

- **Context-aware Socratic tutor.** A chat panel that knows the current organ, the selected hotspot, the camera angle, the student's grade band, and their recent mistakes. Grounded strictly in a curated anatomy corpus via RAG — **no free-form model knowledge**, so hallucination risk is structurally bounded rather than merely prompted away. It asks guiding questions before giving answers.
- **Reading-level adaptation.** The same anatomical fact rendered for Grade 4 ("your heart is a muscle about as big as your fist") and Grade 11 ("the myocardium generates ~120 mmHg systolic pressure"). One content source, generated variants, teacher-reviewed and cached — not generated per request.
- **Ask-the-Organ.** Click any structure, ask anything about it, get an answer plus an automatic camera move to the structure being discussed. This is the demo that sells the product to a principal in fifteen seconds.
- **AI-generated adaptive assessment.** Replace the fake quiz with a real item bank: multiple choice, label-the-3D-model, drag-and-drop assembly, and short answer with AI rubric scoring. Difficulty adapts to performance. Every item is teacher-reviewable before it reaches a student.
- **Misconception detection.** Cluster wrong answers across a class to surface *why* students are wrong ("18 of 27 believe the left atrium pumps to the body"), then auto-suggest a targeted 3D micro-lesson. This is the feature teachers will pay for.
- **Lesson plan generator.** Teacher enters a standard code and a period length; the system produces objectives, a 3D tour sequence, discussion prompts, a differentiated worksheet, and an exit ticket.
- **Voice narration and voice questions.** Critical for early grades, striving readers, and students with dyslexia or visual impairment.
- **Multilingual delivery.** Content and tutor in the languages a district actually serves — a major procurement differentiator in India, the US, and the EU.
- **Safety layer, non-negotiable.** Input and output moderation, strict topic scoping, an age-appropriateness filter, a self-harm/medical-advice escalation path, full audit logging of every AI interaction, and a teacher-visible transcript. **Anatomy is a subject where a child can and will ask questions that require careful handling.** This must be designed first, not bolted on.

### Pillar 3 — Prove it (school workflow)

- **Roles and rostering** — student / teacher / admin / parent, with Google Classroom, Clever, and ClassLink sync, plus **LTI 1.3** for LMS integration (Canvas, Moodle, Schoology).
- **Standards alignment** — NGSS (MS-LS1-3, HS-LS1-2), CBSE/NCERT, and state frameworks, mapped per lesson and per item.
- **Assignments** — teacher assigns an organ, tour, or assessment with a due date; students complete it inside the platform.
- **Teacher dashboard** — live class progress, mastery heatmap by structure, misconception clusters, time-on-task, and per-student drill-down.
- **Student progress** — mastery map of the body, streaks, badges, spaced-repetition review queue.
- **Parent portal** — a weekly digest of what the child explored and mastered.
- **Offline / low-bandwidth mode** — PWA with pre-cached models for a lab full of tablets on one shared connection. The PWA icons already ship; the manifest does not.
- **Accessibility to WCAG 2.2 AA** — a legal procurement requirement for most public districts, and a genuine one for the students it serves.
- **Compliance** — FERPA, COPPA, GDPR, and a published data-processing agreement, plus SOC 2 readiness for district-level sales.

### Pillar 4 — Delight (adoption drivers)

- **Classroom mode** — teacher's 3D view mirrored to every student device; live pointing and annotation.
- **Dissection simulator** — safe, ethical virtual dissection with guided steps.
- **Case studies** — age-appropriate clinical vignettes ("Maya is short of breath — explore why").
- **AR mode** — WebXR; place a beating heart on the classroom desk.
- **Multiplayer study rooms** — students explore the same model together with voice.
- **Health literacy modules** — nutrition, sleep, exercise, and puberty tied to the organ systems they affect.

## 5.5 Why this wins

Competitors (Visible Body, Complete Anatomy, BioDigital) are **medical-school products sold down-market into K-12**. They are dense, expensive, clinically-pitched, and pedagogically thin at the school level. Anatomy Atelier's opening is precise: **K-12-native, beautiful rather than clinical, AI-tutored, teacher-workflow-first, and it runs on a school Chromebook.** The existing visual identity — which is genuinely distinctive — is a real asset, not a coat of paint.

---

# Part 6 — Implementation Blueprint (Step 8)

Effort is expressed in engineer-weeks for a team of 4–6 (2 frontend, 1 backend/AI, 1 3D/technical artist, 1 designer, 0.5 curriculum specialist). `P0` = must ship before anything else depends on it.

---

## PHASE 0 — Stabilize the Foundation
**Duration: 2–3 weeks · Priority: P0 · Effort: ~8 engineer-weeks**

Nothing in Phases 1–4 is safe to build until this is done. This phase adds no user-visible features and is the highest-ROI work in the plan.

### 0.1 Choose one deployment target

- **Business objective:** Stop paying maintenance on two architectures, one of which is inert.
- **Technical approach:** Commit to **Vercel + Next.js**. Delete `worker/`, `vite.config.ts`, `build/sites-vite-plugin.ts`, `.openai/`, `examples/`, `drizzle*`, `db/`, and the `vinext`/`wrangler`/`@cloudflare/*` dependencies. Rewrite `package.json` scripts to plain, cross-platform `next dev` / `next build` / `next start`. Restore a database later on the chosen platform (Postgres via Neon or Supabase).
- **Files affected:** `package.json`, `vite.config.ts`, `worker/`, `build/`, `db/`, `drizzle/`, `examples/`, `.openai/`, `.vercelignore`, `tsconfig.json`.
- **Dependencies:** none. **Effort:** 3 days. **Risk:** low — verified that `next build` alone succeeds.
- **Acceptance:** `npm run dev` and `npm run build` work on Windows, macOS, and Linux with no env prefix; ~200 KB of dead config and ~1.6 MB of dead decoders removed; production deploy unchanged in behaviour.

### 0.2 Fix lint and establish CI

- **Business objective:** Make quality automatic rather than aspirational.
- **Technical approach:** Add `public/**` to `globalIgnores` in `eslint.config.mjs`. Add a GitHub Actions workflow running install → lint → typecheck → test → build on every PR, with branch protection on `main`.
- **Effort:** 2 days. **Risk:** low.
- **Acceptance:** `npm run lint` exits 0; no PR can merge red.

### 0.3 Replace the test suite

- **Business objective:** Make regressions in the 3D pipeline visible before students see them.
- **Technical approach:** Delete `tests/rendered-html.test.mjs`. Add Vitest unit tests (`anatomy-data` integrity, `snapToSurface`, LRU eviction, `safeRelativeReturnPath`), React Testing Library component tests (organ selection, search filter, modal open/close), and Playwright E2E covering load → select organ → open hotspot → open modal, including a WebGL smoke test on a real headless GPU context.
- **Effort:** 1.5 weeks. **Risk:** medium — WebGL in CI needs `--use-gl=swiftshader`.
- **Acceptance:** ≥70% coverage on `app/lib/`; E2E green in CI; `npm test` exits 0.

### 0.4 Per-organ routes

- **Business objective:** Deep linking, sharing, and SEO — a teacher must be able to send a class one link.
- **Technical approach:** Convert to `app/organ/[id]/page.tsx` with `generateStaticParams()` over the nine organ IDs and `generateMetadata()` for per-organ title, description, and OG image. Redirect `/` to `/organ/heart`. Lift `organId` from `useState` into the route.
- **Files affected:** `app/page.tsx`, new `app/organ/[id]/page.tsx`, `AnatomyApp.tsx`, `next.config.ts`.
- **Effort:** 3 days. **Risk:** low.
- **Acceptance:** All nine organs have unique indexable URLs, correct OG cards, and browser back/forward works.

### 0.5 Accessibility remediation

- **Business objective:** WCAG 2.2 AA is a procurement gate for public school districts.
- **Technical approach:** Add focus trap, focus restore, and Escape handling to `LearningModal`. Wire `usePrefersReducedMotion()` into the GSAP timelines and `controls.autoRotate`. Add a skip link. Add `type="button"` throughout. Make hotspots keyboard-selectable via a roving tabindex list synced to the sprite layer. Run a full contrast audit and raise the muted palette and the 8–11px labels to compliant values. Add an error boundary and a WebGL-unsupported fallback around the viewer.
- **Files affected:** `AnatomyApp.tsx`, `OrganViewer.tsx`, `globals.css`, `viewer.ts`, new `app/hooks/`.
- **Effort:** 1.5 weeks. **Risk:** low. **Note:** the reduced-motion fix is a genuine accommodation issue, not a checkbox.
- **Acceptance:** axe-core reports zero critical/serious violations; full keyboard traversal verified; NVDA and VoiceOver pass; reduced-motion stops all animation including auto-rotate.

### 0.6 Security headers, PWA, SEO, and docs

- **Technical approach:** Add CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS via `next.config.ts` headers. Add `manifest.json`, `robots.txt`, and `sitemap.ts`. Enable Dependabot. Rewrite `README.md` to describe **this** product: architecture, model authoring, hotspot coordinate authoring against `FIT_SIZE = 3.8`, and deployment. Add `.env.example` and `CONTRIBUTING.md`.
- **Effort:** 4 days. **Risk:** low — CSP must be tested against Three.js worker/WASM usage.
- **Acceptance:** securityheaders.com grade A; PWA installable; README onboards a new engineer without assistance.

### 0.7 Component decomposition

- **Technical approach:** Split `AnatomyApp.tsx` into `TopBar`, `OrganLibrary`, `InfoPanel`, `LearningCards`, `CompareStrip`, `LearningModal`. Extract `useAnatomyViewer()`. Move `anatomy-data.ts` behind a `ContentProvider` interface. Delete `tsl-materials.ts`, the unused `viewer.prefetch()`, and the `illustrated` fallback branch.
- **Effort:** 1 week. **Risk:** low with tests from 0.3 in place. **Sequence after 0.3.**
- **Acceptance:** No component exceeds 150 lines; all tests still green; zero behavioural change.

---

## PHASE 1 — Make the 3D Actually Teach
**Duration: 6–8 weeks · Priority: P0 · Effort: ~20 engineer-weeks**

### 1.1 Segmented, layered models *(highest leverage in the entire plan)*

- **Business objective:** Deliver the tools the UI already advertises. Today Isolate and Layers do not do what their labels say.
- **Educational value:** Layer peeling and structure isolation are *the* pedagogical primitives of anatomy teaching. Without them this is a picture, not a dissection.
- **Technical approach:** Re-author all nine GLBs with named hierarchical sub-meshes and a `structures.json` manifest per organ. Extend `AnatomyAssetManager` to index meshes by structure ID. Rewrite `toggleIsolate()` and `toggleLayers()` to operate per structure. Derive hotspot anchors from structure bounding-box centroids — **eliminating hand-authored XYZ coordinates entirely.**
- **Files affected:** `public/models/*.glb`, `loaders.ts`, `viewer.ts`, `hotspots.ts`, `anatomy-data.ts`.
- **Dependencies:** 3D artist capacity; Blender/gltf-transform pipeline.
- **Effort:** 6 weeks (4 asset, 2 engineering). **Risk: HIGH** — asset re-authoring is the long pole and cannot be parallelized away. Start it on day one of the phase.
- **Acceptance:** Every organ exposes ≥6 named structures; clicking a structure isolates and labels it; layer peeling works on at least the skin and heart models; no hand-authored hotspot coordinates remain.

### 1.2 LOD and progressive streaming

- **Business objective:** Work on the cheapest device in the room — the actual purchasing constraint in K-12.
- **Technical approach:** Generate LOD0 (~40k triangles) and LOD1 (~350k) with `gltf-transform simplify`. Load LOD0 first, swap to LOD1 on idle. Cap by `hardwareConcurrency` and `deviceMemory`. Add KTX2/Basis texture compression — and **actually wire `KTX2Loader`**, which finally justifies the `public/basis/` payload that is dead today.
- **Effort:** 2 weeks. **Risk:** medium — visual quality regression at LOD0 needs art review.
- **Acceptance:** First meaningful 3D paint under 1.5s on a 4-core Chromebook over 10 Mbps; peak memory under 300 MB.

### 1.3 Real 3D animation

- **Technical approach:** Author skeletal/morph animation into the GLBs (heartbeat with valve motion, lung inflation with diaphragm, peristalsis). The `AnimationMixer` path already exists in `loaders.ts:148-152` and is unused because no GLB has clips. Add play/pause/scrub UI. Replace the CSS-heartbeat modal.
- **Effort:** 3 weeks (mostly asset). **Risk:** medium.
- **Acceptance:** ≥5 organs animate in 3D with scrub control; the "Animate" button opens the real thing.

### 1.4 Body Explorer + guided tours

- **Technical approach:** A full-body entry model with clickable systems drilling into organs. A declarative tour format (`{ camera, target, structure, narration, duration }[]`) driven by the existing GSAP timeline infrastructure.
- **Effort:** 3 weeks. **Risk:** low-medium.
- **Acceptance:** Body Explorer reaches all nine organs; ≥3 narrated tours ship; tours are keyboard-navigable and respect reduced-motion.

---

## PHASE 2 — Accounts, Curriculum, and the Teacher Workflow
**Duration: 8–10 weeks · Priority: P0 · Effort: ~28 engineer-weeks**

### 2.1 Backend foundation

- **Technical approach:** Postgres (Neon/Supabase) + Drizzle — reusing the ORM already in `package.json`. Core schema: `organizations`, `users`, `roles`, `classes`, `enrollments`, `content_items`, `assignments`, `submissions`, `progress_events`, `ai_interactions`. Auth via NextAuth/Auth.js with Google Workspace for Education SSO. Route handlers under `app/api/` with Zod validation and rate limiting from day one.
- **Effort:** 4 weeks. **Risk:** medium — **this is where FERPA/COPPA/GDPR obligations attach.** Involve legal before the schema is finalized, not after.
- **Acceptance:** SSO works; RBAC enforced server-side on every endpoint; PII encrypted at rest; audit log on all student-data access; documented retention and deletion policy.

### 2.2 Content management for curriculum

- **Business objective:** Break the content ceiling. Adding an organ must not require a code deploy.
- **Technical approach:** Move `anatomy-data.ts` into the database behind the `ContentProvider` interface from 0.7. Build an internal authoring UI: organ metadata, structures, per-grade-band content variants, media, and standards tags. Version and publish-gate all content.
- **Effort:** 4 weeks. **Risk:** medium.
- **Acceptance:** A curriculum specialist adds a complete organ end to end with no engineering involvement.

### 2.3 Standards alignment and lesson library

- **Technical approach:** Import NGSS and CBSE/NCERT taxonomies; tag every content item and assessment. Build lesson objects composing tours, readings, and assessments. Ship 20 teacher-authored lessons across grade bands 4–5, 6–8, and 9–12.
- **Effort:** 3 weeks engineering + curriculum specialist time. **Risk:** low.
- **Acceptance:** Every lesson maps to ≥1 standard; teachers can filter the library by standard and grade.

### 2.4 Rostering, assignments, and the teacher dashboard

- **Technical approach:** Google Classroom + Clever + ClassLink sync; LTI 1.3 for Canvas/Moodle/Schoology. Assignment creation, distribution, and submission. Teacher dashboard with class progress, per-structure mastery heatmap, and student drill-down.
- **Effort:** 5 weeks. **Risk:** medium-high — LTI 1.3 certification is genuinely fiddly and schedule-risky. Budget for it explicitly.
- **Acceptance:** A teacher rosters a class, assigns a lesson, and sees live completion; LTI launch verified in Canvas.

### 2.5 Real assessment engine

- **Technical approach:** Replace the fake quiz entirely. Item bank supporting multiple choice, **label-the-3D-model** (the format only this product can offer), drag-and-drop assembly, ordering, and short answer. Immediate feedback with explanations. Spaced-repetition review queue.
- **Files affected:** `LearningModal` (deleted and rebuilt), new `app/assessment/`.
- **Effort:** 4 weeks. **Risk:** low-medium.
- **Acceptance:** ≥200 items across nine organs and three grade bands; correct/incorrect are distinguishable and explained; scores persist and roll up to the dashboard.

---

## PHASE 3 — The AI Layer
**Duration: 10–12 weeks · Priority: P1 · Effort: ~32 engineer-weeks**

**Sequencing note:** this phase depends on Phase 2's content model and audit infrastructure. Building AI before accounts and logging exist would create an unauditable system handling children's questions — an unacceptable position for a school product.

### 3.1 Grounded RAG tutor

- **Business objective:** The core differentiator. This is what makes it an *AI* platform rather than a viewer with a chatbot bolted on.
- **Educational value:** Every student gets an always-available, patient, Socratic tutor at their exact level.
- **Technical approach:** Curate an anatomy corpus (platform content + vetted references), chunk and embed into pgvector. Retrieval is filtered by current organ, selected structure, and grade band. Generation is **strictly grounded** — every claim cites a retrieved chunk; if retrieval returns nothing relevant, the tutor says it doesn't know and offers to ask the teacher. Streaming responses. Full conversation persistence to `ai_interactions`.
- **Files affected:** new `app/api/tutor/`, new `app/components/TutorPanel.tsx`, `viewer.ts` (expose camera and selection context).
- **Effort:** 6 weeks. **Risk: HIGH** — hallucination in an educational medical context is the single largest product risk. Grounding is the mitigation; "prompt engineering" alone is not.
- **Acceptance:** ≥95% of responses cite retrieved sources; a red-team set of 200 adversarial and off-topic prompts produces zero ungrounded medical claims; p95 first token under 1.5s.

### 3.2 AI safety layer *(build before 3.1 ships to any student)*

- **Technical approach:** Input moderation, topic scoping to anatomy and health education, output moderation, age-appropriateness filtering by grade band, and an escalation path for self-harm, abuse disclosure, and personal medical-advice requests that routes to a designated adult rather than to a model. Immutable audit log. Teacher-visible transcripts. Per-student rate limiting.
- **Effort:** 3 weeks. **Risk: HIGH.**
- **Acceptance:** Red-team suite passes across all categories; every escalation path verified end to end; a teacher can review any student's full transcript; retention policy enforced.
- **This is a gating requirement, not a feature. It ships first or the tutor does not ship.**

### 3.3 Reading-level adaptation

- **Technical approach:** Generate Grade 4–5, 6–8, and 9–12 variants of every content item offline. **Teacher/curriculum review before publication** — not generated live per request. Cache aggressively; automatic level selection from the student's grade with manual override.
- **Effort:** 3 weeks. **Risk:** medium — quality requires human review in the loop, and the review capacity must be budgeted.
- **Acceptance:** All content available at three levels; Flesch-Kincaid within target band; 100% human-reviewed before publish.

### 3.4 Ask-the-Organ *(the demo that sells the product)*

- **Technical approach:** Select a structure, ask a question, receive a grounded answer *plus an automatic camera move* to the structure under discussion. Bridges the tutor to the viewer via the existing imperative camera API.
- **Effort:** 2 weeks (on top of 3.1). **Risk:** low.
- **Acceptance:** Answer and camera move are synchronized; works by voice.

### 3.5 AI-assisted assessment and misconception detection

- **Technical approach:** Generate candidate items from content, **always teacher-reviewed before release**. AI rubric scoring for short answers with confidence thresholds — low-confidence scores route to the teacher. Cluster wrong answers across a class to surface named misconceptions and suggest targeted micro-lessons.
- **Effort:** 5 weeks. **Risk:** medium-high — auto-scoring student work carries real fairness obligations. Always allow teacher override; never auto-post a grade without review.
- **Acceptance:** Generated items pass teacher review ≥80% of the time; rubric scoring agrees with teacher scoring ≥85%; misconception clusters are validated against real class data.

### 3.6 Lesson plan generator

- **Technical approach:** Teacher inputs standard code, grade, and period length; system outputs objectives, tour sequence, discussion prompts, differentiated worksheet, and exit ticket — all fully editable and saveable to the lesson library.
- **Effort:** 3 weeks. **Risk:** low.
- **Acceptance:** A teacher produces a usable 45-minute lesson in under 3 minutes.

### 3.7 Voice and multilingual

- **Technical approach:** TTS narration for all content; STT for spoken questions. Translation of content and tutor into district-required languages with native-speaker review of published content.
- **Effort:** 4 weeks. **Risk:** medium — translation quality for anatomical terminology requires expert review, not machine output alone.
- **Acceptance:** Full narration; voice questions work in a noisy classroom; ≥3 languages ship reviewed.

---

## PHASE 4 — Scale, Delight, and Go-to-Market
**Duration: 8–10 weeks · Priority: P2 · Effort: ~24 engineer-weeks**

| Item | Value | Effort | Risk |
|---|---|---|---|
| Offline PWA with pre-cached models | Low-bandwidth schools; a genuine competitive moat in emerging markets | 3 wks | Med — storage quota management |
| Classroom mode (teacher view mirrored live) | The highest-impact in-class feature; WebSocket/Durable Object fan-out | 4 wks | Med |
| Parent portal + weekly digest | Drives household advocacy and renewal | 2 wks | Low |
| Virtual dissection simulator | Ethical, repeatable, zero consumables budget | 5 wks | Med-high |
| WebXR / AR mode | Marketing and demo impact; genuine spatial understanding gain | 4 wks | Med |
| Clinical case studies | Connects anatomy to lived experience; strong engagement | 3 wks | Low |
| Multiplayer study rooms | Peer learning; retention | 4 wks | Med |
| Admin analytics + district reporting | Required for renewal conversations and board reporting | 3 wks | Low |
| Health literacy modules | Broadens curriculum footprint beyond biology | 3 wks | Low |
| SOC 2 Type II readiness | Unlocks large district and board procurement | 6 wks | Med |

---

## 6.1 Cross-cutting engineering standards

Adopt from Phase 0 onward, applied to every subsequent phase:

- **Definition of done:** tests written, a11y verified, docs updated, feature-flagged, observable.
- **Performance budget:** initial JS ≤ 250 KB gzipped (excluding the lazy viewer chunk); LCP ≤ 2.0s on a simulated school Chromebook; time-to-first-3D ≤ 1.5s.
- **Accessibility budget:** zero axe-core critical/serious violations; every feature keyboard-complete before merge.
- **AI governance:** every model call logged with prompt, retrieved context, response, latency, and cost; a published model card; a documented human-in-the-loop review process for all student-facing generated content.
- **Observability:** Sentry for errors, OpenTelemetry traces, Web Vitals RUM, and a per-tenant AI cost dashboard.
- **Feature flags** on every phase-2+ capability, enabling per-district staged rollout.

## 6.2 Consolidated risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **3D asset re-authoring (1.1) slips** — the long pole of Phase 1 | High | High | Start day one of Phase 1; contract additional 3D artists; ship organ-by-organ behind flags rather than as one release |
| **AI hallucination reaches a student** | Medium | **Critical** | Strict RAG grounding with mandatory citations; refuse-when-unretrieved; red-team suite in CI; teacher-visible transcripts |
| **Child-safety incident via the tutor** | Low | **Critical** | Safety layer (3.2) gates the tutor's release; escalation to a designated adult; immutable audit log |
| **FERPA/COPPA/GDPR non-compliance blocks sales** | Medium | **Critical** | Legal review before the Phase 2 schema is finalized; privacy-by-design; DPA published before first pilot |
| **Performance regression on school hardware** | Medium | High | LOD pipeline (1.2); performance budget in CI; test on a real low-end Chromebook every sprint |
| **LTI 1.3 certification delays Phase 2** | Medium | Medium | Start certification early; ship Google Classroom sync first as the fallback path |
| **AI inference cost per student exceeds pricing** | Medium | High | Aggressive caching of generated variants; small models for classification; per-tenant cost dashboard from day one |
| **Teacher adoption fails despite good product** | Medium | High | Teacher-workflow-first sequencing (Phase 2 before Phase 3); design-partner schools from Phase 0 |
| **Bus factor of 1 on the 3D engine** | **Currently certain** | High | Pair on `app/lib/three/`; the existing inline documentation is a strong starting point; formalize it into an architecture doc during Phase 0.6 |

## 6.3 Recommended sequence

```
Weeks 1–3     Phase 0   Stabilize                      ← start here, no exceptions
Weeks 3–11    Phase 1   3D that teaches                (asset work starts week 3)
Weeks 9–19    Phase 2   Accounts + curriculum          (overlaps Phase 1 from week 9)
Weeks 17–29   Phase 3   AI layer                       (safety 3.2 gates 3.1)
Weeks 27–37   Phase 4   Scale + delight
```

**Two hard sequencing constraints:**
1. Phase 1.1 (segmented models) is the long pole. It must start the day Phase 1 opens.
2. Phase 3.2 (AI safety) must complete before Phase 3.1 (tutor) is exposed to any student.

## 6.4 The first four weeks, concretely

If only one month of work is authorized, do exactly this — it is the highest-value month available:

1. **Week 1** — Delete the Cloudflare target (0.1). Fix lint and add CI (0.2). Rewrite the README (0.6).
2. **Week 2** — Replace the test suite (0.3). Add per-organ routes (0.4).
3. **Week 3** — Accessibility remediation (0.5), especially modal focus management and the reduced-motion fix.
4. **Week 4** — Security headers, PWA manifest, SEO (0.6). Decompose `AnatomyApp.tsx` (0.7). **Begin 3D asset segmentation (1.1) in parallel** — it is the long pole and every week it waits is a week the roadmap slips.

At the end of that month the repository is honest, tested, gated, accessible, deep-linkable — and the asset work that everything else depends on is already moving.

---

# Appendix A — Verified Command Log

```
git clone https://github.com/anjinapp-aryan/anatomy   → OK
git rev-parse --abbrev-ref HEAD                       → main
git log -1                                            → c44eaa0e5bb0670925a49c6c76eba06f123487ef
git status --porcelain                                → (clean)
npm install                                           → 517 packages, exit 0
npx next build                                        → exit 0, 3 static pages
npx vinext build                                      → OK, chunk-size warning
npx eslint .                                          → EXIT 1 (vendor files in public/)
node --test tests/rendered-html.test.mjs              → 2 tests, 2 FAILED
```

# Appendix B — Key File Reference

| Concern | File | Lines |
|---|---|---|
| Application shell, all UI state | `app/components/AnatomyApp.tsx` | 335 |
| Canvas host, tool rail, a11y index | `app/components/OrganViewer.tsx` | 189 |
| Three.js scene, render loop, tools | `app/lib/three/viewer.ts` | 643 |
| GLTF loading, normalization, LRU | `app/lib/three/loaders.ts` | 214 |
| Hotspot sprites, surface snapping | `app/lib/three/hotspots.ts` | 372 |
| Content (9 organs, hardcoded) | `app/lib/anatomy-data.ts` | 312 |
| All styling | `app/globals.css` | 563 |
| Metadata, fonts, OG | `app/layout.tsx` | 85 |
| Unused auth helpers | `app/chatgpt-auth.ts` | 87 |
| Inert Cloudflare worker | `worker/index.ts` | 48 |
| Failing starter tests | `tests/rendered-html.test.mjs` | 92 |
