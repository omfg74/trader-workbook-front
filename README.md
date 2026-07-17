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

Контейнер на порту **4200** отдаёт SPA и проксирует `/auth/` и `/api/` на бэкенд (`BACKEND_URL`, по умолчанию `http://host.docker.internal:8000`).

Сначала поднимите бэкенд (`trader-workbook`), затем:

```bash
docker compose -f compose.yaml up --build --force-recreate
```

Фронт: http://localhost:4200 (с другой машины в LAN — `http://<host-ip>:4200`).

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
