#!/bin/bash


#  STEP 1 - BUILD
###############################

grunt release


#  STEP 2 - UPDATE BUILD BRANCH
###############################

# Fetch remote build branch
echo 'fetching remote build branch...'

rm -rf build-branch
git clone https://github.com/ractivejs/ractive -b build build-branch

# Copy built files, plus package.json and bower.json
rm build-branch/*
cp build/* build-branch

rm build-branch/package.json
cp tmp-rel/package.json build-branch/package.json

rm build-branch/bower.json
cp tmp-rel/bower.json build-branch/bower.json

rm build-branch/component.json
cp tmp-rel/component.json build-branch/component.json

# Update remote build branch
( cd build-branch
	git add -A
	git commit -m '0.5.6 release'
	git push

	# Publish to bower...
	git tag -a v0.5.6 -m 'version 0.5.6'
	git push origin v0.5.6


#  STEP 3 - PUBLISH TO NPM
###############################

	# ...and to npm
	npm publish
)

# Destroy the evidence
rm -rf build-branch


#  STEP 4 - UPDATE CDN
###############################

echo 'fetching cdn repo...'

rm -rf cdn
git clone https://github.com/ractivejs/cdn.ractivejs.org cdn

# add new release folder (to root AND releases/)
mkdir cdn/0.5.6
cp build/*.js cdn/0.5.6

mkdir cdn/releases/0.5.6
cp build/*.js cdn/releases/0.5.6

# replace latest/ folder
rm -f cdn/latest/*
cp build/*.js cdn/latest

( cd cdn
	git add -A
	git commit -m '0.5.6 release'
	git push
)

# Clean up
rm -rf cdn


#  STEP 5 - UPDATE ROOT FOLDER
###############################

# Update component.json and ractive.js in root folder
rm ractive.js
rm component.json

cp tmp-rel/component.json component.json
cp build/ractive.js ractive.js

git checkout master
git add -A
git commit -m '0.5.6 release'
git push


#  STEP 6 - CLEAN UP
###############################
rm -r tmp-rel
