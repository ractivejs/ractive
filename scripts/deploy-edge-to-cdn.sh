#!/bin/bash

# deploy script based on https://medium.com/philosophy-logic/53a8270e87db
if [ "$TRAVIS_PULL_REQUEST" == "false" -a "$TRAVIS_BRANCH" == "dev" ]; then
	echo "Deploying edge version to CDN..."

	git clone https://github.com/ractivejs/cdn.ractivejs.org.git cdn
	git checkout -b gh-pages origin/gh-pages

	rm -r cdn/edge
	cp -r build/ cdn/edge

	( cd cdn

		git config user.name "Travis-CI"
		git config user.email "richard.a.harris+travis@gmail.com"
		git config credential.helper "store --file=.git/credentials"
		echo "https://${GH_TOKEN}:@github.com" > .git/credentials

		git add -A
		git commit -m "Updated edge version"

		git push
	)
fi
