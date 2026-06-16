# Purrfect Match

Cat adoption marketplace — Laravel 13 API + Filament admin + Next.js 16 frontend.

## Stack

| Layer | Tech |
|-------|------|
| API | Laravel 13, Sanctum, PostgreSQL, Redis, Reverb |
| Admin | Filament 5 at `/admin` |
| Frontend | Next.js 16, React 19, Tailwind 4, TanStack Query |

## Quick start

```bash
# Database + Redis (Docker)
docker compose up -d

# Backend
cd backend
cp .env.example .env   # if needed
composer install
php artisan reverb:install   # first time only
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Run in separate terminals:
php artisan serve              # API :8000
php artisan reverb:start         # WebSockets :8080
php artisan queue:work redis     # emails + queued notifications

# Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev

# E2E tests (API + frontend must be running)
cd frontend && npm run test:e2e
```

- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Admin: http://localhost:8000/admin

## Default accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@purrfectmatch.test | password |
| Owner | priya@purrfectmatch.test | password |
| Adopter (sample messages) | alex@purrfectmatch.test | password |

Seeding downloads cat and avatar images into `storage/app/public/seed/` (~22 files). Re-run with:

```bash
php artisan migrate:fresh --seed
```

## Project structure

```
cats/
├── backend/     Laravel API + Filament
├── frontend/    Next.js app
├── docs/        API reference + deployment guide
├── .cursor/rules/
└── docker-compose.yml
```

## Features

- Browse, filter, and search cat listings with photo galleries
- Sanctum SPA auth, profile settings, password reset
- List / edit listings, manage adoption applications
- Save favorites, messaging, notifications
- Reviews, reports, public owner profiles
- Filament admin with moderation (reports) and stats dashboard

See [docs/openapi.md](docs/openapi.md) for the API reference and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.
