# FoxTomatoTimer — Architecture & Code Style Guide (v1)

This document is the single source of truth for the FoxTomatoTimer project architecture and code style.
Any rule change must be done via a dedicated PR with rationale, risks, and a migration plan.

## 0) Context and goals

Project: a Pomodoro productivity app with analytics.
Platforms: Web, Telegram mini-app, Chrome extension, Android app (WebView/PWA-like runtime).
Backend plan: AWS Serverless.

Current stack (locked-in):
- Angular (standalone bootstrap via `bootstrapApplication`)
- Angular Material/CDK
- NgRx
- pnpm
- Jest
- E2E: Playwright

Goals:
- scale without “rewriting from scratch”
- clear domain boundaries (timer/tasks/statistics/categories)
- no “double sources of truth”
- readiness for platform integrations (Telegram/extension/android)
- testable logic (unit) and regressions (e2e)

Non-goals:
- immediate refactoring of the current codebase
- making zoneless mandatory (may be a separate initiative)

## 1) Architectural principles (invariants)

1) Single source of truth per data type:
- domain state and discrete events: NgRx
- high-frequency time (ticks): a timer engine outside the store
- short-lived UI state: local to the component

2) Domain isolation:
- timer does not “know” tasks internals and vice versa
- integration happens via store events and facades, not via direct calls to “another feature’s service”

3) Platform isolation from features:
- Telegram/extension/android specifics live in platform adapters
- features do not call Web APIs directly (`window`, `document`, `chrome.*`) without an adapter

4) Determinism and reproducibility:
- selectors do not use `Date.now()` and do not read global singletons
- any time computation must rely on explicitly provided parameters

## 2) Terminology and layers (what lives where)

Layers:
- `components/`: domain features (timer/tasks/statistics/categories) and their UI
- `store/`: centralized NgRx, grouped by domain (timer/tasks/statistics/categories)
- `shared/`: only truly reusable code, no domain orchestration
- `core/`: infrastructure and platform integrations (introduced as needed)

Definitions:
- domain service / engine: domain business logic not tied to UI
- facade: a layer that simplifies UI access to store + domain services
- platform adapter: integration implementation for a runtime environment (Telegram, extension, android-webview)

## 3) Standalone policy (important)

The project does NOT use `standalone: true`.

Rule:
- if a component/directive/pipe has an `imports` field in its decorator, it is treated as standalone by convention.
- dependencies are wired via `imports: [...]` and application-level provider configuration.

Consistency rule:
- mixing styles is forbidden (never introduce `standalone: true` in some places while omitting it in others).

## 4) Target directory structure (compatible with current)

Target structure (evolutionary, no forced “move” today):

```
src/app/
app.config.ts
app.routes.ts
app.component.*

components/
timer/
tasks/
statistics/
categories/

store/
timer/
timer.actions.ts
timer.reducer.ts
timer.selectors.ts
timer.effects.ts
index.ts
tasks/
statistics/
categories/
index.ts

shared/
interfaces/
ui/            # introduced when reusable UI blocks grow
pipes/         # introduced when formatting/presentation grows
util/          # pure helpers only
services/      # infrastructure-only or truly shared services

core/            # introduced when platform integrations appear
platform/
telegram/
browser-extension/
android-webview/
storage/
http/
config/
observability/
```

Transition mode:
- if part of the store still exists under “technical folders” (actions/effects/reducers/selectors), new files must still be created in domain-grouped structure.

## 5) Store (NgRx): rules

### 5.1 What is stored in the store
- discrete domain events (start/pause/resume/stop/reset, task state changes)
- session parameters (duration, modes, settings)
- tasks/categories/statistics data that must survive UI restarts

### 5.2 What must NOT be stored in the store
- per-second (or more frequent) tick updates
- computations dependent on “current system time” inside selectors

### 5.3 Selectors
- must be deterministic
- complex time computations must happen outside selectors (domain service / engine)

### 5.4 Effects
- must not touch the DOM directly
- platform calls must go through adapter interfaces (`core/platform/*`)
- must not dispatch tick actions

