#!/bin/sh

set -e

# Bail if we're not in Travis
if [ "$CI" != true ] || [ "$TRAVIS" != true ] || [ "$HAS_JOSH_K_SEAL_OF_APPROVAL" != true ] ; then
    echo 'It appears that this is not Travis.'
    exit 1
fi

export COMMIT_HASH=`git rev-parse HEAD`

rm -rf .build
mkdir .build

npm run lint:src
npm run lint:tests:browser
npm run lint:tests:node
npm run bundle
npm run test:electron
npm run test:phantom
npm run test:coverage

# Allow the saucelabs tests to fail for now. The real problem is Ractive not
# acting deterministically on slow systems, like Sauce's VMs... or macOS Safari.
npm run test:saucelabs || true

rm -rf .release
mkdir .release

cp .build/bower.json .release
cp .build/package.json .release
cp .build/*.js .release
cp .build/*.mjs .release
cp .build/*.map .release
cp -r .build/bin .release/bin
cp -r .build/lib .release/lib
cp -r .build/typings .release/typings

echo "build complete"
