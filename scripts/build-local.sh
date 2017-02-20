#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run lint:src
npm run lint:tests:browser
npm run lint:tests:node
npm run bundle
npm run test:electron || true
npm run test:phantom

echo "build complete"
