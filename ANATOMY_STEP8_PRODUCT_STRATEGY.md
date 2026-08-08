# Anatomy Atelier — Step 8: Product Strategy & Prioritization

**Author role:** Chief Product Officer + Principal Software Architect
**Date:** 2026-08-06
**Baseline:** commit `c44eaa0e5bb0670925a49c6c76eba06f123487ef` (branch `main`, clean)
**Companion document:** `ANATOMY_ANALYSIS_AND_BLUEPRINT.md` (Steps 1–7)

---

# 0. The Strategic Position, Stated Plainly

Before prioritizing anything, the team needs to agree on what actually exists today.

**What we have:** a genuinely beautiful, technically excellent 3D organ viewer. The rendering engine in `app/lib/three/` is better than most commercial equivalents — render-on-demand, depth prepass, cone-filtered hotspot snapping, disciplined GPU disposal. The visual identity is distinctive and does not look like clinical medical software.

**What we do not have:** a learning platform. There are no learners, no curriculum, no assessment, no teacher, no data, and no AI. The quiz at `AnatomyApp.tsx:302-308` has three answer buttons that all call `onClose` — right and wrong are indistinguishable. Three of five navigation items do nothing. The 3D tools named "Isolate" and "Layers" cannot work as labeled because every GLB contains exactly one mesh.

**The strategic consequence, and the single most important judgment in this document:**

> The product's biggest risk is not that we build too little. It is that we build a wide, shallow platform — accounts, dashboards, chat, gamification — on top of 3D assets that still cannot do what the buttons already promise. **Fixing the models is worth more than any three software features on this list.**

Everything below flows from that.

## 0.1 Three prioritization principles

**Principle 1 — Honesty before expansion.**
Ship nothing new that sits on top of something broken. Three dead nav buttons, a fake quiz, and two 3D tools that do not work are *demo liabilities*: a principal who clicks "Layers" and sees a wireframe instead of peeled tissue has learned that our claims are decorative. Removing or fixing these outranks adding features.

**Principle 2 — Depth over breadth for the demo.**
A principal does not buy a feature list. They buy one moment of "our students will love this and our teachers will actually use it." Three features executed to excellence beat fifteen at 70%. We will deliberately cut popular-sounding items (AR, multiplayer, gamification) from the MVP.

**Principle 3 — Teacher workflow before student delight.**
Every K-12 edtech graveyard is full of products students enjoyed and teachers abandoned. The purchase decision, the rollout decision, and the renewal decision are all made by adults. We sequence teacher productivity ahead of student gamification, deliberately, even though the latter demos more easily.

## 0.2 What we are explicitly choosing NOT to build

Stated up front so it is a decision, not an omission:

| Not building now | Why not |
|---|---|
| AR / WebXR | High demo dazzle, near-zero classroom minutes. Most school devices cannot run it well. Pure novelty until the core teaches. |
| Multiplayer study rooms | Real-time infrastructure cost, moderation burden, child-safety surface — before we have proven single-player learning works. |
| Points / streaks / leaderboards | Extrinsic motivation that teachers frequently disable. Adds engagement metrics that flatter us and teach nothing. |
| Virtual dissection simulator | Genuinely valuable, genuinely expensive. Requires segmented models (F09) to exist first anyway. |
| Full clinical case library | Depends on curriculum infrastructure that does not exist yet. |
| Native mobile apps | PWA covers the school-device reality. Native is a distribution decision, not a product one. |

---

# 1. Evaluation Framework

Each of the 42 candidate features is scored 1–5 on ten criteria.

**Value criteria (higher is better):**

| Criterion | What a 5 means |
|---|---|
| **Educational Value (EDU)** | Directly causes measurable learning of anatomy content |
| **Student Engagement (ENG)** | Students voluntarily spend more time and return |
| **Teacher Productivity (TCH)** | Saves a teacher real preparation or grading hours per week |
| **Principal Demo Value (DEMO)** | Visibly impressive in a 20-minute live demonstration |
| **Parent Trust (PAR)** | Increases parent confidence in safety, transparency, and value |
| **Accessibility (A11Y)** | Extends usable access to more learners (disability, language, device, bandwidth) |
| **Maintainability (MNT)** | Low ongoing burden; degrades gracefully; easy to hand over |
| **Scalability (SCL)** | Holds up from one classroom to a district without redesign |

**Cost criteria (higher = worse, shown inverted in the composite):**

| Criterion | What a 5 means |
|---|---|
| **Engineering Complexity (CPX)** | Novel, risky, or deeply cross-cutting work |
| **Development Cost (COST)** | Large calendar time or specialist headcount (3D artists, curriculum staff, legal) |

**Composite** = (EDU + ENG + TCH + DEMO + PAR + A11Y + MNT + SCL) − (CPX + COST). Range −10 to +40.

**The composite informs priority; it does not decide it.** Three overrides apply:

- **Dependency override** — a low-scoring enabler that unblocks high scorers is promoted (e.g. accounts, CMS).
- **Safety/compliance override** — child-safety and legal requirements are P0 regardless of score. They are gates, not features.
- **Credibility override** — anything currently shipping a false promise is promoted, because leaving it is worse than never having built it.

## 1.1 Priority definitions

| Priority | Definition | Gate |
|---|---|---|
| **P0 — Must Have** | Required before demonstrating to schools | Nothing ships to a principal without these |
| **P1 — High Priority** | Required for pilot deployment in real classrooms | v1.0 release gate |
| **P2 — Medium Priority** | Significant value after launch | Post-pilot |
| **P3 — Nice to Have** | Future differentiation | Roadmap |

---

# 2. Master Prioritization Table

All 42 features, sorted by priority then composite score.

