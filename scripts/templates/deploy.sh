#!/bin/bash

grunt build

# Fetch remote build branch
echo 'fetching remote build branch...'

rm -rf build-branch
git clone https://github.com/ractivejs/ractive -b build build-branch

# Copy built files, plus package.json and bower.json
rm build-branch/*
cp build/* build-branch

rm build-branch/package.json
cp tmp/package.json build-branch/package.json

rm build-branch/bower.json
cp tmp/bower.json build-branch/bower.json

# Update remote build branch
( cd build-branch
	git add -A
	git commit -m '${VERSION} release'
	git push

	# Publish to bower...
	git tag -a v${VERSION} -m 'version ${VERSION}'
	git push origin v${VERSION}

	# ...and to npm
	npm publish
)