### 5.5 Organization
- the store is centralized but domain-grouped:
  `store/timer`, `store/tasks`, `store/statistics`, `store/categories`
- each domain folder must have an `index.ts` as the single export entry point

## 6) Timer: “ticks outside the store”

Critical rule:
- no `store.dispatch(...)` on every second.

Target model:
- a timer engine (domain service) exposes `remainingMs$` and status.
- the store keeps status and parameters (start/pause timestamps, duration, outcomes).
- on interval completion, a single discrete “completed” event is emitted.

Engine placement:
- `components/timer/domain/timer-engine.service.ts` (or equivalent)
- the engine does not depend on NgRx, `TasksService`, or platform APIs.

Timer ↔ tasks coupling:
- via effects or facades reacting to domain actions.
- forbidden: timer engine directly dispatches task actions or calls task service methods.

## 7) Shared and Core: boundaries

`shared/interfaces`:
- only types used by more than one domain.

`shared/services`:
- infrastructure and truly reusable services, e.g.:
  - time formatting (if shared)
  - DTO mapping
  - common storage utilities (if not platform-specific)
- forbidden: storing domain orchestration here (timer controlling tasks, etc.).

`core/` (introduced with integrations):
- Telegram WebApp adapter
- Chrome extension adapter
- Android WebView adapter
- storage abstraction
- HTTP client/interceptors
- observability/logging

## 8) Multiplatform approach

Principle:
- domains must not know where they run.

Platform layer:
- defined via interfaces + DI tokens.
- implementations are selected per environment (web/telegram/extension/android).

Rule:
- direct calls to `window`, `document`, `chrome.*`, Telegram WebApp API from components and effects are forbidden without an adapter.

## 9) Testing

### 9.1 Unit (Jest)
Mandatory unit test targets:
- reducers
- selectors (pure)
- effects (with mocks)
- domain services / engines

Rule:
- logic must be extractable from UI so it can be tested without DOM.

### 9.2 E2E (Playwright)
Goals:
- smoke + regression scenarios.

Minimum MVP scenarios:
- start/pause/resume/reset timer
- create a task and change its state
- verify “page reload” behavior (if persistence is enabled)
- basic route navigation

Stability rule:
- e2e does not depend on “real Telegram”.
- Telegram behavior is mocked via a platform adapter.

## 10) Dependency management (pnpm)

Rules:
- single package manager: pnpm
- CI uses `pnpm install --frozen-lockfile`
- mixing npm/yarn with pnpm in the same repo is forbidden

Dependency updates:
- only via a dedicated PR
- after updates, required checks: build, unit, e2e smoke

## 11) Code style: baseline rules

Components:
- thin components: UI + minimal glue logic
- `ChangeDetectionStrategy.OnPush` by default
- minimize subscriptions in constructors

RxJS:
- uncontrolled `subscribe` is forbidden
- prefer `async` pipe and lifecycle-managed subscriptions

Imports:
- import the minimum required Material modules
- order of `imports` in a component decorator:
  1) Angular modules
  2) Router directives
  3) Material modules
  4) local components/pipes

Files:
- component folder contains its html/scss/spec
- split large decorators: move animations/config into separate files when they grow

## 12) Anti-patterns (forbidden)

Time:
- tick actions every second in the store
- `remainingTime` stored both in store and in a service as a “second truth”
- `Date.now()` inside selectors

Architecture:
- `shared` becoming “everything that doesn’t fit anywhere”
- effects touching platform APIs directly
- god components (huge constructors, many subscriptions)

Dependencies:
- Angular ecosystem version drift
- mixing package managers

Tests:
- no unit tests for reducers/selectors while using NgRx
- e2e tests coupled to real external systems

## 13) Evolution plan (no refactor now)

Iteration 1:
- commit this document
- add PR template
- start placing new store code in domain-grouped structure

Iteration 2:
- add `core/platform/*` as “empty adapters”
- set up Playwright smoke suite

Iteration 3:
- integrate Telegram mini-app via adapters + auth strategy
- prepare AWS Serverless contracts (API + event log)

Iteration 4:
- refactor timer engine; decouple timer/tasks via domain events
