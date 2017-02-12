#!/bin/sh

# if the tests fail, abort (errexit)
set -e

MOD='node_modules/.bin'

# run node.js tests
echo "> running node.js-specific tests. working directory is $PWD"
qunit-cli --quiet --code Ractive:./tmp/ractive.js ./tmp/test/node-tests/index.js

# check ractive.runtime doesn't error (#1860)
node tmp/runtime.js

# run browser tests
$MOD/phantomjs scripts/phantom-runner.js
