#!/bin/sh

FAKE=0
if [[ $1 != "--fake" ]]; then
	FAKE=1
fi

# if the tests fail (and we're not trying to work with bloody Windows), abort (errexit)
set -e

MOD='node_modules/.bin'

echo "> linting..."
$MOD/jshint src

# build library plus tests
echo "> emptying tmp dir..."
rm -rf tmp/*

echo "> building Ractive..."
export COMMIT_HASH=`git rev-parse HEAD`

# temporarily allow command failure
set +e
$MOD/gobble build tmp
OK=$?
if [ $FAKE -ne 0 -a $OK -ne 0 ]; then
	exit 1
elif [ $OK -ne 0 ]; then
	# we're faking, so roll on
	exit 0
fi
set -e

# run the tests
echo "> running tests..."
./scripts/test.sh

# if the tests passed, copy to the build folder...
echo "> tests passed. minifying..."

compress () {
	local src=$1
	local dest=${src%.js}.min.js

	$MOD/uglifyjs \
		--compress \
		--mangle \
		--source-map $dest.map \
		--source-map-root $dest \
		--output $dest \
		-- $src \
		> /dev/null 2>&1

	echo "  minified $src"

	$MOD/sorcery -i $dest
	echo "  fixed $dest sourcemap"

}

( cd tmp
	for i in *.js; do compress "$i" & done
	wait
)
echo "> emptying build folder..."
rm -rf build

# make sure there is a build folder
if [[ ! -d build ]]; then
	mkdir build
fi

echo "> copying to build folder..."
mkdir -p build
cp tmp/*.js build
cp tmp/*.map build

echo "> ...aaaand we're done"

if [[ $FAKE -eq 1 ]]; then
	exit 0
fi
