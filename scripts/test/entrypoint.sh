#!/bin/bash
echo "Running in NODE_ENV=$NODE_ENV COMMAND=$COMMAND"

echo "Running npm install ..."
npm install --prefer-offline --no-audit

echo "running prisma db push"
node_modules/.bin/prisma db push

echo "Running migrations"
npx prisma migrate deploy

echo "Running seeds"
npm run seed && npm run seed-shop

echo "Running npm run $COMMAND ..."
npm run $COMMAND