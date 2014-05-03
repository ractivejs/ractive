#!/bin/bash

# deploy script based on https://medium.com/philosophy-logic/53a8270e87db
if [ "$TRAVIS_PULL_REQUEST" == "false" -a "$TRAVIS_BRANCH" == "dev" ]; then
	git config --global user.email "richard.a.harris+travis@gmail.com"
	git config --global user.name "Travis-CI"

	echo "Deploying to build branch"
	git clone https://Rich-Harris:${GH_TOKEN}@${GH_REF} -b build build-branch
	cp build/* build-branch

	( cd build-branch
		echo "Setting credentials..."
		git remote rm origin
		git remote add origin https://Rich-Harris:${GH_TOKEN}@${GH_REF}

		cp ../scripts/edge-package.json package.json

		echo "Adding files..."
		git add -A
		git commit -m "Updated edge version"

		echo "Pushing to GitHub..."
		git push --quiet 2> /dev/null

		# delete existing edge tags...
		git tag -d edge
		git push origin :edge
		git tag -d v0.4.1-pre # necessary for npm
		git push origin :v0.4.1-pre

		# ...and create new one
		echo "Updating edge tag"
		git tag -a edge -m 'edge version'
		git tag -a v0.4.1-pre -m 'edge version'
		git push origin edge --quiet 2> /dev/null
		git push origin v0.4.1-pre --quiet 2> /dev/null
	)

	echo "Deploying to CDN..."

	echo "Cloning repo..."
	git clone https://Rich-Harris:${GH_TOKEN}@${CDN_REF} cdn

	echo "Copying latest builds..."
	rm -r cdn/edge
	cp -r build/ cdn/edge

	( cd cdn
		echo "Setting credentials..."
		git remote rm origin
		git remote add origin https://Rich-Harris:${GH_TOKEN}@${CDN_REF}

		echo "Adding files..."
		git add -A
		git commit -m "Updated edge version"

		echo "Pushing to GitHub..."
		git push --quiet origin gh-pages 2> /dev/null
	)
fi
