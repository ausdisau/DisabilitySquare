#!/bin/bash
set -e
npm install
if [ "${DB_PUSH_FORCE:-}" = "1" ]; then
  npm run db:push -- --force
else
  npm run db:push
fi
