# CripSquare Member Sovereignty Architecture

**Status:** Approved architectural amendment  
**Date:** 2026-09-15  
**Applies to:** DisabilitySquare / CripSquare Open Platform  
**Supersedes:** Generic attention-feed assumptions where they conflict with this document

## 1. Architectural decision

CripSquare will not optimise for maximum time-on-platform, compulsive return, advertising yield, or opaque behavioural prediction. It will optimise for member-defined community outcomes under explicit accessibility, privacy, attention-budget, provenance, safety, and commercial-separation constraints.

The primary product metaphor is a **village square**, not an infinite feed. The primary information surface is **MySquare**, a finite, user-controlled community briefing with a genuine caught-up state.

## 2. Constitutional product objective

> Help each member find the people, knowledge, support, opportunities, and community interactions they intentionally seek, in an accessible form, with the least unnecessary attention cost.

Ranking and discovery may favour:

- user intent;
- explicit preferences;
- community relevance;
- locality selected by the member;
- meaningful connection;
- accessibility fit;
- task completion;
- provenance and trust signals;
- safety; and
- explicit attention budgets.

Organic ranking must not optimise for:

- advertising payment;
- predicted compulsive return;
- inferred vulnerability;
- inferred disability or health status;
- maximum screen time; or
- monetisation value of the member.

## 3. Member Sovereignty Charter

The following are platform invariants.

1. **Recommendation is optional.** Members can disable personalised recommendation and retain essential platform functionality.
2. **Chronological mode is first-class.** A member can choose chronological community views without functional penalty.
3. **Finite consumption is supported.** MySquare must reach a genuine **You're caught up** state rather than manufacturing filler.
4. **Explicit preference outranks sensitive inference.** Disability, health, communication, support, and access needs must not be inferred for ranking where explicit user choices can serve the purpose.
5. **Every personalised recommendation is explainable.** Members can ask **Why am I seeing this?** and receive a comprehensible answer.
6. **Commercial payment cannot alter organic relevance.** OpenAds payment, bids, sponsorships, or commercial relationships cannot modify ordinary community recommendation scores.
7. **Accessibility is infrastructure.** Accessible representations are generated from the same underlying community content instead of creating segregated accessible versions.
8. **Original content remains available.** AI transformation, summarisation, translation, Easy Read, AAC-oriented presentation, or other transformation cannot hide or replace the source.
9. **Provenance is preserved.** Human, AI-assisted, AI-generated, organisational, government, journalistic, lived-experience, and unverified origins remain distinguishable where known.
10. **AI does not impersonate people.** Synthetic accounts or materially synthetic content must be identified.
11. **Member preferences are portable.** MySquare preferences, communities, and eligible social-graph data require export paths.
12. **Success is outcome-oriented.** Time to Useful Outcome and accessibility/community outcomes are first-class metrics; time-on-platform is not a primary success objective.
13. **Attention is a constrained resource.** Members may set explicit volume and frequency limits for summaries, recommendations, discovery, and notifications.
14. **Community governance is participatory.** Moderation rules and review/appeal processes must support accessible disabled-member participation.

## 4. Canonical product loop

Traditional attention-platform economics often resemble:

```text
User -> behavioural data -> prediction -> engagement -> advertising -> more optimisation
```

CripSquare instead targets:

```text
Member -> explicit preferences -> useful community information -> meaningful interaction -> member-defined outcome
```

The platform should be capable of treating a four-minute successful session as better than a forty-minute aimless session.

## 5. MySquare as the primary home surface

MySquare replaces the conventional infinite home feed as CripSquare's principal personalised surface.

### 5.1 Allowed inputs

MySquare may use:

- explicit interests and communities;
- local areas selected by the member;
- direct replies, mentions, and messages;
- saved topics and followed creators;
- explicit policy/news interests;
- member-selected discovery settings;
- member-configured attention budget;
- OpenAccess presentation preferences; and
- moderation/safety constraints.

MySquare must not require behavioural surveillance to function.

### 5.2 Output classes

The finite briefing should distinguish:

1. Direct / addressed to me
2. Important changes in my communities
3. Local/community opportunities
4. Questions I may be able to help answer
5. Member-selected news/policy updates
6. Optional discovery
7. Clearly separated sponsored material, if enabled

### 5.3 Caught-up state

A caught-up state is a product requirement, not an accidental empty state. When the selected scope is exhausted, the interface must stop recommending filler simply to prolong consumption.

## 6. MySquare Ranking: MSR-1

MSR-1 is a user-controlled ranking policy, not a black-box engagement score.

A recommendation score may combine explicit member weights for:

- directness;
- community priority;
- locality;
- recency;
- relationship relevance;
- member-selected topic importance;
- unanswered-helpfulness opportunity;
- accessibility fit; and
- source/provenance preferences.

Members must be able to alter major ranking dimensions through understandable controls rather than hidden model parameters.

Every personalised result should expose a structured explanation such as:

```json
{
  "reasons": [
    "You joined Northern Sydney",
    "You asked to see local accessibility events",
    "This event is in your selected area"
  ],
  "commercialInfluence": false,
  "personalisationEnabled": true
}
```

## 7. Chronological mode and recommendation-off mode

CripSquare must preserve a first-class chronological experience.

Turning personalisation off must not disable:

- community membership;
- forums;
- posting and replying;
- messaging;
- search;
- moderation/reporting;
- events;
- creator/media access; or
- accessibility features.

The existing repository's chronological feed behaviour is therefore a compatibility asset, not something to remove.

