#!/bin/sh

set -e

rm -rf .build
mkdir .build

# npm run lint:all

npm run bundle:test
npm run test:chrome
npm run test:electron || true # Allow to fail for now
npm run test:coverage

echo "build complete"
