#!/bin/sh

# if the tests fail, abort (errexit)
set -e

MOD='node_modules/.bin'

# run node.js tests
echo "> running node.js-specific tests. working directory is $PWD"
$MOD/mocha ./tmp/test/__nodetests/index.js --reporter progress

# check ractive.runtime doesn't error (#1860)
node tmp/ractive.runtime.js

# run browser tests
$MOD/phantomjs scripts/phantom-runner.js
