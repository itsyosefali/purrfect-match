# Purrfect Match — Agent Guide

Monorepo for a cat adoption marketplace.

## Commands

```bash
# Start database
docker compose up -d

# Backend (from backend/)
php artisan serve          # http://localhost:8000
php artisan migrate --seed
php artisan test

# Frontend (from frontend/)
npm run dev                # http://localhost:3000
npm run build
```

## Architecture

- **backend/** — Laravel 13 REST API + Filament 5 admin panel
- **frontend/** — Next.js 16 App Router SPA
- Auth: Laravel Sanctum cookie-based SPA (not Bearer tokens)
- API prefix: `/api`

## When editing

1. Run commands from the correct subdirectory (`backend/` or `frontend/`)
2. API contract changes require updates in both `backend/routes/api.php` and `frontend/src/lib/api/`
3. Admin features go in Filament only — not in Next.js
4. Match mockup design: cream `#FDF8F3`, dark text `#1C1410`

## Key paths

| Area | Path |
|------|------|
| API routes | `backend/routes/api.php` |
| Models | `backend/app/Models/` |
| Filament | `backend/app/Filament/Resources/` |
| Frontend pages | `frontend/src/app/` |
| API client | `frontend/src/lib/api/` |
| Types | `frontend/src/types/` |
