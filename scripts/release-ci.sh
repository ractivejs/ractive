#!/usr/bin/env bash

if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
	echo "$TRAVIS_BRANCH" | grep "^[0-9]\{1,3\}\.[0-9]\{1,3\}$" > /dev/null
	MAJOR=$?
	VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')
	VERSION_NUM=$(echo $VERSION | sed 's/[^0-9\./\]//g')
	echo "$VERSION" | grep "^[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}$" > /dev/null
	if [ "$?" = "1" ]; then EDGE=0; else EDGE=1; fi
	TAG="v$(cat package.json | grep "version" | sed 's/"version": "\([0-9][0-9]*\.[0-9][0-9]*\).*",/\1/' | sed 's/[[:space:]]//g')-dev"

	if [ "$EDGE" = "0" ]; then
		# find the last published build number for this series
		LAST=$(npm show ractive versions --json | grep "${VERSION_NUM}-build-" | sed -re 's/.*-([0-9]+).*/\1/g' | sort -n | tail -n 1 | grep -v '^$')
		if [ $? -ne 0 ]; then
			LAST=0
		fi
		LAST=$((LAST + 1))

		TARGET="${VERSION_NUM}-build-${LAST}"
	else
		TARGET=$VERSION_NUM
		npm show ractive versions --json | grep "\"$VERSION_NUM\"" > /dev/null
		if [ "$?" = "1" ]; then PUBLISHED=0; else PUBLISHED=1; fi
	fi

	echo major:$MAJOR version:$VERSION_NUM tag:$TAG edge:$EDGE last:$LAST target:$TARGET published:$PUBLISHED
	echo

	# fail with the first error
	set -e

	# is this a major branch, not an edge build, and not published?
	if [ "$MAJOR" = "0" -a "$EDGE" = "1" -a "$PUBLISHED" = "0" ]; then
		echo 'updating tags...'

		git config --global user.email "evschris+travis@gmail.com"
		git config --global user.name "Travis-CI"
		rm -rf release-branch
		git clone https://evs-chris:${GH_TOKEN}@${GH_REF} -b release --depth 2 release-branch

		rm -r release-branch/*
		cp -r .build/* release-branch

		( cd release-branch
			echo "Adding files..."
			git add -A
			git commit -m "${VERSION} release"

			echo "Pushing to github..."
			git push --quiet 2> /dev/null

			# Publish to bower...
			git tag -a v$VERSION -m "version ${VERSION}"
			git push origin v$VERSION --quiet 2> /dev/null
		)

		rm -rf release-branch

		echo 'publishing as stable to npm...'

		( cd .build
			npm publish
			npm dist-tag add ractive@$TARGET $TAG
		)

		echo 'stable release complete'
	fi

	# is this a major edge build?
	if [ "$MAJOR" = "0" -a "$EDGE" = "0" ]; then
		echo 'publishing as major edge build to npm...'

		( cd .build
			# set the correct package version
			node -e "var package = JSON.parse(fs.readFileSync('./package.json')); package.version = '${TARGET}'; fs.writeFileSync('./package.json', JSON.stringify(package, null, '  '));"
			# ...and to npm
			npm publish --tag $TAG

			# purge cache
			set +e

			curl http://purge.jsdelivr.net/npm/ractive@$TAG
		)

		echo 'release complete'
	fi

	# is this the dev branch?
	if [ "$TRAVIS_BRANCH" = "dev" ]; then
		echo 'publishing as unstable edge build to npm...'

		( cd .build
			# set the correct package version
			node -e "var package = JSON.parse(fs.readFileSync('./package.json')); package.version = '${TARGET}'; fs.writeFileSync('./package.json', JSON.stringify(package, null, '  '));"
			# ...and to npm
			npm publish --tag $TAG
			npm dist-tag add ractive@$TARGET edge

			# purge cache
			set +e

			curl http://purge.jsdelivr.net/npm/ractive@$TAG
			curl http://purge.jsdelivr.net/npm/ractive@edge
		)

		echo 'release complete'
	fi
fi

