#!/bin/sh
set -e

echo "Running prisma migrate deploy..."
cd apps/api
npx prisma migrate deploy
cd /app

echo "Starting Nest app..."
exec node apps/api/dist/src/main.js