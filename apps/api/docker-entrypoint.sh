#!/bin/sh
set -e

echo "Running prisma migrate deploy..."
cd /app/apps/api
npx prisma migrate deploy

echo "Starting Nest app..."
cd /app
exec node apps/api/dist/src/main.js
