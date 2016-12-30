#!/bin/sh

set -e

export MOD='node_modules/.bin'
export COMMIT_HASH=`git rev-parse HEAD`
export VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')

echo "> linting..."
eslint src
eslint tests/browser
eslint tests/node

echo "> bundling..."
rm -rf build/*
gobble build build

echo "> testing..."

# TODO: Replace with tap-producing runners
# TODO: Replace with a harness that runs both in node and browser (like tape sans browserify)
qunit-cli --quiet --code Ractive:./build/ractive.js ./build/tests/node/tests.js
phantomjs scripts/phantom-runner.js

echo "> preparing..."

# Removing files not needed for publishing
rm -rfv build/perf
rm -rfv build/tests

# Copying over manifest files
for FILE in manifests/*.json; do
	cat $FILE | sed "s/VERSION_PLACEHOLDER/$VERSION/" > build/${FILE#manifests/}
done

## Copying over readme
cp README.md build

echo "> BUILD COMPLETED!!!"