#!/bin/sh
set -e

cd /var/www/html

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
  php artisan key:generate --force
fi

echo "Waiting for database..."
until php artisan db:show >/dev/null 2>&1; do
  sleep 2
done

php artisan migrate --force
php artisan storage:link --force 2>/dev/null || true

if [ "$AUTO_SEED" = "true" ]; then
  if php artisan tinker --execute="exit(App\\Models\\User::count() === 0 ? 0 : 1);" 2>/dev/null; then
    php artisan db:seed --force
  else
    echo "Seed skipped — users already exist."
  fi
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