| ID | Feature | EDU | ENG | TCH | DEMO | PAR | A11Y | MNT | SCL | CPX | COST | **Score** | **Pri** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F09 | Segmented, layered 3D models | 5 | 5 | 4 | 5 | 3 | 3 | 4 | 4 | 4 | 5 | **24** | **P0** |
| F05 | Accessibility remediation | 4 | 2 | 3 | 3 | 5 | 5 | 5 | 4 | 2 | 2 | **27** | **P0** |
| F02 | Lint fix + CI gate | 1 | 1 | 1 | 1 | 2 | 2 | 5 | 5 | 1 | 1 | **16** | **P0** |
| F03 | Real test suite | 2 | 1 | 2 | 1 | 3 | 3 | 5 | 5 | 3 | 3 | **16** | **P0** |
| F01 | Single deployment target | 1 | 1 | 1 | 1 | 1 | 1 | 5 | 5 | 2 | 1 | **13** | **P0** |
| F04 | Per-organ routes (deep linking) | 3 | 3 | 5 | 3 | 3 | 3 | 4 | 5 | 1 | 1 | **27** | **P0** |
| F32 | Real assessment engine | 5 | 4 | 5 | 5 | 4 | 3 | 4 | 4 | 3 | 3 | **28** | **P0** |
| F17 | AI safety layer | 3 | 1 | 3 | 3 | 5 | 4 | 3 | 4 | 4 | 3 | **19** | **P0** |
| F18 | Grounded RAG tutor | 5 | 5 | 4 | 5 | 3 | 5 | 3 | 4 | 5 | 5 | **24** | **P0** |
| F19 | Ask-the-Organ (context + camera) | 5 | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 2 | 2 | **29** | **P0** |
| F13 | Guided narrated tours | 5 | 4 | 5 | 5 | 4 | 5 | 4 | 4 | 2 | 3 | **31** | **P0** |
| F08 | Error boundary + WebGL fallback | 2 | 2 | 3 | 4 | 3 | 5 | 5 | 4 | 1 | 1 | **26** | **P0** |
| F39 | Compliance posture (documented) | 2 | 1 | 3 | 4 | 5 | 3 | 4 | 5 | 2 | 2 | **23** | **P0** |
| F06 | Security headers + PWA + SEO + docs | 2 | 1 | 2 | 2 | 4 | 3 | 5 | 5 | 1 | 1 | **22** | **P0** |
| F10 | LOD + progressive streaming | 3 | 4 | 3 | 4 | 3 | 5 | 4 | 5 | 3 | 3 | **25** | **P0** |
| F07 | Component decomposition | 1 | 1 | 1 | 1 | 1 | 1 | 5 | 5 | 2 | 2 | **12** | **P0** |
| F20 | Reading-level adaptation | 5 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | 3 | 4 | **26** | **P1** |
| F26 | Accounts, roles, SSO | 3 | 3 | 5 | 3 | 4 | 3 | 4 | 5 | 4 | 4 | **22** | **P1** |
| F39b | Compliance implementation (FERPA/COPPA/GDPR) | 2 | 1 | 3 | 3 | 5 | 3 | 4 | 5 | 4 | 4 | **18** | **P1** |
| F31 | Teacher dashboard + analytics | 4 | 2 | 5 | 5 | 4 | 3 | 4 | 4 | 3 | 3 | **28** | **P1** |
| F30 | Assignments | 4 | 3 | 5 | 4 | 4 | 3 | 4 | 5 | 2 | 2 | **28** | **P1** |
| F27 | Content management system | 4 | 2 | 4 | 2 | 3 | 3 | 5 | 5 | 3 | 4 | **21** | **P1** |
| F28 | Standards alignment + lesson library | 5 | 2 | 5 | 5 | 4 | 3 | 4 | 4 | 2 | 4 | **26** | **P1** |
| F11 | Real 3D animation | 5 | 5 | 3 | 5 | 3 | 3 | 3 | 4 | 3 | 5 | **23** | **P1** |
| F12 | Body Explorer (full-body entry) | 5 | 5 | 3 | 5 | 3 | 3 | 4 | 4 | 3 | 4 | **25** | **P1** |
| F22 | Misconception detection | 5 | 2 | 5 | 5 | 3 | 3 | 3 | 4 | 4 | 3 | **23** | **P1** |
| F24 | Voice narration + voice questions | 4 | 4 | 2 | 4 | 3 | 5 | 3 | 4 | 3 | 3 | **22** | **P1** |
| F29 | Rostering + LTI 1.3 | 2 | 1 | 5 | 3 | 3 | 3 | 3 | 5 | 4 | 4 | **17** | **P1** |
| F33 | Student progress / mastery map | 4 | 5 | 4 | 4 | 4 | 3 | 4 | 4 | 2 | 3 | **27** | **P1** |
| F35 | Offline PWA model caching | 3 | 3 | 3 | 3 | 3 | 5 | 3 | 5 | 4 | 3 | **21** | **P1** |
| F21 | AI assessment generation + rubric scoring | 4 | 3 | 5 | 4 | 3 | 3 | 3 | 4 | 4 | 4 | **21** | **P1** |
| F23 | AI lesson plan generator | 3 | 1 | 5 | 5 | 3 | 3 | 3 | 4 | 3 | 3 | **21** | **P2** |
| F34 | Parent portal | 3 | 2 | 2 | 4 | 5 | 3 | 3 | 4 | 2 | 2 | **22** | **P2** |
| F36 | Classroom mode (mirrored view) | 4 | 5 | 5 | 5 | 3 | 3 | 2 | 3 | 4 | 4 | **22** | **P2** |
| F25 | Multilingual | 4 | 3 | 3 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **24** | **P2** |
| F14 | Draw-on-model annotation | 4 | 5 | 4 | 4 | 3 | 3 | 3 | 3 | 4 | 3 | **22** | **P2** |
| F42 | Clinical case studies | 5 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 2 | 4 | **26** | **P2** |
| F38 | Admin / district analytics | 2 | 1 | 3 | 5 | 3 | 2 | 3 | 5 | 3 | 3 | **18** | **P2** |
| F41 | Health literacy modules | 4 | 3 | 3 | 4 | 5 | 4 | 4 | 4 | 2 | 4 | **25** | **P2** |
| F15 | Virtual dissection simulator | 5 | 5 | 3 | 5 | 4 | 3 | 2 | 3 | 5 | 5 | **20** | **P3** |
| F40 | SOC 2 Type II | 1 | 1 | 1 | 4 | 4 | 1 | 3 | 5 | 3 | 5 | **12** | **P3** |
| F16 | WebXR / AR mode | 3 | 5 | 1 | 5 | 2 | 1 | 2 | 2 | 5 | 4 | **12** | **P3** |
| F37 | Multiplayer study rooms | 3 | 5 | 2 | 4 | 2 | 2 | 2 | 3 | 5 | 4 | **14** | **P3** |

**Composite score is advisory.** Note F01/F02/F07 score low (13/16/12) yet are P0: they score low because they deliver no direct student value, and they are P0 because every other feature's velocity and safety depends on them. This is the dependency override working as designed.

---

# 3. P0 — Must Have (Required Before Demonstrating to Schools)

Sixteen items. These are the demo gate.

---

### F09 — Segmented, layered 3D models
**Score 24 · Effort 6 weeks (4 asset + 2 engineering) · Risk: HIGH**

