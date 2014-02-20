#!/bin/bash

# deploy script based on https://medium.com/philosophy-logic/53a8270e87db
if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
	echo "Deploying edge version to CDN..."

	git clone https://github.com/RactiveJS/cdn.ractivejs.org.git cdn
	git checkout -b gh-pages origin/gh-pages

	rm -r cdn/edge
	cp -r build/ cdn/edge

	( cd cdn

		git config user.name "Travis-CI"
		git config user.email "richard.a.harris+travis@gmail.com"
		git add .
		git commit -m "Updated edge version"

		git push "https://${GH_TOKEN}@${GH_REF}"
	)
fi
