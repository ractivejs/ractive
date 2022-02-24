#!/usr/bin/env bash

export TRAVIS_PULL_REQUEST=false
export FORCE_LOCAL_BUILD=true
if [ "${FORCE_BRANCH}" != "" ]; then
  export TRAVIS_BRANCH=$FORCE_BRANCH
else
  export TRAVIS_BRANCH=`git branch 2>/dev/null | sed -e '/^[^\*]/d' -e 's/* \(.*\)/\1/'`
fi
export GH_REF="git@github.com:ractivejs/ractive"

set -e

echo "This will build your local branch ($TRAVIS_BRANCH) and attempt to publish it. If you want to bail now, you have 5 seconds..."
sleep 1
echo "4..."
sleep 1
echo "3..."
sleep 1
echo "2..."
sleep 1
echo "1..."
sleep 1
echo "Hold on to your butts...  "

sh scripts/build-ci-dev.sh

sh scripts/release-ci.sh
