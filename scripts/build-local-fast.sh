#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run bundle:test
npm run test:chrome

echo "build complete"

