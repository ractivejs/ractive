#!/bin/sh

# if the tests fail, abort (errexit)
set -e

MOD='node_modules/.bin'

# run node.js tests
echo "> running node.js-specific tests"
$MOD/mocha tmp/test/__nodetests/index.js --reporter progress

# run browser tests
$MOD/phantomjs scripts/phantom-runner.js
