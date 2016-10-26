#!/bin/sh

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
	npm publish
)

# STEP 3 - UPDATE TAGS
#############################
echo '> updating tags...'

rm -rf build-branch
git clone https://github.com/ractivejs/ractive -b build build-branch

rm -r build-branch/*
cp -r build/* build-branch

( cd build-branch
	git add -A
	git commit -m "${VERSION} release"
	git push

	# Publish to bower...
	git tag -a v$VERSION -m "version ${VERSION}"
	git push origin v$VERSION
)

rm -rf build-branch

echo '> release complete'
