#!/bin/sh

# if the tests fail, abort (errexit)
set -e

# run node.js tests
echo "> running node.js-specific tests"
mocha tmp/test/__nodetests/*.js --reporter progress

# run browser tests
phantomjs scripts/phantom-runner.js