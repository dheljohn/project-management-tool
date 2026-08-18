#!/bin/sh
set -e
echo "Starting NestJS app..."
exec node apps/api/dist/src/main.js