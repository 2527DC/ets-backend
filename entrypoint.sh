#!/bin/sh
set -e

echo "🔹 Generating Prisma client..."
npx prisma generate

echo "🔹 Running migrations..."
npx prisma migrate deploy   # or `npx prisma db push` for dev

echo "🔹 Starting the backend..."
npm start
