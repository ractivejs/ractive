#!/bin/sh

set -e

rm -rf .build
mkdir .build

npm run lint:src
npm run lint:tests:browser
npm run lint:tests:node

npm run bundle:test
npm run test:phantom
npm run test:electron
npm run test:coverage

npm run report:coveralls

echo "build complete"
