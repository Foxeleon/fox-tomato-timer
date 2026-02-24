## Purpose

- What problem does this PR solve?
- Which domain is affected? (timer/tasks/statistics/categories/platform/store)

## Scope

- [ ] Feature
- [ ] Bugfix
- [ ] Refactor
- [ ] Dependencies update
- [ ] Tests only
- [ ] Docs only

## Architecture checklist

- [ ] No direct platform API usage (window/document/chrome/Telegram) without an adapter
- [ ] No high-frequency timer ticks dispatched into NgRx store
- [ ] Store changes are domain-scoped (store/<domain>/...)
- [ ] No domain orchestration placed into shared/services

## Standalone policy

- [ ] No usage of `standalone: true` (project policy)
- [ ] If a component has `imports`, it is treated as standalone by convention

## Performance

- [ ] ChangeDetectionStrategy.OnPush kept (or reason documented)
- [ ] No unnecessary subscriptions in constructors
- [ ] No heavy computations inside selectors

## Tests

- [ ] Unit tests added/updated (reducers/selectors/effects/domain services)
- [ ] Playwright e2e smoke passed (or not applicable)
- [ ] No flaky tests introduced

## Build

- [ ] `pnpm install --frozen-lockfile` succeeds locally/CI
- [ ] `pnpm run build` succeeds
- [ ] `pnpm test` succeeds

## Notes for reviewers

- Risks:
- Rollback plan:
- Follow-ups:
