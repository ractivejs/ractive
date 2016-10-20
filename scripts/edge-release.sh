#!/bin/sh
VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')

# make sure there is a build suffix on the version
echo $VERSION | grep -- "-build-"
if [ $? -ne 0 ]; then
	echo "uh oh, you it looks like you haven't updated the package.json version number"
	exit 2
fi

# if anything fails, abort (errexit)
set -e

# STEP 1 - BUILD LIBRARY
#############################
./scripts/build.sh

# STEP 2 - PUBLISH TO NPM
#############################
echo '> publishing to npm...'

( cd build
	# ...and to npm
	npm publish --tag edge
)

echo '> release complete'
