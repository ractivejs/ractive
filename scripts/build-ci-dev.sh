#!/bin/sh

set -e

export COMMIT_HASH=`git rev-parse HEAD`

rm -rf .build
mkdir .build

npm run lint:all

npm run bundle:test
npm run test:chrome
npm run test:electron
npm run test:coverage

if [ "$FORCE_LOCAL_BUILD" = "" ]; then
  npm run report:coveralls
fi

rm -rf .build
mkdir .build

npm run bundle:release

echo "build complete"