**Why it matters.** Every organ GLB currently contains exactly one mesh — verified by parsing all nine files (308k–387k triangles, 1 mesh, 0 animations each). Because there are no sub-structures, `toggleIsolate()` (`viewer.ts:551-558`) can only fade the *plinth*, and `toggleLayers()` (`viewer.ts:587-598`) can only flip global wireframe. The two tools that make anatomy software *anatomy software* are labels over stubs.

**Why now.** This is the credibility override and the dependency override at once. It is also the long pole: asset re-authoring cannot be compressed by adding engineers to the software team. Every week it waits, the whole roadmap slips a week. **This starts on day one or the plan is fiction.**

**Educational impact.** Layer peeling and structure isolation are the core pedagogical primitives of anatomy instruction — the digital equivalent of dissection. Without them a student sees a picture; with them they see relationships. This also eliminates hand-authored hotspot XYZ coordinates (currently tuned by trial and error against the `FIT_SIZE = 3.8` cube in `anatomy-data.ts`), replacing them with structure-derived centroids — which is what unblocks content scale.

**Dependencies.** 3D artist capacity; Blender + gltf-transform pipeline; anatomical review of segmentation accuracy by a qualified reviewer.

**Risks.** Asset work slips (High). Segmentation may be anatomically wrong without expert review — a correctness risk, not just a quality one. *Mitigation:* contract additional artists; ship organ-by-organ behind flags rather than as one release; medical/biology reviewer signs off each organ.

**Success metrics.** ≥6 named structures per organ; clicking any structure isolates and labels it; layer peel works on skin + heart minimum; zero hand-authored hotspot coordinates remain.

**Demo value: 5/5.** Peeling skin → muscle → skeleton → organs live on stage is *the* moment a principal understands this is not a textbook.

---

### F13 — Guided narrated tours
**Score 31 (highest on the board) · Effort 3 weeks · Risk: Low-Medium**

**Why it matters.** Free exploration is not instruction. A tour is the smallest unit a teacher can actually assign, the clearest thing a principal can watch, and the most accessible format we can ship (linear, narrated, keyboard-navigable, works without reading fluency).

**Why now.** It converts a viewer into a lesson with no backend, no accounts, and no AI dependency. Highest value-to-cost ratio of any feature on the list. The GSAP timeline infrastructure in `viewer.ts:302-305` already exists.

**Educational impact.** Structured sequencing produces measurable learning where free play does not. "Follow one red blood cell from the right atrium to the fingertip" teaches system-level thinking that clicking hotspots cannot.

**Dependencies.** F09 (tours should target named structures); curriculum specialist to author.

**Risks.** Low. Tours must respect `prefers-reduced-motion` — camera fly-throughs are a vestibular trigger. Ship a static step-through variant.

**Success metrics.** ≥3 tours ship; ≥70% completion rate; keyboard- and screen-reader-navigable; reduced-motion variant verified.

**Demo value: 5/5.** Press play, stop talking, let the product teach for 90 seconds.

---

### F19 — Ask-the-Organ (context-aware AI + camera sync)
**Score 29 · Effort 2 weeks on top of F18 · Risk: Low**

**Why it matters.** This is the fifteen-second demo. Click the mitral valve, ask "why does this make a sound?", get a grounded answer *while the camera flies to the valve and highlights it*. No competitor connects a language model to a live 3D camera this directly.

**Why now.** It is the concrete, visible payoff for F18's infrastructure. Without it, the tutor is "a chatbot next to a model" — with it, the model and the tutor are one thing.

**Educational impact.** Closes the gap between "I am curious about this specific thing" and "I now understand this specific thing" to a few seconds — the moment where learning actually happens.

**Dependencies.** F18 (tutor), F17 (safety), F09 (named structures to reference).

**Risks.** Low technically. The camera API already exists imperatively in `viewer.ts`.

**Success metrics.** Answer and camera move synchronized within 500ms; ≥60% of tutor sessions initiated from a structure click.

**Demo value: 5/5.** This is the slide-free demo.

---

### F32 — Real assessment engine
**Score 28 · Effort 4 weeks · Risk: Low-Medium**

**Why it matters.** The current quiz has three buttons that all call `onClose` (`AnatomyApp.tsx:305-307`). Right and wrong are literally indistinguishable. Shipping this to a school is worse than shipping nothing — it teaches an educator that our claims are cosmetic.

**Why now.** Credibility override. Also: no teacher or principal will take a learning platform seriously that cannot tell them whether learning happened. And **label-the-3D-model** is an assessment format only this product can offer — it is a genuine differentiator, not table stakes.

**Educational impact.** Retrieval practice is among the most robustly evidenced learning interventions available. Immediate feedback with explanation converts a wrong answer into a learning event.

**Dependencies.** F09 (for label-the-model items); item authoring capacity.

**Risks.** Item quality without curriculum expertise (Medium). *Mitigation:* teacher review before publication; start with 200 items across 9 organs × 3 grade bands.

**Success metrics.** ≥200 reviewed items; correct/incorrect distinguishable and explained; ≥80% of students complete an assessment after exploring an organ.

**Demo value: 5/5.** "Label the four chambers on the actual 3D heart" lands instantly with any educator.

---

### F05 — Accessibility remediation
**Score 27 · Effort 1.5 weeks · Risk: Low**

**Why it matters.** Three concrete defects, all verified:
1. `LearningModal` (`AnatomyApp.tsx:279-334`) sets `role="dialog"` and `aria-modal="true"` but never moves focus in, never traps Tab, never restores focus, and does not handle Escape. A keyboard user who opens the quiz is stranded.
2. `prefers-reduced-motion` is CSS-only (`globals.css:560-562`). GSAP timelines and `controls.autoRotate` are JavaScript-driven and ignore it entirely — the organ keeps spinning for a vestibular-sensitive learner. **The CSS rule creates a false impression of compliance, which is worse than no rule.**
3. Hotspot dots are not individually focusable. The sr-only index (`OrganViewer.tsx:163-167`) lets a screen-reader user *read* hotspots but not *select* one.

**Why now.** WCAG 2.2 AA is a procurement gate for most public districts — a principal's technology officer will ask. It is also simply the right thing for the students this product serves. And it is cheap: 1.5 weeks.

**Educational impact.** Extends access to students with motor, visual, vestibular, and cognitive differences. In a typical classroom that is several children per room.

**Dependencies.** F07 helps but is not blocking.

**Risks.** Low. Contrast audit may force palette changes — the muted `#8d847c` on `#f7f0e7` and the 8–11px labels in `.compare-strip`/`.modal-facts` are very likely sub-AA. Involve the designer early so the identity survives.

**Success metrics.** Zero axe-core critical/serious violations; full keyboard traversal; NVDA + VoiceOver pass; reduced-motion halts all motion including auto-rotate.

