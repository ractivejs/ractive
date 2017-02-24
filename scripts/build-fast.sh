#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run bundle
npm run test:phantom

echo "fast build complete"

