#!/bin/sh
VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')
VERSION_NUM=$(echo $VERSION | sed 's/[^0-9\./\]//g')
TAG="v$(cat package.json | grep "version" | sed 's/"version": "\([0-9]*\.[0-9]\).*",/\1/' | sed 's/[[:space:]]//g')-dev"

# find the last published build number for this series
LAST=$(npm show ractive versions --json | grep "${VERSION_NUM}-build-" | sed -re 's/.*-([0-9]+).*/\1/g' | sort -n | tail -n 1 | grep -v '^$')
if [ $? -ne 0 ]; then
	LAST=0
fi
LAST=$((LAST + 1))

TARGET="${VERSION_NUM}-build-${LAST}"

REV=$(git rev-parse --abbrev-ref HEAD)
if [ "$REV" = "dev" ]; then
	EDGE_TAG="edge"
fi

echo
printf "publishing $TARGET as tag $TAG, so if you want to cancel, you have 3 seconds"
sleep 1; printf .; sleep 1; printf .; sleep 1; printf .
echo

# if anything fails, abort (errexit)
set -e

# STEP 1 - PUBLISH TO NPM
#############################
echo '> publishing to npm...'

( cd .release
	# set the correct package version
	node -e "var package = JSON.parse(fs.readFileSync('./package.json')); package.version = '${TARGET}'; fs.writeFileSync('./package.json', JSON.stringify(package, null, '  '));"
	# ...and to npm
	npm publish --tag $TAG

	if [ ! -z $EDGE_TAG ]; then
		echo "also publishing as $EDGE_TAG"
		npm dist-tag add ractive@$TARGET $EDGE_TAG
	fi
)

echo 'release complete'
