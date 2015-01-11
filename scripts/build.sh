#!/bin/sh

# if the tests fail, abort (errexit)
set -e

echo "> linting..."
jshint src

# build library plus tests
echo "> emptying tmp dir..."
rm -rf tmp/*

echo "> building Ractive..."
gobble build tmp

# run the tests
echo "> running tests..."
npm run test

# if the tests passed, copy to the build folder...
echo "> tests passed. minifying..."

compress () {
	local src=$1
	local dest=${src%.js}.min.js

	# todo reinstate sourcemaps
	# --source-map $dest.map \
	# --source-map-root $dest \

	uglifyjs \
		--compress \
		--mangle \
		--output $dest \
		-- $src \
		> /dev/null 2>&1

	echo "  minified $src"

	# sorcery -i $dest
	# echo "  fixed $dest sourcemap"

}

( cd tmp
	for i in *.js; do compress "$i" & done
	wait
)

echo "> emptying build folder..."
rm -rf build/*

echo "> copying to build folder..."
( cd tmp
	cp *.js ../build
)

echo "> ...aaaand we're done"