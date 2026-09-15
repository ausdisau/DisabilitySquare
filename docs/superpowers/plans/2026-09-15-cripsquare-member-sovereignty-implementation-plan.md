# CripSquare Member Sovereignty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the conventional feed-first experience with MySquare: a finite, member-controlled, explainable and accessible community briefing that preserves chronological mode, provenance, source access and a hard separation between organic ranking and OpenAds.

**Architecture:** Build new Member Sovereignty capabilities on the repository's Next.js App Router surface (`app/`, `lib/`, `components/`, `shared/`) and treat the existing Vite/Express surface (`client/`, `server/`) as compatibility/legacy during migration. MySquare uses explicit preferences and deterministic MSR-1 scoring first; AI is introduced only for presentation transforms and later personal-agent orchestration behind explicit member authority.

**Tech Stack:** Next.js 16, React 18, TypeScript, Auth0 Next.js SDK, Drizzle ORM/PostgreSQL, Zod, existing component system/Tailwind, Vitest or repository-compatible unit test runner, Playwright or repository-compatible E2E runner when available.

**Spec:** `docs/superpowers/specs/2026-09-15-cripsquare-member-sovereignty-design.md`

## Global Constraints

- MySquare is finite and must reach a genuine **You're caught up** state.
- Chronological mode is first-class and must remain available without functional penalty.
- Disabling recommendation must not disable essential community functionality.
- Organic ranking must not accept advertising spend, bid, CPM/CPC, sponsorship value or advertiser priority as inputs.
- Raw disability, health, AAC, support, access-needs or accessibility-preference data must not become OpenAds targeting input by default.
- Ranking should prefer explicit preferences over sensitive inference.
- Every personalised recommendation must expose a comprehensible reason object.
- AI transformations must preserve access to the canonical original content.
- Material AI involvement and transformed content must preserve provenance.
- New Member Sovereignty work targets the Next.js surface; do not duplicate MySquare in `client/`.
- Existing Auth0 remains the production identity path; do not replace it as part of this work.
- Accessibility target is WCAG 2.2 AA minimum, including keyboard, screen-reader, reduced-motion, high-contrast and cognitive-access checks.
- Implement with TDD and review after each task.

---

## File Structure

Create or evolve the following boundaries:

```text
app/
├── (dashboard)/
│   ├── mysquare/page.tsx
│   ├── mysquare/preferences/page.tsx
│   └── feed/page.tsx                  # compatibility route/redirect later
├── api/
│   └── mysquare/
│       ├── route.ts
│       ├── preferences/route.ts
│       └── explain/[itemId]/route.ts
components/
└── mysquare/
    ├── MySquareHeader.tsx
    ├── MySquareModeSwitch.tsx
    ├── MySquareItem.tsx
    ├── CaughtUpState.tsx
    ├── WhyAmISeeingThis.tsx
    ├── ProvenanceBadge.tsx
    └── AccessRepresentationMenu.tsx
lib/
└── mysquare/
    ├── types.ts
    ├── preferences.ts
    ├── candidates.ts
    ├── msr1.ts
    ├── explain.ts
    ├── provenance.ts
    ├── access-transform.ts
    └── commercial-firewall.ts
shared/
└── schema.ts                           # additive tables/columns only
migrations/
└── <generated member-sovereignty migration>
docs/
└── adr/
    ├── 0001-nextjs-canonical-surface.md
    ├── 0002-msr1-deterministic-ranking.md
    └── 0003-openads-organic-firewall.md
```

---

### Task 1: Record the canonical Next.js implementation boundary

**Files:**
- Create: `docs/adr/0001-nextjs-canonical-surface.md`
- Modify: `README.md` if present and appropriate

**Interfaces:**
- Produces: an explicit decision that new MySquare work lands in Next.js only.

- [ ] **Step 1: Write the ADR**

The ADR must state:

```text
Decision: New CripSquare Member Sovereignty features are implemented on the Next.js App Router surface.
Legacy client/server remain compatibility code during migration.
No duplicate MySquare implementation will be added to client/src/pages/Home.tsx.
/feed becomes compatibility-only after /mysquare reaches parity.
```

- [ ] **Step 2: Confirm current repository evidence**

Verify these files still exist before implementation:

