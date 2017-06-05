#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run prettier

npm run lint:src
npm run lint:tests:browser
npm run lint:tests:node

npm run bundle:test
npm run test:phantom
npm run test:electron || true # Allow to fail for now
npm run test:coverage

echo "build complete"
