#!/bin/bash

# deploy script based on https://medium.com/philosophy-logic/53a8270e87db
if [ "$TRAVIS_PULL_REQUEST" == "false" -a "$TRAVIS_BRANCH" == "dev" ]; then
	echo "Deploying edge version to CDN..."

	echo "Cloning repo..."
	git clone https://Rich-Harris:${GH_TOKEN}@${GH_REF} cdn

	echo "Copying latest builds..."
	rm -r cdn/edge
	cp -r build/ cdn/edge

	( cd cdn

		echo "Setting credentials..."
		git remote rm origin
		git remote add origin https://Rich-Harris:${GH_TOKEN}@${GH_REF}

		git config --global user.email "richard.a.harris+travis@gmail.com"
		git config --global user.name "Travis-CI"

		echo "Adding files..."
		git add -A
		git commit -m "Updated edge version"

		echo "Pushing to GitHub..."
		git push --quiet origin gh-pages 2> /dev/null
	)
fi
