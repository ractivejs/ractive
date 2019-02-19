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
  set +e
  npm run report:coveralls
  set -e
fi

rm -rf .build
mkdir .build

npm run bundle:release

echo "build complete"