**Demo value: 3/5.** Rarely demoed, frequently decisive in procurement.

---

### F04 — Per-organ routes (deep linking)
**Score 27 · Effort 3 days · Risk: Low**

**Why it matters.** The entire product is one URL. A teacher cannot send a class a link to the heart. Nine organs are represented by one indexable page.

**Why now.** Three days for a change that unlocks teacher assignment, sharing, per-organ SEO and OG cards, and browser history. Best effort-to-value ratio in the plan.

**Educational impact.** Indirect but large — it is the mechanism by which a teacher directs attention.

**Dependencies.** None. `generateStaticParams()` over the nine IDs in `anatomy-data.ts`.

**Risks.** Low.

**Success metrics.** Nine unique indexable URLs with correct per-organ OG cards; back/forward works.

**Demo value: 3/5.** "Here's the link, it opens right on the heart" — a small moment teachers immediately recognize.

---

### F08 — Error boundary + WebGL fallback
**Score 26 · Effort 3 days · Risk: Low**

**Why it matters.** `new THREE.WebGLRenderer()` at `viewer.ts:82` throws on unsupported hardware and nothing catches it. On an old school Chromebook or a locked-down district image, the demo is a blank panel with no explanation. There is no error boundary anywhere in the tree.

**Why now.** The cheapest possible insurance against the worst possible demo outcome. School hardware is exactly where this fires.

**Educational impact.** Indirect — but a student who cannot load the viewer learns nothing.

**Risks.** Low.

**Success metrics.** Forced WebGL failure yields a helpful message and a 2D illustration fallback (the WebP assets already exist), never a blank panel.

**Demo value: 4/5.** Its value is preventing a 0/5.

---

### F10 — LOD + progressive streaming
**Score 25 · Effort 2 weeks · Risk: Medium**

**Why it matters.** Models are 1.89–5.52 MB with 308k–387k triangles each (28.6 MB total). A shared school Chromebook on a saturated Wi-Fi network is the *actual* deployment target, not a developer's laptop.

**Why now.** A demo that stalls on the school's own network is unrecoverable. Ship a ~40k-triangle LOD0 that appears in under a second, stream LOD1 behind it.

**Educational impact.** Waiting is the most common reason students disengage from a digital tool.

**Dependencies.** F09 (regenerate LODs after segmentation — do it once, in the right order). Wiring `KTX2Loader` finally justifies the `public/basis/` payload that is dead weight today.

**Risks.** Medium — LOD0 visual quality needs art review.

**Success metrics.** First meaningful 3D paint under 1.5s on a 4-core Chromebook at 10 Mbps; peak memory under 300 MB.

**Demo value: 4/5.** Nobody praises speed; everybody notices its absence.

---

### F17 — AI safety layer
**Score 19 · Effort 3 weeks · Risk: HIGH · GATE**

**Why it matters.** We are putting a conversational AI in front of children, on the subject of the human body. Children will ask about puberty, illness, death, their own symptoms, and things a teacher needs to know about. This is not hypothetical.

**Why now.** **This is a gate, not a feature.** It ships before the tutor reaches any student, including in a demo with students present. The composite score of 19 is low precisely because safety infrastructure delivers no visible value — and that is exactly why it needs the override.

**Scope.** Input moderation; topic scoping to anatomy and health education; output moderation; age-appropriateness filtering by grade band; escalation paths for self-harm, abuse disclosure, and personal medical-advice requests that route to a designated adult rather than to a model; immutable audit log; teacher-visible transcripts; per-student rate limiting.

**Dependencies.** Must be designed alongside F18, not after. Requires the audit-logging infrastructure from F26 for full transcript attribution — for demo scope, log to a single-tenant store.

**Risks.** A single incident ends the product's credibility with a district permanently.

**Success metrics.** Red-team suite (≥200 adversarial prompts across all categories) passes in CI; every escalation path verified end to end; a teacher can retrieve any student's full transcript.

**Demo value: 3/5.** "Show me what happens if a student asks something inappropriate" is a question principals genuinely ask — and having a real answer is worth more than any 3D feature.

---

### F18 — Grounded RAG tutor
**Score 24 · Effort 6 weeks · Risk: HIGH**

**Why it matters.** This is the product's reason to exist as an *AI* platform rather than a viewer with a chatbot attached. Currently there is zero AI in the codebase — no LLM, no embeddings, no vector store, no SDK.

**Why now.** It is the primary differentiator against Visible Body, Complete Anatomy, and BioDigital, all of which are medical-school products sold down-market. Without it we are a prettier version of them.

**Technical approach — and this is the whole risk mitigation.** Retrieval-augmented generation over a *curated anatomy corpus* only, filtered by current organ, selected structure, and grade band. Every claim cites a retrieved chunk. **If retrieval returns nothing relevant, the tutor says it does not know and offers to ask the teacher.** Hallucination risk is bounded *structurally*, not by prompt wording. Socratic by default — guiding questions before answers.

**Educational impact.** An always-available, patient tutor at each student's level is the single largest equity lever in the plan. It is what a student without a parent who can explain the circulatory system does not otherwise have.

**Dependencies.** F17 (gate), pgvector or equivalent, curated corpus, F09 (structure names for grounding context).

**Risks.** **Hallucination in an educational medical context is the largest product risk on this list.** *Mitigation:* strict grounding with mandatory citations, refuse-when-unretrieved, red-team suite in CI, teacher-visible transcripts.

**Success metrics.** ≥95% of responses cite retrieved sources; zero ungrounded medical claims across the red-team set; p95 first token under 1.5s.

**Demo value: 5/5.**

---

### F39 — Compliance posture, documented
**Score 23 · Effort 1 week (documentation and design; implementation is F39b) · Risk: Low**

**Why it matters.** A principal's second or third question will be "what data do you collect about my students, and where does it go?" Arriving without a written answer ends the conversation.

**Why now.** For the demo we need the *posture*: a written data map, a stated retention policy, a draft DPA, and a clear statement of FERPA/COPPA/GDPR obligations. Full implementation is F39b in v1.0 — but the demo must not overclaim.

**Dependencies.** Legal review. Engage before the Phase-2 schema is designed, not after.

**Risks.** Overclaiming compliance we have not implemented is a serious integrity failure. Say precisely what is built and what is planned.

**Success metrics.** Written data map, retention policy, and draft DPA exist and survive a district technology officer's review.

**Demo value: 4/5.** Parent Trust 5/5. This is the feature that lets adults say yes.

---

### F06 · F02 · F03 · F01 · F07 — Engineering foundation
**Combined effort ~4 weeks · Risk: Low**

Grouped because they share one rationale: **they cost little and every subsequent feature is faster and safer because of them.**

