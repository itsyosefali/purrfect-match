# Production Deployment

## Stack

- **Frontend**: Next.js on Vercel, Netlify, or Node (`npm run build && npm start`)
- **Backend**: Laravel on any PHP 8.3+ host (Forge, Railway, Dokploy, etc.)
- **Database**: PostgreSQL 16+
- **Storage**: S3 or compatible for cat photos (configure `FILESYSTEM_DISK=s3`)
- **Cache/Queue**: Redis recommended for sessions, queues, and broadcasting

## Backend environment

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
AWS_BUCKET=...

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_FROM_ADDRESS=noreply@yourdomain.com

QUEUE_CONNECTION=redis
CACHE_STORE=redis
BROADCAST_CONNECTION=reverb
```

## Required processes

```bash
php artisan migrate --force
php artisan storage:link   # if using local disk in staging
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Run a queue worker:

```bash
php artisan queue:work --sleep=3 --tries=3
```

For real-time messaging, run Laravel Reverb:

```bash
php artisan reverb:start
```

## Frontend environment

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Nginx (API + admin)

Proxy PHP to `php-fpm`, serve `public/` as web root. Ensure `/api/*` and `/admin/*` hit Laravel. Static files from `storage/` should be served via S3 URLs in production.

## Rate limiting

Auth and messaging endpoints use Laravel `throttle` middleware. Adjust in `routes/api.php` if needed.

## Health check

`GET /up` — Laravel health endpoint for load balancers.