## 8. Commercial separation

Organic recommendation and advertising are separate computational domains.

### 8.1 Hard boundary

OpenAds may influence ordering only within explicitly designated sponsored inventory. Advertising spend, bids, CPM/CPC values, sponsorship value, or advertiser priority must never enter MSR-1 organic ranking inputs.

### 8.2 Sensitive-data firewall

The following are prohibited as default OpenAds targeting inputs:

- disability diagnosis or inferred disability;
- health conditions;
- AAC or communication needs;
- support requirements;
- accessibility preferences;
- inferred vulnerability; and
- private community participation.

Contextual advertising and explicit commercial-category preferences may be used where policy permits.

### 8.3 Testable invariant

Automated tests must prove that changing advertising payment or bid values cannot change organic recommendation ordering for identical organic inputs.

## 9. Personal Community Agent

The MySquare Agent is a user-delegated information agent. Its instruction source is the member, not the platform's advertising or engagement objective.

Example:

> Show me what changed in my local groups today, anything directly addressed to me, unanswered accessibility questions I might be able to help with, and important disability-policy news. Skip provider promotions and show no more than fifteen items.

The agent optimises for utility, meaningful connection, accessibility, member intent, and task completion subject to attention budget, privacy, safety, provenance, moderation rules, and explicit user constraints.

The agent must not:

- secretly optimise for advertising value;
- infer sensitive disability attributes to expand targeting;
- fabricate provenance;
- silently suppress the original source after transformation; or
- impersonate the member without explicit authority.

## 10. OpenAccess transformation layer

CripSquare supports multiple accessible representations of the same underlying community content, including:

- plain English;
- Easy Read;
- shorter-post view;
- summary-first view;
- AAC-friendly phrasing;
- text-to-speech;
- translation;
- captions;
- image descriptions;
- audio-description metadata;
- reduced cognitive-load layouts;
- high-contrast presentation;
- larger interaction targets;
- reduced/no animation; and
- slower notification cadence.

OpenAccess transforms presentation, not the author's underlying opinion.

Each AI-assisted transformation must retain:

- a path to the original content;
- transformation type;
- source version;
- timestamp;
- model/tool identifier where applicable; and
- the member preference or explicit request that caused the transformation.

## 11. Provenance model

Provenance is a first-class content property.

Supported provenance categories include:

- `human-written`
- `ai-assisted`
- `ai-generated`
- `organisation-statement`
- `government-source`
- `news-report`
- `community-experience`
- `unverified`

These labels identify origin, not truth or quality.

A content object should be able to retain author/source identity, source URL, original resource reference, citations, AI involvement, transformations, and timestamps.

For AI summaries, provenance must preserve the source chain:

```text
Original source -> extracted/source propositions -> AI summary -> open original
```

The source must not disappear behind the synthesis.

## 12. Success metrics

Operational metrics such as DAU/MAU may still be collected where privacy policy permits, but they are not the principal product objective.

Primary outcome measures should include:

- Time to Useful Outcome;
- unanswered questions receiving useful responses;
- meaningful connections made;
- accessible events/resources discovered;
- peer-support requests answered;
- successful access to advocacy resources;
- recommendation comprehension;
- successful recommendation customisation;
- accessibility task completion;
- harmful interaction rate;
- unwanted-content rate;
- unwanted interruption rate; and
- user-reported cognitive burden.

## 13. Growth model

CripSquare optimises for healthy community density, not maximum crowd size.

The target is enough density for people to reliably find one another through:

- Local Squares;
- disability / lived-experience communities;
- interest communities;
- peer-support spaces;
- advocacy organisations;
- creator communities; and
- community resources.

The platform may intentionally prefer many healthy village squares over one universal public arena.

## 14. Interoperability and portability

The architecture should keep future ActivityPub and portable-identity compatibility practical without making federation a prerequisite for the first release.

Export paths should progressively cover:

- MySquare preferences;
- community memberships;
- saved/followed resources;
- eligible social-graph relationships;
- creator provenance; and
- member-authored content where policy permits.

## 15. Repository implementation boundary

The current repository contains both a legacy Vite/Express surface (`client/`, `server/`) and a newer Next.js App Router surface (`app/`, `lib/`). New Member Sovereignty work will target the **Next.js surface as canonical**.

Rules:

- `app/`, `lib/`, `components/`, `shared/`, and Drizzle migrations are the primary implementation targets for new MySquare work.
- `client/` and `server/` remain compatibility/legacy surfaces during migration and should not receive duplicate MySquare implementations.
- Existing chronological behaviour in the legacy client remains a reference for the no-algorithm mode.
- `/feed` should become a compatibility route or redirect once `/mysquare` is production-ready rather than maintaining two divergent home experiences.

## 16. Development gates

Before production implementation:

1. Preserve this document as the governing design amendment.
2. Use the repo-specific implementation plan in `docs/superpowers/plans/2026-09-15-cripsquare-member-sovereignty-implementation-plan.md`.
3. Implement task-by-task with TDD and review checkpoints.
4. Do not introduce OpenAds ranking inputs until the organic-ranking firewall tests exist.
5. Do not introduce Personal Community Agent autonomous actions until member authority, provenance, and audit contracts exist.
6. Do not remove chronological mode during migration.

## 17. Positioning

> **CripSquare isn't trying to build a better attention economy. It is trying to build a social network that doesn't require an attention economy at all.**

This statement should guide product, engineering, analytics, AI, accessibility, moderation, commercial design, and governance decisions.
