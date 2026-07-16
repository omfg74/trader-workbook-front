# Дневник трейдера — Angular frontend

SPA для работы с API `trader-workbook`.

## Стек

- Angular 19 (standalone)
- Angular Material
- RxJS
- SCSS
- Docker + nginx

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

Бэкенд должен быть доступен на хосте на порту `8000`.

```bash
docker compose up --build
```

Фронт: http://localhost:4200  
nginx проксирует `/api/` и `/auth/` на `host.docker.internal:8000`.

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
