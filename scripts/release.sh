#!/bin/sh

# if anything fails, abort (errexit)
set -e

# STEP 1 - BUILD LIBRARY
#############################
./scripts/build.sh

# STEP 2 - PUBLISH TO CDN
#############################
echo '> fetching cdn repo...'

VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')

rm -rf cdn
git clone https://github.com/ractivejs/cdn.ractivejs.org cdn

# add new release folder
mkdir cdn/${VERSION}
cp build/* cdn/${VERSION}

# replace latest/ folder
rm -f cdn/latest/*
cp build/* cdn/latest

( cd cdn
	git add -A
	git commit -m '${VERSION} release'
	git push
)

# Clean up
rm -rf cdn

# STEP 3 - PUBLISH TO NPM
#############################
echo '> publishing to npm...'

( cd build
	# ...and to npm
	npm publish
)

# STEP 4 - UPDATE TAGS
#############################
echo '> updating tags...'

rm -rf build-branch
git clone https://github.com/ractivejs/ractive -b build build-branch

rm build-branch/*
cp build/* build-branch

( cd build-branch
	git add -A
	git commit -m '${VERSION} release'
	git push

	# Publish to bower...
	git tag -a v${VERSION} -m 'version ${VERSION}'
	git push origin v${VERSION}
)

rm -rf build-branch

echo '> release complete'