#!/bin/sh

set -e

export COMMIT_HASH=`git rev-parse HEAD`

rm -rf .build
mkdir .build

npm run lint:src
npm run lint:tests:browser
npm run lint:tests:node

npm run bundle:test
npm run test:phantom
npm run test:electron
npm run test:saucelabs || true # Allow to fail for now
npm run test:coverage

npm run report:coveralls

rm -rf .build
mkdir .build

npm run bundle:release

echo "build complete"
