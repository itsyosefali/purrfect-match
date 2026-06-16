# Deploy Purrfect Match on Dokploy

This guide deploys the full Docker stack from `docker-compose.prod.yml`.

## 1. Push to GitHub

```bash
git remote add origin git@github.com:YOUR_USER/purrfect-match.git
git push -u origin main
```

## 2. Create Dokploy project

1. Open your Dokploy dashboard
2. **Create Project** → e.g. `purrfect-match`
3. **Add Service** → **Compose**
4. Connect your GitHub repository
5. Set **Compose file** to: `docker-compose.prod.yml`
6. Branch: `main`

## 3. Environment variables

In Dokploy → your compose service → **Environment**, paste variables from `.env.production.example`.

**Required:**

| Variable | Example |
|----------|---------|
| `APP_KEY` | Run `php artisan key:generate --show` locally |
| `APP_URL` | `https://api.yourdomain.com` |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `yourdomain.com,www.yourdomain.com` |
| `POSTGRES_PASSWORD` | Strong password |
| `REVERB_APP_KEY` | Random string |
| `REVERB_APP_SECRET` | Random string |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_REVERB_HOST` | `ws.yourdomain.com` or your domain |
| `NEXT_PUBLIC_REVERB_SCHEME` | `https` |
| `NEXT_PUBLIC_REVERB_PORT` | `443` |
| `AUTO_SEED` | `true` (first deploy only) |

Generate Reverb credentials locally:

```bash
cd backend && php artisan reverb:install
```

## 4. Domains (Traefik)

Map domains in Dokploy to container ports:

| Service | Port | Domain |
|---------|------|--------|
| `frontend` | 3000 | `yourdomain.com` |
| `backend` | 8000 | `api.yourdomain.com` |
| `reverb` | 8080 | `ws.yourdomain.com` |

Enable HTTPS for all three.

Update env after domains are set:

```env
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_REVERB_HOST=ws.yourdomain.com
NEXT_PUBLIC_REVERB_SCHEME=https
NEXT_PUBLIC_REVERB_PORT=443
```

## 5. Deploy

Click **Deploy** in Dokploy. On first run:

- Migrations run automatically
- If `AUTO_SEED=true`, demo users are created (password: `password`)
- Set `AUTO_SEED=false` after first successful deploy

## 6. Post-deploy checks

- `GET https://api.yourdomain.com/up` → 200
- Login at `https://yourdomain.com/login`
- Filament admin: `https://api.yourdomain.com/admin` (`admin@purrfectmatch.test`)

## Local Docker test (full stack)

```bash
cp .env.production.example .env.production
# Edit APP_KEY (php artisan key:generate --show)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Dev infra only (Postgres + Redis):

```bash
docker compose up -d
```

## Services

| Container | Role |
|-----------|------|
| `postgres` | Database |
| `redis` | Cache, sessions, queues |
| `backend` | Laravel API + admin |
| `queue` | Email & notification jobs |
| `reverb` | WebSocket real-time chat |
| `frontend` | Next.js app |

## Troubleshooting

- **Login fails after deploy** → set `AUTO_SEED=true` and redeploy, or run migrations/seed manually
- **CORS errors** → verify `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`
- **WebSocket fails** → check Reverb domain, `NEXT_PUBLIC_REVERB_*` vars, and HTTPS on ws subdomain
- **500 on API** → check `backend` logs in Dokploy, ensure `APP_KEY` is set