- **F02 — Lint fix + CI gate (2 days).** `npx eslint .` exits 1 today because ESLint lints the vendored Emscripten bundles in `public/draco` and `public/basis`. One line in `eslint.config.mjs`. Until this is fixed, no CI gate can exist at all.
- **F03 — Real test suite (1.5 weeks).** `tests/rendered-html.test.mjs` is the untouched vinext starter suite; both tests fail against deleted scaffolding. Product test coverage is **zero**. For a product whose core is a WebGL pipeline that can break silently on a driver or library update, this is the largest engineering risk in the repo.
- **F01 — Single deployment target (3 days).** Two build targets exist; one is inert. `vercel.json` overrides the npm scripts, so `worker/index.ts` and its image optimizer never execute in production. Commit to Vercel; delete `worker/`, `vite.config.ts`, `build/`, `db/`, `drizzle/`, `examples/`, `.openai/`, and ~1.6 MB of unwired Draco/Basis decoders. Also fixes the POSIX-only npm scripts that break on Windows.
- **F06 — Headers, PWA manifest, SEO, README (4 days).** No CSP or security headers (`next.config.ts` is an empty object). PWA icons ship with no manifest. And `README.md` documents *vinext-starter*, not this product — it actively misleads every new contributor.
- **F07 — Component decomposition (1 week).** `AnatomyApp.tsx` is 335 lines owning every concern. Split it, extract `useAnatomyViewer()`, delete the confirmed dead code (`tsl-materials.ts`, unused `viewer.prefetch()`, the unreachable `illustrated` fallback branch). Sequence *after* F03.

**Combined success metrics.** Lint and tests green in CI; ≥70% coverage on `app/lib/`; cross-platform `npm run dev`; securityheaders.com grade A; a new engineer onboards from the README unaided.

**Demo value: 1–2/5 individually.** They are why the demo does not break.

---

# 4. P1 — High Priority (Required for Pilot Deployment, v1.0)

Fifteen items. These convert a demo into something a real classroom can use for a term.

---

### F31 — Teacher dashboard + analytics · Score 28 · 4 weeks · Risk: Medium
**Why it matters.** The purchase, rollout, and renewal decisions are all made by adults. A teacher who cannot see what happened will not assign it twice.
**Why now (not for demo).** It needs real student data to be anything but a mockup — which needs F26. Demo it with a seeded class instead.
**Educational impact.** Converts exploration into instructional decisions: who is stuck, on what, right now.
**Dependencies.** F26, F30, F32. **Risks.** Dashboards that show activity rather than learning. *Mitigation:* mastery-by-structure, not time-on-site.
**Metrics.** ≥70% of pilot teachers open it weekly; ≥1 instructional decision reported per week. **Demo 5/5.**

### F30 — Assignments · Score 28 · 2 weeks · Risk: Low
**Why it matters.** The atomic unit of classroom use. Without it, a teacher says "go explore," which produces nothing measurable.
**Why now.** Everything teacher-facing depends on it. **Dependencies.** F26, F04, F28.
**Metrics.** ≥80% of pilot teachers create ≥1 assignment per week; ≥75% student completion. **Demo 4/5.**

### F33 — Student progress / mastery map · Score 27 · 3 weeks · Risk: Low
**Why it matters.** Students need to see their own growth; parents need something concrete to look at. A body-shaped mastery map is far more meaningful than a points total — and it is why we cut leaderboards.
**Why now.** Drives return visits without extrinsic gimmicks. **Dependencies.** F26, F32.
**Metrics.** ≥50% of students view it weekly; correlation between map coverage and assessment scores. **Demo 4/5.**

### F20 — Reading-level adaptation · Score 26 · 3 weeks · Risk: Medium
**Why it matters.** One content set cannot serve Grade 4 and Grade 11. Today `anatomy-data.ts` has exactly one register, pitched somewhere around middle school.
**Why now.** Multiplies the addressable grade range without new 3D assets — the cheapest expansion of reach available. It is also an accessibility feature for striving readers and EAL students.
**Approach.** Generate three grade-band variants **offline, teacher-reviewed before publication**, cached — never generated live per request.
**Dependencies.** F27, F18. **Risks.** Quality requires human review capacity — budget it explicitly.
**Metrics.** All content at three levels; Flesch-Kincaid within band; 100% human-reviewed. **Demo 4/5.**

### F28 — Standards alignment + lesson library · Score 26 · 3 weeks + curriculum staff · Risk: Low
**Why it matters.** A teacher's first question is "which standard does this cover?" A principal's is "how does this fit our curriculum?" Without NGSS / CBSE-NCERT mapping, the answer is a shrug.
**Why now.** Pilot gate. Twenty teacher-authored lessons across grade bands 4–5, 6–8, 9–12.
**Dependencies.** F27, F13, F32. **Metrics.** Every lesson maps to ≥1 standard; ≥60% of pilot teachers use a library lesson unmodified. **Demo 5/5.**

### F12 — Body Explorer · Score 25 · 3 weeks · Risk: Medium
**Why it matters.** Nine organs in a sidebar list do not build a mental map of a body. Students need to see where things *are* relative to each other.
**Why now (not demo).** High value but depends on F09 and additional full-body assets. **Dependencies.** F09, new asset.
**Metrics.** ≥40% of sessions start from Body Explorer. **Demo 5/5.**

### F11 — Real 3D animation · Score 23 · 3 weeks (mostly asset) · Risk: Medium
**Why it matters.** Zero of nine GLBs contain animation clips, so `assets.hasAnimation` (`loaders.ts:34`) is permanently false and the `AnimationMixer` path is dead. The "Animate" button opens a modal that applies a CSS `heartbeat` keyframe to a *static 2D WebP* (`globals.css:470`).
**Why now.** Function is the harder half of anatomy, and it is the half static models cannot teach. The mixer plumbing already exists and is waiting for content.
**Dependencies.** F09. **Risks.** Asset-bound; cost 5/5. **Metrics.** ≥5 organs animate in 3D with scrub control. **Demo 5/5.**

### F26 — Accounts, roles, SSO · Score 22 · 4 weeks · Risk: Medium
**Why it matters.** The enabler for every persistent feature. Nothing can be saved, assigned, or measured without it.
**Why now, not for demo.** Deliberately excluded from MVP: accounts add friction to a live demo and deliver no visible wow. Demo with pre-seeded accounts.
**Dependencies.** Postgres + Drizzle (already a dependency), Auth.js, Google Workspace for Education SSO.
**Risks.** **This is where FERPA/COPPA/GDPR obligations attach.** Legal review before the schema is finalized. **Metrics.** SSO works; RBAC enforced server-side on every endpoint; audit log on all student-data access. **Demo 3/5.**

