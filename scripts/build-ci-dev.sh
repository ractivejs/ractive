#!/bin/sh

set -e

export COMMIT_HASH=`git rev-parse HEAD`

rm -rf .build
mkdir .build

npm run lint:all

case "$I_PROMISE_I_TESTED_THIS" in
  "skip tests")
    echo "Skipping tests because you promised you ran them already..."
    ;;

  *)
    npm run bundle:test
    npm run test:chrome
    npm run test:electron
    npm run test:coverage

    if [ "$FORCE_LOCAL_BUILD" = "" ]; then
      npm run report:coveralls
    fi
    ;;
esac

rm -rf .build
mkdir .build

npm run bundle:release

echo "build complete"