```text
app/(dashboard)/feed/page.tsx
app/api/posts/route.ts
lib/auth.ts
lib/storage.ts
shared/schema.ts
client/src/pages/Home.tsx
server/routes.ts
```

- [ ] **Step 3: Commit**

```bash
git add docs/adr/0001-nextjs-canonical-surface.md README.md
git commit -m "docs: make Next.js canonical for MySquare"
```

---

### Task 2: Add member-controlled MySquare preference contracts

**Files:**
- Create: `lib/mysquare/types.ts`
- Create: `lib/mysquare/preferences.ts`
- Modify: `shared/schema.ts`
- Create: migration generated from schema change
- Test: `lib/mysquare/preferences.test.ts`

**Interfaces:**
- Produces: `MySquarePreferences`, `MySquareMode`, `AttentionBudget`, preference persistence helpers.

- [ ] **Step 1: Write the failing contract tests**

```ts
import { describe, expect, it } from "vitest";
import { MySquarePreferencesSchema } from "./preferences";

describe("MySquarePreferences", () => {
  it("defaults to explicit member-controlled settings", () => {
    const parsed = MySquarePreferencesSchema.parse({});
    expect(parsed.mode).toBe("mysquare");
    expect(parsed.dailyItemLimit).toBe(15);
    expect(parsed.discoveryEnabled).toBe(true);
    expect(parsed.sponsoredEnabled).toBe(false);
  });

  it("accepts chronological mode with recommendations disabled", () => {
    const parsed = MySquarePreferencesSchema.parse({
      mode: "chronological",
      personalisationEnabled: false
    });
    expect(parsed.mode).toBe("chronological");
    expect(parsed.personalisationEnabled).toBe(false);
  });
});
```

- [ ] **Step 2: Verify failure**

Run the repository test command for this file.

Expected: FAIL because the schema does not yet exist.

- [ ] **Step 3: Implement the contract**

```ts
import { z } from "zod";

export const MySquarePreferencesSchema = z.object({
  mode: z.enum(["mysquare", "chronological"]).default("mysquare"),
  personalisationEnabled: z.boolean().default(true),
  dailyItemLimit: z.number().int().min(1).max(100).default(15),
  discoveryEnabled: z.boolean().default(true),
  sponsoredEnabled: z.boolean().default(false),
  weights: z.object({
    directness: z.number().min(0).max(5).default(5),
    communityPriority: z.number().min(0).max(5).default(4),
    locality: z.number().min(0).max(5).default(3),
    recency: z.number().min(0).max(5).default(3),
    relationship: z.number().min(0).max(5).default(3),
    topicImportance: z.number().min(0).max(5).default(3),
    helpfulnessOpportunity: z.number().min(0).max(5).default(2),
    provenancePreference: z.number().min(0).max(5).default(2)
  }).default({})
});

export type MySquarePreferences = z.infer<typeof MySquarePreferencesSchema>;
```

- [ ] **Step 4: Persist preferences in the database**

Add a member-owned table such as `mysquare_preferences` keyed by the internal application user id. Store explicit fields; do not copy diagnosis/access-needs fields into this table.

- [ ] **Step 5: Generate and review migration**

Use the repository's Drizzle migration workflow. Confirm the migration is additive and does not rewrite existing post data.

- [ ] **Step 6: Run tests and typecheck**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/mysquare shared/schema.ts migrations
git commit -m "feat: add MySquare member preferences"
```

---

### Task 3: Define provenance and transformation contracts

**Files:**
- Create: `lib/mysquare/provenance.ts`
- Create: `lib/mysquare/access-transform.ts`
- Modify: `shared/schema.ts`
- Add migration
- Test: `lib/mysquare/provenance.test.ts`

**Interfaces:**
- Produces: `ContentProvenance`, `ContentTransformation`, provenance labels and original-source linkage.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { ContentProvenanceSchema } from "./provenance";

describe("content provenance", () => {
  it("accepts the approved provenance categories", () => {
    for (const provenanceType of [
      "human-written",
      "ai-assisted",
      "ai-generated",
      "organisation-statement",
      "government-source",
      "news-report",
      "community-experience",
      "unverified"
    ]) {
      expect(ContentProvenanceSchema.parse({ provenanceType }).provenanceType).toBe(provenanceType);
    }
  });
});
```

