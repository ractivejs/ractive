#!/bin/sh

# run node.js tests
echo "> running node.js-specific tests"
mocha tmp/test/__nodetests/*.js --reporter progress

# TODO run browser tests
# echo "> running browser tests with phantomjs"
# node-qunit-phantomjs tmp/test/index.html --verbose