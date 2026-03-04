# 🎯 FoxTomatoTimer 1.0

[![Angular 21.2.0](https://img.shields.io/badge/Angular-21.2.0-red?logo=angular)](https://angular.dev)
[![NgRx](https://img.shields.io/badge/NgRx-blue?logo=ngrx)](https://ngrx.io)
[![Zoneless](https://img.shields.io/badge/Zoneless-brightgreen)](https://angular.dev/guide/signals)
[![CI/CD](https://img.shields.io/badge/CI--CD-GitHub%20Actions-brightgreen)](https://github.com/Foxeleon/fox-tomato-timer/actions)
[![pnpm](https://img.shields.io/badge/pnpm-strict-orange?logo=pnpm)](https://pnpm.io)

A modern, scalable Pomodoro productivity app built with Angular 21.2.0 (Zoneless). Prepared for multi-platform integration (Web, Telegram Mini App, Browser Extension) and an AWS Serverless backend.

---

## 🛠️ Tech Stack & Infrastructure

| Category | Details |
|---|---|
| Core | Angular 21.2.0 (`provideZonelessChangeDetection` enabled, `zone.js` removed) |
| UI | Angular Material / CDK |
| State | Domain-Driven NgRx (global store for discrete domain events) + `@ngrx/signals` (SignalStore for high-frequency Timer Engine) |
| Routing | Feature-based routing with lazy loading (e.g. `/timer`, `/tasks`) |
| Quality | ESLint, Prettier, Husky (pre-commit), Jest, Playwright |
| CI/CD | GitHub Actions pipeline (lint → tests → build) |
| Dependencies | pnpm only; lockfile is required and treated as a build artifact |

---

## 🚀 Architecture 2.0 Highlights

### ⚡ Zoneless performance, explicit reactivity

FoxTomatoTimer 2.0 runs without `zone.js`. UI updates are driven by explicit signals and deliberate state transitions instead of implicit zone-driven change detection.

Key conventions:
- `ChangeDetectionStrategy.OnPush` by default for components.
- Signals are the primary reactivity primitive for new code.
- RxJS is retained where it naturally models async streams (notably NgRx effects and integration flows).

### ⏱️ Timer Engine: ticks outside the global store

High-frequency ticks must never flood the NgRx store. The Timer Engine is designed to update UI-facing signals at a high cadence while keeping the global store clean and audit-friendly.

Rules enforced by design:
- No per-second `store.dispatch(...)`.
- NgRx stores discrete events and durable session parameters only (start/pause/resume/stop/reset/completed, durations, outcomes).
- Time computations are performed in a domain service/engine, not inside selectors.

### 🧱 Domain-driven state boundaries

The global store is domain-grouped (timer, tasks, statistics, categories) rather than organized by “technical type” folders. This keeps responsibilities explicit and prevents cross-feature coupling.

Expected structure pattern:
- `src/app/store/timer/*` (actions/reducer/selectors/effects + `index.ts`)
- `src/app/store/tasks/*`
- `src/app/store/statistics/*`
- `src/app/store/categories/*`

Cross-domain interaction:
- via NgRx actions/effects/facades
- never via direct “feature service → another feature service” calls

### 🌐 Platform abstraction layer (multi-platform ready)

Features must not call platform APIs directly (`window`, `document`, Telegram WebApp API, `chrome.*`). All platform-specific behavior goes through `core/platform` adapters (DI-injected interfaces).

Why this matters:
- keeps domains portable across runtimes (Web, Telegram Mini App, Browser Extension)
- makes tests deterministic (platform behavior can be mocked without real Telegram/extension APIs)

For the complete architecture rules and forbidden patterns:
- `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`

---

## 🚀 Getting Started

```bash
git clone https://github.com/Foxeleon/fox-tomato-timer.git
cd fox-tomato-timer
pnpm install --frozen-lockfile
pnpm start
```

Common commands:
```bash
pnpm run lint
pnpm run test:ci   # or: pnpm test
pnpm run build --configuration production
```

Notes:
- pnpm is the only supported package manager for this repo.
- CI expects reproducible installs (`--frozen-lockfile`).

---

## 🧭 Roadmap / What’s Next

Planned / prepared work (non-exhaustive):
- Implement a real Telegram Platform Adapter (currently mocked for local development and tests).
- Define and connect AWS API Gateway contracts and Serverless backend integrations.
- Expand Playwright E2E coverage for the feature-routed flows.

---

## 📄 License

MIT

---

# 🎯 FoxTomatoTimer 1.0 (Русский)

[![Angular 21.2.0](https://img.shields.io/badge/Angular-21.2.0-red?logo=angular)](https://angular.dev)
[![NgRx](https://img.shields.io/badge/NgRx-blue?logo=ngrx)](https://ngrx.io)
[![Zoneless](https://img.shields.io/badge/Zoneless-brightgreen)](https://angular.dev/guide/signals)
[![CI/CD](https://img.shields.io/badge/CI--CD-GitHub%20Actions-brightgreen)](https://github.com/Foxeleon/fox-tomato-timer/actions)
[![pnpm](https://img.shields.io/badge/pnpm-strict-orange?logo=pnpm)](https://pnpm.io)

Современное, масштабируемое приложение для продуктивности по технике Pomodoro на Angular 21.2.0 (Zoneless). Подготовлено для мультиплатформенной интеграции (Web, Telegram Mini App, Browser Extension) и будущего бэкенда на AWS Serverless.

---

## 🛠️ Технологии и инфраструктура

| Категория | Детали |
|---|---|
| Ядро | Angular 21.2.0 (`provideZonelessChangeDetection` включён, `zone.js` удалён) |
| UI | Angular Material / CDK |
| Состояние | Domain-Driven NgRx (глобальный store для дискретных доменных событий) + `@ngrx/signals` (SignalStore для высокочастотного Timer Engine) |
| Роутинг | Feature-based routing с lazy loading (например `/timer`, `/tasks`) |
| Качество | ESLint, Prettier, Husky (pre-commit), Jest, Playwright |
| CI/CD | пайплайн GitHub Actions (lint → tests → build) |
| Зависимости | только pnpm; lockfile обязателен для воспроизводимости |

---

## 🚀 Архитектура 2.0 — ключевые идеи

### ⚡ Zoneless: явная реактивность и предсказуемый рендеринг

FoxTomatoTimer 2.0 работает без `zone.js`. Обновления UI происходят через явные сигналы и осмысленные переходы состояния, а не через неявные “побочные” триггеры.

Ключевые конвенции:
- `ChangeDetectionStrategy.OnPush` по умолчанию.
- Signals — основной примитив реактивности для нового кода.
- RxJS остаётся там, где он уместен (в первую очередь NgRx effects и интеграционные потоки).

### ⏱️ Timer Engine: тики вне глобального store

Высокочастотные тики таймера не должны “засорять” NgRx store. Timer Engine обновляет UI-сигналы часто, а глобальный store хранит только дискретные события и долговременные параметры сессии.

Правила, которые считаются обязательными:
- никаких `store.dispatch(...)` каждую секунду
- NgRx хранит дискретные события и параметры (start/pause/resume/stop/reset/completed, длительности, результаты)
- временные вычисления живут в доменном engine/сервисе, а не в селекторах

### 🧱 Domain-Driven границы состояния

Глобальный store организован по доменам (timer, tasks, statistics, categories), а не по “техническим типам”. Это упрощает поддержку, закрепляет ответственность и уменьшает связанность.

Ожидаемый паттерн структуры:
- `src/app/store/timer/*` (actions/reducer/selectors/effects + `index.ts`)
- `src/app/store/tasks/*`
- `src/app/store/statistics/*`
- `src/app/store/categories/*`

Междоменное взаимодействие:
- через NgRx actions/effects/facades
- не через прямые вызовы сервисов между фичами

### 🌐 Платформенная абстракция (готовность к мультиплатформе)

Прямые вызовы платформенных API (`window`, `document`, Telegram WebApp API, `chrome.*`) запрещены в фичах и эффектах. Любая платформенная логика должна идти через адаптеры `core/platform` (интерфейсы + DI).

Зачем это нужно:
- переносимость доменов между окружениями (Web, Telegram Mini App, Browser Extension)
- детерминированные тесты (моки вместо реальных внешних систем)

Полные правила архитектуры и список анти-паттернов:
- `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/Foxeleon/fox-tomato-timer.git
cd fox-tomato-timer
pnpm install --frozen-lockfile
pnpm start
```

Частые команды:
```bash
pnpm run lint
pnpm run test:ci   # или: pnpm test
pnpm run build --configuration production
```

Заметки:
- в репозитории поддерживается только pnpm
- CI ожидает воспроизводимую установку (`--frozen-lockfile`)

---

## 🧭 Roadmap / Что дальше

Запланировано / подготовлено (не исчерпывающий список):
- Реализовать “боевой” Telegram Platform Adapter (сейчас используется мок для локальной разработки и тестов).
- Определить и подключить контракты AWS API Gateway и Serverless бэкенд-интеграции.
- Расширить покрытие Playwright E2E для feature-роутинга.

---

## 📄 Лицензия

MIT
