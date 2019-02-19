#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run lint:all

npm run bundle:test
npm run test:chrome
npm run test:electron
npm run test:coverage

set +e
npm run report:coveralls

echo "build complete"
