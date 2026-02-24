# FoxTomatoTimer

Pomodoro technique timer application.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Angular](https://img.shields.io/badge/Angular-21.1.5-red)
![License](https://img.shields.io/badge/license-MIT-green)

## About

FoxTomatoTimer is a productivity application based on the Pomodoro technique: work with full concentration for a fixed interval, then take a short break. After several cycles, take a longer break.

This repository is designed to evolve into a multi-platform product:
- Web app
- Telegram mini-app
- Chrome/Chromium extension
- Android app (WebView/PWA-like runtime)

A future backend is planned on AWS Serverless.

## Features (current & planned)

- Customizable work/rest intervals
- Productivity statistics (analytics-first approach)
- Notifications about interval start/end (platform-adapted)
- Task management with categories
- Multi-platform support roadmap (Web / Telegram / Extension / Android)
- AWS Serverless backend integration (planned)

## Tech stack

- Angular 21 (standalone bootstrap via `bootstrapApplication`)
- NgRx (centralized store, domain-sliced inside `src/app/store`)
- Angular Material / CDK
- TypeScript
- RxJS
- Package manager: pnpm
- Unit tests: Jest
- E2E tests: Playwright (planned/being introduced)

## Project architecture (high level)

Key conventions used in this repo:

- Standalone policy:
  - The project does NOT use `standalone: true`.
  - Convention: if a component/directive/pipe has `imports` in its decorator, it is treated as standalone.

- Timer tick policy:
  - High-frequency timer ticks must NOT be dispatched into NgRx every second.
  - Timer ticks belong in a dedicated timer engine/service outside the store.
  - NgRx stores discrete domain events and parameters (start/pause/resume/stop/reset, duration, outcomes).

For the full rules and anti-pattern list, read:
- `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`

## Getting started

### Requirements

- Node.js 20.20.0 (or compatible with the project's Angular version)
- pnpm (use the version installed on your machine; keep `pnpm-lock.yaml` consistent)

### Installation & run

```bash
# Clone the repository
git clone https://github.com/Foxeleon/fox-tomato-timer.git
cd fox-tomato-timer

# Install dependencies
pnpm install

# Start dev server
pnpm start
```

Open `http://localhost:4200/` in your browser.

## Development

### Dev server

```bash
pnpm start
```

### Build

```bash
pnpm run build
```

Build artifacts will be stored in `dist/`.

### Unit tests (Jest)

```bash
pnpm test
```

### E2E tests (Playwright)

E2E is planned/being introduced. Once configured, the command will be documented here (for example `pnpm e2e`).

## Contribution

- Use pnpm only (do not mix npm/yarn with pnpm in this repo).
- Follow the architecture rules in `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`.
- Use the PR checklist template in `.github/pull_request_template.md`.

## Roadmap

- Telegram mini-app integration
- Chrome/Chromium extension
- Android app runtime packaging
- AWS Serverless backend (auth, storage, analytics pipeline)
- Playwright E2E suite (smoke + regression scenarios)

## License

MIT

## Author

- Foxeleon — https://github.com/Foxeleon

---

# FoxTomatoTimer (RU)

Таймер для техники Pomodoro (“помидорной техники”).

![Версия](https://img.shields.io/badge/версия-0.1.0-blue)
![Angular](https://img.shields.io/badge/Angular-21.1.5-red)
![Лицензия](https://img.shields.io/badge/лицензия-MIT-green)

## О проекте

FoxTomatoTimer — приложение для повышения продуктивности на основе техники Pomodoro: работа с полной концентрацией заданное время, затем короткий перерыв. После нескольких циклов — длинный перерыв.

Репозиторий развивается в сторону мультиплатформенного продукта:
- Web
- Telegram mini-app
- расширение Chrome/Chromium
- Android (WebView/PWA-подобный рантайм)

В перспективе планируется бекенд на AWS Serverless.

## Возможности (текущие и планируемые)

- Настраиваемые интервалы работы/отдыха
- Статистика продуктивности (подход “analytics-first”)
- Уведомления о старте/конце интервалов (с учётом платформы)
- Задачи и категории
- Дорожная карта мультиплатформенности (Web / Telegram / Extension / Android)
- Интеграция с AWS Serverless (план)

## Технологии

- Angular 21 (standalone bootstrap через `bootstrapApplication`)
- NgRx (централизованный store, доменные срезы внутри `src/app/store`)
- Angular Material / CDK
- TypeScript
- RxJS
- Менеджер пакетов: pnpm
- Unit-тесты: Jest
- E2E: Playwright (планируется/в процессе внедрения)

## Архитектура (высокий уровень)

Ключевые соглашения:

- Standalone policy:
  - В проекте НЕ используется `standalone: true`.
  - Соглашение: если у компонента/директивы/пайпа есть `imports` в декораторе, он считается standalone.

- Политика тиков таймера:
  - Высокочастотные тики не диспатчатся в NgRx каждую секунду.
  - Тики живут в отдельном timer engine/service вне store.
  - NgRx хранит дискретные события и параметры (start/pause/resume/stop/reset, duration, итоги).

Полные правила и анти-паттерны:
- `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`

## Быстрый старт

### Требования

- Node.js 20.20.0 (или совместимая версия под Angular проекта)
- pnpm (важно сохранять консистентность `pnpm-lock.yaml`)

### Установка и запуск

```bash
git clone https://github.com/Foxeleon/fox-tomato-timer.git
cd fox-tomato-timer

pnpm install
pnpm start
```

Открой `http://localhost:4200/` в браузере.

## Разработка

### Dev server

```bash
pnpm start
```

### Build

```bash
pnpm run build
```

Артефакты сборки будут в `dist/`.

### Unit-тесты (Jest)

```bash
pnpm test
```

### E2E (Playwright)

E2E планируется/в процессе внедрения. После настройки команда будет описана здесь (например `pnpm e2e`).

## Contribution

- Использовать только pnpm (не смешивать npm/yarn с pnpm).
- Следовать правилам в `docs/architecture/ARCHITECTURE_AND_CODE_STYLE.md`.
- Использовать чек-лист PR из `.github/pull_request_template.md`.

## Планы развития

- Telegram mini-app
- расширение Chrome/Chromium
- Android упаковка/рантайм
- AWS Serverless бекенд (auth, storage, analytics)
- Playwright E2E (smoke + regression)

## Лицензия

MIT

## Автор

- Foxeleon — https://github.com/Foxeleon
```