- [ ] **Step 2: Verify failure**

Expected: FAIL because provenance contracts do not exist.

- [ ] **Step 3: Implement provenance schema**

Include:

```ts
provenanceType
originalResourceId?
sourceUrl?
citations?
aiModel?
createdAt?
```

- [ ] **Step 4: Implement transformation metadata**

Each transformed representation must retain:

```ts
transformationType
sourceVersion
generatedAt
modelOrTool?
requestedByPreference?
originalResourceId
```

- [ ] **Step 5: Add additive persistence fields/table**

Do not overwrite canonical `posts.content`. Transformations should be separate records or representation metadata linked to the original.

- [ ] **Step 6: Run tests/typecheck and commit**

```bash
git add lib/mysquare shared/schema.ts migrations
git commit -m "feat: add content provenance contracts"
```

---

### Task 4: Implement deterministic MSR-1 scoring

**Files:**
- Create: `lib/mysquare/msr1.ts`
- Create: `lib/mysquare/candidates.ts`
- Create: `docs/adr/0002-msr1-deterministic-ranking.md`
- Test: `lib/mysquare/msr1.test.ts`

**Interfaces:**
- Consumes: `MySquarePreferences` and normalised candidate signals.
- Produces: `rankMySquareCandidates(candidates, preferences)` and `RecommendationExplanation` inputs.

- [ ] **Step 1: Write failing ranking tests**

```ts
it("ranks direct replies ahead when directness has highest member weight", () => {
  const ranked = rankMySquareCandidates([
    candidate({ id: "general", directness: 0, recency: 5 }),
    candidate({ id: "reply", directness: 5, recency: 1 })
  ], preferences({ weights: { directness: 5, recency: 1 } }));

  expect(ranked[0].id).toBe("reply");
});

it("does not require behavioural engagement predictions", () => {
  const candidateValue = candidate({ id: "x" });
  expect(candidateValue).not.toHaveProperty("predictedEngagement");
  expect(candidateValue).not.toHaveProperty("predictedSessionTime");
});
```

- [ ] **Step 2: Verify failure**

Expected: FAIL because MSR-1 does not exist.

- [ ] **Step 3: Implement normalised candidate signals**

```ts
export interface MySquareCandidateSignals {
  directness: number;
  communityPriority: number;
  locality: number;
  recency: number;
  relationship: number;
  topicImportance: number;
  helpfulnessOpportunity: number;
  provenancePreference: number;
}
```

No ad-spend or vulnerability fields are allowed.

- [ ] **Step 4: Implement deterministic weighted scoring**

Use the member's explicit weights. Keep the formula readable and inspectable.

- [ ] **Step 5: Record ADR**

State that MSR-1 starts deterministic and inspectable. ML may later assist candidate extraction, but it cannot replace member-owned objective controls without a new approved architecture decision.

- [ ] **Step 6: Run tests/typecheck and commit**

```bash
git add lib/mysquare docs/adr/0002-msr1-deterministic-ranking.md
git commit -m "feat: implement deterministic MSR-1 ranking"
```

---

### Task 5: Prove the OpenAds/organic ranking firewall

**Files:**
- Create: `lib/mysquare/commercial-firewall.ts`
- Create: `docs/adr/0003-openads-organic-firewall.md`
- Test: `lib/mysquare/commercial-firewall.test.ts`

**Interfaces:**
- Produces: compile/runtime guard ensuring commercial signals cannot enter organic ranking.

- [ ] **Step 1: Write the invariant test first**

```ts
it("changing commercial values cannot alter organic ordering", () => {
  const organic = [candidate({ id: "a", recency: 4 }), candidate({ id: "b", recency: 2 })];
  const before = rankOrganic(organic, prefs);

  const commercialScenarioA = { campaignBid: 1, sponsorValue: 1 };
  const commercialScenarioB = { campaignBid: 100000, sponsorValue: 100000 };

  const afterA = rankOrganic(organic, prefs);
  const afterB = rankOrganic(organic, prefs);

  expect(afterA.map(x => x.id)).toEqual(before.map(x => x.id));
  expect(afterB.map(x => x.id)).toEqual(before.map(x => x.id));
  expect(commercialScenarioA).not.toBe(commercialScenarioB);
});
```