### F39b — Compliance implementation · Score 18 · 4 weeks · Risk: HIGH · GATE
**Why it matters.** FERPA and COPPA in the US, GDPR with parental consent in the EU. Non-compliance is not a fine risk — it is a *cannot sell* risk.
**Why now.** Pilot gate. Real student data crosses the wire in v1.0. **Dependencies.** F26, legal.
**Metrics.** Signed DPA; PII encrypted at rest; documented retention and deletion enforced in code; parental consent flow for under-13. **Demo 3/5, Parent Trust 5/5.**

### F27 — Content management system · Score 21 · 4 weeks · Risk: Medium
**Why it matters.** Today, adding organ #10 requires authoring a GLB, hand-tuning six hotspot coordinates by trial and error, producing five WebPs, writing ~25 literal fields in `anatomy-data.ts`, and **deploying code**. That ceiling is roughly 20 organs; a full K-12 curriculum needs 200+ structures.
**Why now.** It is the mechanism by which content scales without engineering. **Dependencies.** F26, F09.
**Metrics.** A curriculum specialist adds a complete organ end-to-end with zero engineering involvement. **Demo 2/5, Scalability 5/5.**

### F22 — Misconception detection · Score 23 · 3 weeks · Risk: Medium-High
**Why it matters.** The feature teachers will actually pay for. Not "18 students got it wrong" but "18 students believe the left atrium pumps to the body" — plus a suggested 3D micro-lesson.
**Why now.** Needs class-scale response data, so it follows F32 and F30. **Dependencies.** F32, F30, F31, F18.
**Risks.** Clusters must be validated against real classroom data before teachers are told what students believe.
**Metrics.** Clusters validated with pilot teachers; ≥50% of teachers act on ≥1 suggestion. **Demo 5/5.**

### F21 — AI assessment generation + rubric scoring · Score 21 · 5 weeks · Risk: Medium-High
**Why it matters.** Item authoring is the bottleneck on content scale; grading short answers is the bottleneck on teacher time.
**Why now.** Follows F32's item model. **Dependencies.** F32, F18, F27.
**Risks.** Auto-scoring student work carries genuine fairness obligations. **Always teacher-reviewable; never auto-post a grade; low-confidence scores route to the teacher.**
**Metrics.** Generated items pass teacher review ≥80%; rubric scoring agrees with teachers ≥85%. **Demo 4/5.**

### F24 — Voice narration + voice questions · Score 22 · 4 weeks · Risk: Medium
**Why it matters.** Accessibility 5/5. Essential for early grades, striving readers, dyslexia, and visual impairment — and the natural interface for a child who wants to ask a question.
**Why now.** Pilot-grade accessibility, and it broadens the usable grade range downward. **Dependencies.** F18, F20.
**Risks.** STT accuracy in a noisy classroom. **Metrics.** Full narration coverage; voice questions succeed at classroom noise levels. **Demo 4/5.**

### F35 — Offline PWA model caching · Score 21 · 3 weeks · Risk: Medium
**Why it matters.** A lab of 30 tablets on one shared connection re-downloading 3 MB models per student per session is the realistic failure mode. PWA icons already ship (`icon-192.png`, `icon-512.png`) with **no manifest** — the PWA is half-built.
**Why now.** Pilot reality, and a genuine competitive moat in low-bandwidth markets. **Dependencies.** F06, F10.
**Risks.** Storage quota management across school-managed devices. **Metrics.** Full lesson completes with the network disabled after first load. **Demo 3/5.**

### F29 — Rostering + LTI 1.3 · Score 17 · 5 weeks · Risk: Medium-High
**Why it matters.** If a teacher must hand-enter 150 students, adoption is over before it starts.
**Why now.** Pilot gate for any district with an existing LMS. **Dependencies.** F26.
**Risks.** **LTI 1.3 certification is fiddly and schedule-risky — budget for it explicitly.** *Mitigation:* ship Google Classroom sync first as the fallback; start certification early.
**Metrics.** Roster sync under 5 minutes for a 30-student class; verified LTI launch in Canvas. **Demo 3/5, Teacher Productivity 5/5.**

---

# 5. P2 — Medium Priority (Significant Value After Launch)

| ID | Feature | Score | Effort | Why later | Key metric | Demo |
|---|---|---|---|---|---|---|
| **F42** | Clinical case studies | 26 | 3 wks | Depends on curriculum infrastructure (F27/F28) that does not exist until v1.0. Highest-scoring P2 — promote if pilot feedback demands relevance. | ≥70% completion; engagement lift vs. plain lessons | 4/5 |
| **F41** | Health literacy modules | 25 | 3 wks | Broadens footprint beyond biology into wellness curriculum. High Parent Trust (5/5). Needs the CMS. | Adoption outside biology classes | 4/5 |
| **F25** | Multilingual | 24 | 4 wks | Major differentiator in India, the US, and the EU — but requires reviewed translations, and anatomical terminology cannot be machine-translated unreviewed. Promote to P1 if the pilot district requires it. | ≥3 reviewed languages; parity of outcomes across languages | 4/5 |
| **F34** | Parent portal | 22 | 2 wks | Parent Trust 5/5 and cheap — but needs real progress data (F33) to show. First post-launch item. | ≥30% of parents open the weekly digest | 4/5 |
| **F36** | Classroom mode | 22 | 4 wks | Demos superbly and teachers love it, but real-time fan-out infrastructure (Maintainability 2/5) is a poor investment before single-user learning is proven. | ≥40% of teachers use it in-class weekly | 5/5 |
| **F14** | Draw-on-model annotation | 22 | 3 wks | Strong engagement and a real assessment format, but depends on F09 and adds a grading surface teachers must be ready for. | Annotation submissions per assignment | 4/5 |
| **F23** | AI lesson plan generator | 21 | 3 wks | Teacher Productivity 5/5 and Demo 5/5 — but worthless without the lesson library and standards taxonomy it composes from. | Usable 45-min lesson produced in <3 min | 5/5 |
| **F38** | Admin / district analytics | 18 | 3 wks | Required for renewal and board reporting, meaningless before there is district-scale usage. | Renewal conversations supported with data | 5/5 |

---

# 6. P3 — Nice to Have (Future Enhancements)

