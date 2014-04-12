#!/bin/bash

# deploy script based on https://medium.com/philosophy-logic/53a8270e87db
if [ "$TRAVIS_PULL_REQUEST" == "false" -a "$TRAVIS_BRANCH" == "dev" ]; then
	echo "Deploying edge version to CDN..."

	git clone https://Rich-Harris:${GH_TOKEN}@${GH_REF} gh-pages
	git checkout -b gh-pages origin/gh-pages

	rm -r gh-pages/edge
	cp -r build/ gh-pages/edge

	( cd gh-pages

		git remote rm origin
		git remote add origin https://Rich-Harris:${GH_TOKEN}@${GH_REF}

		git add -A
		git commit -m "Updated edge version"

		git push
	)
fi