- [ ] **Step 2: Add a type-level boundary**

Define `OrganicRankingInput` separately from `SponsoredPlacementInput`. Do not share one giant candidate type.

- [ ] **Step 3: Record the ADR**

Document that paid influence is permitted only inside clearly labelled sponsored inventory and never in MSR-1.

- [ ] **Step 4: Run tests and commit**

```bash
git add lib/mysquare docs/adr/0003-openads-organic-firewall.md
git commit -m "test: enforce organic ranking commercial firewall"
```

---

### Task 6: Build recommendation explanations

**Files:**
- Create: `lib/mysquare/explain.ts`
- Create: `components/mysquare/WhyAmISeeingThis.tsx`
- Test: `lib/mysquare/explain.test.ts`

**Interfaces:**
- Produces: `buildRecommendationExplanation(candidate, preferences)`.

- [ ] **Step 1: Write failing explanation test**

```ts
it("explains reasons and declares no commercial influence", () => {
  const explanation = buildRecommendationExplanation(candidate({
    communities: ["Northern Sydney"],
    localityMatch: true
  }), prefs);

  expect(explanation.commercialInfluence).toBe(false);
  expect(explanation.reasons.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Implement explanation output**

```ts
export interface RecommendationExplanation {
  reasons: string[];
  commercialInfluence: false;
  personalisationEnabled: boolean;
}
```

- [ ] **Step 3: Build accessible UI**

`WhyAmISeeingThis` must be keyboard-operable, screen-reader labelled, and usable without hover.

- [ ] **Step 4: Run tests and commit**

```bash
git add lib/mysquare/explain.ts components/mysquare/WhyAmISeeingThis.tsx
git commit -m "feat: explain MySquare recommendations"
```

---

### Task 7: Add MySquare API and finite result assembly

**Files:**
- Create: `app/api/mysquare/route.ts`
- Create: `app/api/mysquare/preferences/route.ts`
- Create: `app/api/mysquare/explain/[itemId]/route.ts`
- Modify: `lib/storage.ts` only as needed for Next.js data access
- Test: API route/unit tests following repository conventions

**Interfaces:**
- Produces: finite MySquare payload with `items`, `mode`, `limit`, and `caughtUp`.

- [ ] **Step 1: Write failing response-shape test**

Expected payload:

```ts
{
  mode: "mysquare",
  items: [],
  itemLimit: 15,
  caughtUp: true
}
```

- [ ] **Step 2: Implement preferences route**

Require authenticated user for writes. Reads return explicit defaults for users without persisted preferences.

- [ ] **Step 3: Implement candidate assembly**

Start with data already available in the repository: posts, group/community relationships and direct activity where available. Do not introduce behavioural prediction tables.

- [ ] **Step 4: Apply attention budget**

Slice only after ranking and policy filters. `caughtUp` is true when the eligible candidate set is exhausted for the requested scope.

- [ ] **Step 5: Add chronological branch**

When `mode=chronological` or personalisation is disabled, order eligible community content by canonical creation time with no MSR-1 scoring.

- [ ] **Step 6: Run tests/typecheck and commit**

```bash
git add app/api/mysquare lib/storage.ts
git commit -m "feat: add finite MySquare API"
```

---

### Task 8: Build the MySquare UI and genuine caught-up state

**Files:**
- Create: `app/(dashboard)/mysquare/page.tsx`
- Create: `components/mysquare/MySquareHeader.tsx`
- Create: `components/mysquare/MySquareModeSwitch.tsx`
- Create: `components/mysquare/MySquareItem.tsx`
- Create: `components/mysquare/CaughtUpState.tsx`
- Create: `components/mysquare/ProvenanceBadge.tsx`

**Interfaces:**
- Consumes: `/api/mysquare`.
- Produces: primary finite member home surface.

- [ ] **Step 1: Write component/E2E acceptance tests**

Cover:

```text
member can switch MySquare -> chronological
caught-up state appears when finite set is exhausted
Why am I seeing this? is reachable by keyboard
provenance badge is exposed where provenance exists
sponsored content is visually and semantically separate
```

- [ ] **Step 2: Build header and mode switch**

Use plain language: `MySquare` and `Chronological`.

- [ ] **Step 3: Build finite item rendering**

Do not add infinite scroll. Pagination/load-more may exist only as an explicit member action and must respect the attention budget.

- [ ] **Step 4: Build caught-up state**

Copy should clearly communicate completion, for example:

```text
You're caught up.
You've reached the end of the items in today's MySquare.
```

- [ ] **Step 5: Run accessibility checks**

Keyboard through the entire surface, verify visible focus, semantic headings, live-region behaviour for mode changes, reduced-motion behaviour, and screen-reader labels.

- [ ] **Step 6: Commit**

```bash
git add app/'(dashboard)'/mysquare components/mysquare
git commit -m "feat: add finite MySquare experience"
```

---

### Task 9: Add member-editable MySquare controls

**Files:**
- Create: `app/(dashboard)/mysquare/preferences/page.tsx`
- Create: `components/mysquare/MySquarePreferencesForm.tsx`
- Test: form/unit/E2E tests

**Interfaces:**
- Consumes/updates: `/api/mysquare/preferences`.

- [ ] **Step 1: Write tests for explicit control**

Verify a member can:

```text
turn personalisation off
choose chronological mode
set daily item limit
turn optional discovery on/off
turn sponsored placements on/off
change major MSR-1 weights
```

- [ ] **Step 2: Build understandable controls**

Do not expose opaque ML jargon. Prefer labels such as:

```text
Direct replies
My important communities
Local information
Recent information
People I follow
Topics I care about
Questions I may be able to help with
Source/provenance preference
```

- [ ] **Step 3: Add reset-to-defaults action**

Require confirmation and make the result reversible before leaving the page if practical.

- [ ] **Step 4: Run accessibility/E2E tests and commit**

```bash
git add app/'(dashboard)'/mysquare/preferences components/mysquare
git commit -m "feat: add member-controlled MySquare settings"
```

---

### Task 10: Add accessible representation controls without replacing originals

**Files:**
- Create: `components/mysquare/AccessRepresentationMenu.tsx`
- Implement/extend: `lib/mysquare/access-transform.ts`
- Add API route only if transformation is server-backed
- Test: transformation/provenance and accessibility tests

**Interfaces:**
- Produces accessible representations linked to the original content.

- [ ] **Step 1: Write tests proving original content remains accessible**

For every transformed representation, assert the response contains `originalResourceId` and the UI exposes `View original`.

- [ ] **Step 2: Implement non-AI presentation modes first**

Start with existing deterministic presentation controls where possible:

```text
larger text
high contrast
reduced motion
summary-first layout only when summary already exists
```

- [ ] **Step 3: Gate AI transformations explicitly**

Plain English, Easy Read, AAC-friendly phrasing, translation, generated image descriptions and summarisation must add transformation metadata and provenance.

- [ ] **Step 4: Commit**

```bash
git add components/mysquare lib/mysquare app/api
git commit -m "feat: add source-preserving accessible representations"
```

---

### Task 11: Introduce outcome-oriented analytics contracts

**Files:**
- Create: `lib/mysquare/outcomes.ts`
- Add additive persistence only if needed
- Test: `lib/mysquare/outcomes.test.ts`

**Interfaces:**
- Produces event contracts for Time to Useful Outcome and community-health metrics.

- [ ] **Step 1: Define privacy-minimised outcome events**

Examples:

```ts
mysquare.caught_up
mysquare.preference_changed
mysquare.recommendation_explanation_opened
community.question_answered
community.resource_opened
access.representation_used
```

Do not add `maximize_session_duration` or equivalent objective events.

- [ ] **Step 2: Define Time to Useful Outcome carefully**

Measure only when a useful outcome can be reasonably identified through explicit actions or optional member feedback. Do not infer success solely from long dwell time.

- [ ] **Step 3: Add tests for prohibited metric use in ranking**

Outcome events may inform product evaluation; they must not silently become MSR-1 engagement optimisation features.

- [ ] **Step 4: Commit**

```bash
git add lib/mysquare/outcomes.ts shared/schema.ts migrations
git commit -m "feat: add member-outcome analytics contracts"
```

---

### Task 12: Make `/feed` a compatibility path after MySquare parity

**Files:**
- Modify: `app/(dashboard)/feed/page.tsx`
- Modify: dashboard navigation as appropriate
- Test: route/navigation E2E tests

**Interfaces:**
- Produces a single canonical member home experience.

- [ ] **Step 1: Verify MySquare acceptance gates first**

Do not redirect `/feed` until:

```text
MySquare renders production data
chronological mode works
preferences persist
caught-up state works
explanations work
accessibility checks pass
```

- [ ] **Step 2: Replace `/feed` with compatibility redirect or thin wrapper**

Prefer redirecting to `/mysquare?mode=chronological` for legacy feed links unless product testing justifies another mapping.

- [ ] **Step 3: Do not alter legacy `client/src/pages/Home.tsx` in this task**

Legacy cleanup requires its own migration/removal decision.

- [ ] **Step 4: Commit**

```bash
git add app/'(dashboard)'/feed/page.tsx app/'(dashboard)'
git commit -m "refactor: make MySquare the canonical home surface"
```

---

### Task 13: Add member preference export

**Files:**
- Create: `app/api/mysquare/export/route.ts`
- Create: `lib/mysquare/export.ts`
- Test: export contract tests

**Interfaces:**
- Produces portable JSON for MySquare settings and eligible membership/follow state.

- [ ] **Step 1: Write failing export test**

Export must contain explicit preferences and must not silently include sensitive profile/access data unrelated to the export request.

- [ ] **Step 2: Implement versioned export schema**

```ts
{
  schemaVersion: 1,
  exportedAt: "...",
  mySquarePreferences: { ... },
  communityMemberships: [ ... ],
  followedResources: [ ... ]
}
```

- [ ] **Step 3: Add authentication/authorisation checks**

Only the member or an explicitly authorised delegate may export the member's data.

- [ ] **Step 4: Commit**

```bash
git add app/api/mysquare/export lib/mysquare/export.ts
git commit -m "feat: add portable MySquare export"
```

---

### Task 14: Add the Personal Community Agent only after deterministic MySquare is stable

**Files:**
- Create: `lib/mysquare/agent/policy.ts`
- Create: `lib/mysquare/agent/plan.ts`
- Create API/UI only after contract approval
- Test: policy and authority tests

**Interfaces:**
- Consumes: member-authored instructions, existing MySquare preferences, provenance and moderation rules.
- Produces: a proposed information plan; no autonomous posting/action authority by default.

- [ ] **Step 1: Write authority tests before any model call**

```ts
it("cannot post or message on behalf of a member without explicit action authority", ...)
it("cannot expand beyond the member attention budget", ...)
it("cannot use OpenAds commercial value as an objective", ...)
it("must retain provenance for summarised sources", ...)
```

- [ ] **Step 2: Start read-only**

The first agent version may select, summarise and transform information for the member. It must not autonomously post, reply, message, join communities or purchase anything.

- [ ] **Step 3: Preserve inspectability**

Expose the member's instruction, applied constraints, source list and reason for inclusion/exclusion where practical.

- [ ] **Step 4: Add model integration behind a replaceable interface**

Do not couple MySquare ranking correctness to one model provider.

- [ ] **Step 5: Commit**

```bash
git add lib/mysquare/agent
git commit -m "feat: add read-only personal community agent policy"
```

---

## Acceptance Gate

The Member Sovereignty milestone is complete only when all of the following are demonstrated:

- MySquare is the canonical Next.js home surface.
- Chronological mode remains first-class.
- Personalisation can be disabled without losing essential functionality.
- The finite briefing reaches a real caught-up state.
- Attention budget is enforced.
- Major ranking weights are member-editable.
- Recommendation explanations are accessible.
- Provenance is preserved and shown where known.
- AI/access transformations retain `View original`.
- OpenAds/commercial values cannot alter organic ranking, proven by automated tests.
- No sensitive disability/access data is added as default ad-targeting input.
- Outcome-oriented analytics exist without becoming hidden engagement optimisation.
- Member preference export works.
- Personal Community Agent, if enabled, starts read-only and cannot impersonate the member.
- Accessibility testing passes at WCAG 2.2 AA target with manual keyboard/screen-reader checks recorded.

## Execution handoff

Recommended execution mode: **superpowers:subagent-driven-development**. Use a fresh implementation/review cycle for each task and do not merge the design PR merely to begin implementation; open a separate implementation branch after this plan is approved.
