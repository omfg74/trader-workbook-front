# Дневник трейдера — Angular frontend

SPA для работы с API `trader-workbook`.

## Стек

- Angular 19 (standalone)
- Angular Material
- RxJS
- SCSS
- Docker (`serve` — статика SPA)

## Локальный запуск

1. Поднимите бэкенд на `http://localhost:8000`.
2. Установите зависимости и запустите dev-сервер:

```bash
npm install
npm start
```

Приложение: http://localhost:4200  
API URL в development: `http://localhost:8000` (`src/environments/environment.development.ts`).

## Docker

Контейнер только отдаёт статику на порту `4200`. Прокси `/api/` и `/auth/` на бэкенд настраивается во внешнем reverse proxy.

```bash
docker compose up --build
```

Фронт: http://localhost:4200

## Учётки

Админ создаётся бэкендом из env (`ADMIN_USERNAME` / `ADMIN_PASSWORD`, по умолчанию `admin` / `admin`).

## Структура

```
src/app/
  core/       # auth, interceptors, guards, services, models
  shared/     # confirm dialog
  features/   # auth, trades, admin
  layout/     # shell, 404
```
