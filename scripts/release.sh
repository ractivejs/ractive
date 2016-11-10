#!/bin/sh

# if anything fails, abort (errexit)
set -e
VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')
TAG="v$(cat package.json | grep "version" | sed 's/"version": "\([0-9]*\.[0-9]\).*",/\1/' | sed 's/[[:space:]]//g')-dev"
REV=$(git rev-parse --abbrev-ref HEAD)
if [ "$REV" = "dev" ]; then
	EDGE_TAG="edge"
fi

# STEP 1 - BUILD LIBRARY
#############################
./scripts/build.sh

# STEP 2 - PUBLISH TO NPM
#############################
echo '> publishing to npm...'

( cd build
	# ...and to npm
	npm publish
	npm dist-tag add ractive@target $TAG

	if [ ! -z $EDGE_TAG ]; then
		echo "also publishing as $EDGE_TAG"
		npm dist-tag add ractive@$TARGET $EDGE_TAG
	fi
)

# STEP 3 - UPDATE TAGS
#############################
echo '> updating tags...'

rm -rf build-branch
git clone https://github.com/ractivejs/ractive -b build --depth 2 build-branch

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
