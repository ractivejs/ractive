#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run lint:all

npm run bundle:test
npm run test:phantom
npm run test:electron
#npm run test:saucelabs || true # Allow to fail for now
npm run test:coverage

npm run report:coveralls

echo "build complete"