| ID | Feature | Score | Effort | Honest assessment |
|---|---|---|---|---|
| **F15** | Virtual dissection simulator | 20 | 5 wks | Genuinely excellent education (EDU 5, ENG 5) and ethically compelling — zero specimens, infinitely repeatable. Deferred purely on cost (CPX 5, COST 5) and its hard dependency on mature segmented models. **The strongest P3; first candidate for promotion in v2.0.** |
| **F37** | Multiplayer study rooms | 14 | 4 wks | Engagement 5/5, but it introduces a child-to-child communication surface requiring moderation, and Maintainability 2/5. Do not build until safety operations are mature. |
| **F16** | WebXR / AR | 12 | 4 wks | Demo 5/5, Teacher Productivity 1/5, Accessibility 1/5. Most school devices cannot run it acceptably. **This is the feature most likely to be requested for the wrong reasons — resist until the core teaches well.** |
| **F40** | SOC 2 Type II | 12 | 6 wks | Zero educational value; unlocks large district and board procurement. Purely a sales gate — start it when the first enterprise deal requires it, not before. |

---

# 7. Implementation Plan 1 — MVP (School Demonstration)

**Goal:** walk into a principal's office with a live product that makes teachers lean forward and students ask to try it.
**Timeline: 12 weeks · Team: 5–6 (2 frontend, 1 backend/AI, 1 3D artist + contractor, 1 designer, 0.5 curriculum)**

## 7.1 Scope

**Included — 16 P0 items:**

| Track | Features | Weeks |
|---|---|---|
| Foundation | F01, F02, F03, F04, F06, F07, F08 | 1–4 |
| Accessibility | F05 | 3–4 |
| 3D (long pole — starts week 1) | F09, F10 | 1–8 |
| Learning | F13, F32 | 6–10 |
| AI | F17 (gate) → F18 → F19 | 5–12 |
| Trust | F39 (documented posture) | 10–11 |

**Explicitly excluded from MVP, and why:**

| Excluded | Reason |
|---|---|
| Accounts / SSO (F26) | Adds login friction to a live demo and delivers no visible wow. Demo with pre-seeded accounts. |
| Teacher dashboard (F31) | Needs real class data or it is a mockup. Demo with a seeded class instead — honestly labeled as sample data. |
| Rostering / LTI (F29) | Zero demo value, five weeks of cost. |
| Gamification (F33 badges) | Extrinsic motivation teachers often disable. |
| AR, multiplayer, dissection | Novelty ahead of substance. |

## 7.2 The 12-week schedule

```
Wk 1     F01 delete Cloudflare target · F02 lint+CI · F06 README     ┐
Wk 1  →  F09 3D SEGMENTATION BEGINS (long pole, runs to wk 8)        │ foundation
Wk 2     F03 test suite · F04 per-organ routes                       │
Wk 3     F05 accessibility · F08 error boundary                      │
Wk 4     F06 headers/PWA/SEO · F07 decomposition                     ┘
Wk 5     F17 AI safety layer design + red-team suite    ─┐
Wk 6     F13 guided tours (auth) · F17 build             │ AI track
Wk 7     F18 RAG corpus + retrieval · F32 item model     │
Wk 8     F09 lands · F10 LOD regeneration                │
Wk 9     F18 tutor integration · F32 assessment UI       │
Wk 10    F19 Ask-the-Organ · F39 compliance docs         │
Wk 11    Red-team, a11y audit, perf on real Chromebook  ─┘
Wk 12    Demo rehearsal, seeded data, fallback drills
```

## 7.3 MVP success criteria (the demo gate)

Every one must pass before booking a school:

- [ ] All nine organs expose ≥6 named, isolatable structures; layer peel works on skin + heart
- [ ] First meaningful 3D paint ≤1.5s on a real 4-core Chromebook at 10 Mbps
- [ ] ≥3 narrated tours, keyboard-navigable, with a reduced-motion variant
- [ ] ≥200 reviewed assessment items; correct/incorrect distinguishable and explained
- [ ] Tutor cites sources on ≥95% of responses; zero ungrounded medical claims across the red-team set
- [ ] Ask-the-Organ camera move synchronized within 500ms
- [ ] Zero axe-core critical/serious violations; NVDA + VoiceOver pass; reduced-motion halts auto-rotate
- [ ] Lint, tests, typecheck, build all green in CI
- [ ] Written data map, retention policy, draft DPA
- [ ] **No dead buttons anywhere.** Every visible control does what its label says or it is removed.

## 7.4 The 20-minute demo script

| Min | Beat | Feature | Audience hook |
|---|---|---|---|
| 0–2 | Open on the beating heart, rotate it | Existing viewer | "This runs in a browser on your Chromebooks." |
| 2–5 | Peel skin → muscle → skeleton → organs | **F09** | The moment they realize it is not a textbook |
| 5–8 | Play the narrated circulation tour | **F13** | Teachers see an assignable lesson |
| 8–12 | Student clicks the mitral valve and asks "why does this make a sound?" — grounded answer, camera flies to the valve | **F19 + F18** | The differentiator |
| 12–14 | Ask something off-topic and something concerning; show the refusal and the escalation path | **F17** | The question every principal asks |
| 14–17 | Label the four chambers on the live 3D heart; immediate feedback with explanation | **F32** | Assessment only we can offer |
| 17–19 | Seeded class view: mastery by structure *(labeled clearly as sample data)* | F31 preview | Where this is going |
| 19–20 | Data map, retention policy, standards mapping | **F39** | The adult close |

**Demo integrity rule:** anything shown as a preview is stated as a preview. A principal who later discovers the dashboard was a mockup will not trust the rest.

---

# 8. Implementation Plan 2 — Production Release (v1.0, Pilot Deployment)

**Goal:** three to five schools run this for a full term with real students, real assignments, and real data.
**Timeline: +16 weeks after MVP (weeks 13–28) · Team: 7–9 (add 1 backend, 1 curriculum specialist, 0.5 QA)**

## 8.1 Scope — all P0 plus 15 P1 items

| Track | Features | Weeks |
|---|---|---|
| Platform | F26 accounts/SSO → F39b compliance → F27 CMS | 13–22 |
| Teacher workflow | F30 assignments → F31 dashboard → F29 rostering/LTI | 17–26 |
| Curriculum | F28 standards + 20 lessons → F20 reading levels | 15–22 |
| 3D | F11 animation → F12 Body Explorer | 14–20 |
| AI | F21 assessment generation → F22 misconceptions → F24 voice | 20–27 |
| Reliability | F35 offline PWA | 24–26 |
| Pilot ops | Onboarding, support, feedback loop | 26–28 |

## 8.2 Hard sequencing constraints

1. **F26 before F30, F31, F33** — no persistence, no assignments, no dashboard.
2. **F39b before any real student data crosses the wire.** Legal review before the F26 schema is finalized, not after.
3. **F27 before F28 and F20** — content scale requires the CMS.
4. **F32 before F21 and F22** — cannot generate or cluster against an item model that does not exist.
5. **F09 before F11 and F12** — animation and full-body navigation both target named structures.
6. **F29 LTI certification starts week 17**, not week 24. Ship Google Classroom sync first as the fallback path.

## 8.3 v1.0 release gate

**Product**
- [ ] Teacher: roster a class, assign a lesson, see live mastery — under 10 minutes end to end
- [ ] Student: sign in, complete an assignment, see personal progress
- [ ] Content at three reading levels across all nine organs, 100% human-reviewed
- [ ] ≥20 standards-aligned lessons
- [ ] ≥5 organs animate in 3D
- [ ] Full lesson completes offline after first load

**Trust & safety**
- [ ] Signed DPA; FERPA/COPPA/GDPR obligations implemented, not just documented
- [ ] PII encrypted at rest; retention and deletion enforced in code
- [ ] Parental consent flow for under-13
- [ ] Red-team suite green in CI; escalation paths verified with a named adult at each pilot school
- [ ] Every AI interaction logged and teacher-retrievable

**Engineering**
- [ ] p95 API latency <300ms; p95 tutor first token <1.5s
- [ ] Error rate <0.5%; Sentry + OpenTelemetry + Web Vitals RUM live
- [ ] Per-tenant AI cost dashboard — **unit economics validated before scaling**
- [ ] WCAG 2.2 AA verified by external audit
- [ ] Every v1.0 feature behind a flag for per-district staged rollout

## 8.4 Pilot success metrics (one term)

| Metric | Target |
|---|---|
| Teacher weekly active | ≥70% of enrolled teachers |
| Assignments created per teacher per week | ≥1 |
| Student assignment completion | ≥75% |
| Student weekly active | ≥60% |
| Pre/post assessment gain | ≥15 percentage points |
| Teacher NPS | ≥40 |
| Teachers acting on a misconception insight | ≥50% |
| Safety incidents reaching a student | **0** |
| AI cost per student per month | Within pricing model |
| Schools electing to renew | ≥3 of 5 |

**The two numbers that decide whether this is a business:** pre/post learning gain, and safety incidents. Everything else is diagnostic.

---

# 9. Implementation Plan 3 — Long-Term Vision (v2.0+)

**Goal:** the default way human anatomy is taught in K-12.
**Timeline: 12–24 months post-v1.0**

## 9.1 v2.0 — Depth and Reach (months 1–8)

| Theme | Features | Rationale |
|---|---|---|
| **Curriculum depth** | F42 case studies, F41 health literacy, F23 lesson generator | Move from "nine organs" to a full life-sciences curriculum. F42 is the strongest P2 — promote on pilot demand. |
| **Reach** | F25 multilingual, F34 parent portal | Multilingual is the single largest addressable-market unlock, especially in India and the EU. |
| **Classroom experience** | F36 classroom mode, F14 annotation | Now justified: single-user learning is proven, so real-time infrastructure is a defensible investment. |
| **Scale operations** | F38 district analytics, F40 SOC 2 | Renewal and enterprise procurement. |

**v2.0 targets:** 200+ named structures; 100+ standards-aligned lessons; 5+ reviewed languages; 50+ schools; measured learning gain sustained across a full year.

## 9.2 v2.5 — Depth of Simulation (months 9–16)

- **F15 virtual dissection** — promoted from P3. By now segmented models are mature, making it a natural extension rather than a moonshot. Ethically compelling, infinitely repeatable, zero consumables budget.
- **Systems-level simulation** — not just structure, but function under change: what happens to circulation during exercise, at altitude, with a blocked artery. This is the leap from anatomy to physiology.
- **Adaptive learning paths** — the platform sequences each student's next activity from their mastery map, spaced-repetition schedule, and misconception profile.
- **Teacher co-authoring** — teachers build and share their own tours, lessons, and item sets. **A content marketplace is the strongest available moat** — it converts users into suppliers.

## 9.3 v3.0 — Platform (months 17–24+)

- **Beyond anatomy** — the engine (3D + grounded tutor + assessment + teacher analytics) is subject-agnostic. Chemistry molecules, cell biology, geology, mechanical systems. **The 3D learning engine is the durable asset; anatomy is the first proof.**
- **Open content ecosystem** — publisher and university partnerships; contributed model library.
- **Research partnership** — publish efficacy studies with a university partner. In education, peer-reviewed efficacy is the most durable competitive advantage available, and it is what education boards actually weigh.
- **F16 AR / F37 multiplayer** — finally justified once device capability has caught up and safety operations are mature.
- **Accessibility leadership** — go beyond AA: full sign-language narration, switch access, cognitive-load modes. Serve the students everyone else skips.

## 9.4 What must stay true across all versions

1. **Grounded, never free-form.** The tutor cites or it declines. This is not a tuning parameter.
2. **Teacher in the loop.** No generated content reaches a student unreviewed; no grade posts without teacher confirmation.
3. **Safety is a gate, never a feature.** It ships before the capability it guards, every time.
4. **Every device in the room.** If it does not run on the cheapest Chromebook in the building, it does not ship.
5. **Accessibility is not a phase.** It is a definition-of-done item on every feature.
6. **Learning gain is the product metric.** Engagement is diagnostic. Time-on-site is vanity.

---

# 10. Summary — The Three Plans at a Glance

| | **MVP (Demo)** | **v1.0 (Pilot)** | **v2.0+ (Vision)** |
|---|---|---|---|
| **Timeline** | 12 weeks | +16 weeks (28 total) | 12–24 months after |
| **Team** | 5–6 | 7–9 | 12–15 |
| **Features** | 16 (all P0) | +15 (all P1) | +12 (P2/P3) |
| **Goal** | Impress and be believed | Prove learning in real classrooms | Category leadership |
| **Key metric** | Demo → pilot conversion | Pre/post learning gain ≥15pp | Sustained gain at 50+ schools |
| **Biggest risk** | 3D asset slip (F09) | Compliance (F39b), LTI cert (F29) | AI unit economics at scale |
| **Do first** | **F09 segmentation, week 1** | F26 accounts + legal review | Multilingual + marketplace |
| **Never compromise** | Safety gate, no dead buttons | Zero safety incidents, teacher in loop | Grounded AI, learning gain |

## 10.1 The single most important decision

**Start F09 — 3D model segmentation — on day one of week one.**

It is the highest-scoring feature that is also the longest-pole and the least compressible. Software work can absorb an extra engineer; asset re-authoring cannot. Every week F09 waits, the MVP date moves a week, and the tools already shipping in the UI keep making a promise the product cannot keep.

Everything else in this document is sequencing. That one is a start date.
