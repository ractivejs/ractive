/*eslint-env node */
/*eslint object-shorthand: 0 quote-props: 0 */
const fs = require('fs');
const path = require('path');

const fsPlus = require('fs-plus');
const gobble = require('gobble');
const sander = gobble.sander;
const buble = require('buble');
const rollupLib = require('rollup');

const time = new Date();
const commitHash = process.env.COMMIT_HASH || 'unknown';
const version = require('./package.json').version;
const banner = `/*
	Ractive.js v${version}
	Build: ${commitHash}
	Date: ${time}
	Website: http://ractivejs.org
	License: MIT
*/`;

const runtimeModulesToIgnore = ['src/parse/_parse.js'];
const placeholders = {
	BUILD_PLACEHOLDER_VERSION: version
};

const src = gobble('src').moveTo('src').transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
const tests = gobble('tests').include(['helpers/**/*', 'browser/**/*', 'node/**/*']).moveTo('tests').transform(transpile, { accept: ['.js'] });
const browserTests = gobble([src, tests.include(['tests/helpers/**/*', 'tests/browser/**/*'])]);
const nodeTests = gobble([src, tests.include(['tests/helpers/**/*', 'tests/node/**/*'])]);
const manifest = gobble('templates/manifests').transform(replacePlaceholders);
const qunit = gobble('templates/qunit').moveTo('tests');
const bin = gobble('bin').moveTo('bin');
const lib = gobble('lib').moveTo('lib');
const typings = gobble('typings').moveTo('typings');
const sandbox = gobble('sandbox');
const polyfills = src.transform(copy, { dir: 'src' }).include(['polyfills.js']);

module.exports = ({
	'dev:browser'() {
		const lib = buildUmdLib('ractive.js', []);
		const tests = buildBrowserTests();
		const polyfills = buildUmdPolyfill();
		return gobble([lib, polyfills, tests, sandbox, qunit]);
	},
	'production'() {
		const libEsFull = buildESLib('ractive.mjs', []);
		const libEsRuntime = buildESLib('runtime.mjs', runtimeModulesToIgnore);

		const libUmdFull = buildUmdLib('ractive.js', []);
		const libUmdRuntime = buildUmdLib('runtime.js', runtimeModulesToIgnore);

		const libEs = gobble([libEsFull, libEsRuntime]);
		const libUmd = gobble([libUmdFull, libUmdRuntime]);
		const libUmdMin = libUmd.transform('uglifyjs', { ext: '.min.js', preamble: banner });

		const polyfillEs = buildESPolyfill();
		const polyfillUmd = buildUmdPolyfill();
		const polyfillUmdMin = polyfillUmd.transform('uglifyjs', { ext: '.min.js' });

		const browserTests = buildBrowserTests();
		const nodeTests = buildNodeTests();

		return gobble([libEs, libUmd, libUmdMin, polyfillEs, polyfillUmd, polyfillUmdMin, qunit, browserTests, nodeTests, bin, lib, typings, manifest]);
	}
})[gobble.env()]();

////////////////////////////////////////////////////////////////////////////////

/* Bundle builders */

// Builds a UMD bundle of Ractive
function buildUmdLib(dest, excludedModules) {
	return src.transform(rollup, {
		plugins: [skipModule(excludedModules)],
		moduleName: 'Ractive',
		format: 'umd',
		entry: 'src/Ractive.js',
		dest: dest,
		banner: banner,
		noConflict: true,
		cache: false
	});
}

// Builds an ES bundle of Ractive
function buildESLib(dest, excludedModules) {
	return src.transform(rollup, {
		plugins: [skipModule(excludedModules)],
		format: 'es',
		entry: 'src/Ractive.js',
		dest: dest,
		banner: banner,
		cache: false
	});
}

// Builds a UMD bundle for browser/PhantomJS tests.
function buildBrowserTests() {
	return gobble([
		browserTests,
		browserTests.transform(buildTestEntryPoint, { dir: 'tests/browser' })
	])
		.transform(copy)
		.transform(rollup, {
			moduleName: 'RactiveBrowserTests',
			format: 'iife',
			entry: 'tests.js',
			dest: 'browser.js',
			globals: {
				qunit: 'QUnit',
				simulant: 'simulant'
			},
			external: ['qunit', 'simulant'],
			cache: false
		}).moveTo('tests');
}

// Builds a CJS bundle for node tests.
function buildNodeTests() {
	return gobble([
		nodeTests,
		nodeTests.transform(buildTestEntryPoint, { dir: 'tests/node' })
	])
		.transform(copy)
		.transform(rollup, {
			format: 'cjs',
			entry: 'tests.js',
			dest: 'node.js',
			external: ['cheerio'],
			cache: false
		}).moveTo('tests');
}

function buildUmdPolyfill() {
	return polyfills.transform(rollup, {
		moduleName: 'RactivePolyfills',
		format: 'umd',
		entry: 'polyfills.js',
		dest: 'polyfills.js',
		cache: false
	});
}

function buildESPolyfill() {
	return polyfills.transform(rollup, {
		format: 'es',
		entry: 'polyfills.js',
		dest: 'polyfills.mjs',
		cache: false
	});
}

/* Rollup plugins */

// Replaces a modules content with a null export to omit module contents.
// TODO: Must return sourcemap
function skipModule(excludedModules) {
	return {
		name: 'skipModule',
		transform: function (src, modulePath) {
			// Gobble has a predictable directory structure of gobble/transform/number
			// so we slice at 3 to slice relative to project root.
			const moduleRelativePath = path.relative(__dirname, modulePath).split(path.sep).slice(3).join(path.sep);
			return excludedModules.indexOf(moduleRelativePath) > -1 ? 'export default null; export const shared = {};' : src;
		}
	};
}

/* Gobble transforms */

// Essentially gobble-buble but takes out the middleman.
function transpile(src, options) {
	return buble.transform(src, {
		target: { ie: 9 },
		transforms: { modules: false }
	});
}

// Builds an entrypoint in the designated directory that imports all test specs
// and calls them one after the other in tree-listing order.
function buildTestEntryPoint(inDir, outDir, options) {
	const _options = Object.assign({ dir: '' }, options);
	const testPaths = fsPlus.listTreeSync(path.join(inDir, _options.dir)).filter(testPath => fsPlus.isFileSync(testPath) && path.extname(testPath) === '.js');
	const testImports = testPaths.map((testPath, index) => `import test${index} from './${path.relative(inDir, testPath).replace(/\\/g, '/')}';`).join('\n');
	const testCalls = testPaths.map((testPath, index) => `test${index}();`).join('\n');
	fs.writeFileSync(path.join(outDir, 'tests.js'), `${testImports}\n${testCalls}`, 'utf8');
	return Promise.resolve();
}

// Looks for placeholders in the code and replaces them.
// TODO: Must return sourcemap
function replacePlaceholders(src, options) {
	return Object.keys(placeholders).reduce((out, placeholder) => {
		return out.replace(new RegExp(`${placeholder}`, 'g'), placeholders[placeholder]);
	}, src);
}

// This is because Gobble's grab and Rollup's resolution is broken
// https://github.com/gobblejs/gobble/issues/89
// https://github.com/rollup/rollup/issues/1291
function copy(inputdir, outputdir, options) {
	const _options = Object.assign({ dir: '.' }, options);
	fsPlus.copySync(path.join(inputdir, _options.dir), outputdir);
	return Promise.resolve();
}

function rollup(indir, outdir, options) {
	if (!options.entry) throw new Error('You must supply `options.entry`');

	options.dest = path.resolve(outdir, options.dest || options.entry);
	options.entry = path.resolve(indir, options.entry);

	return rollupLib.rollup(options).then(function(bundle) {
		return bundle.write(options);
	});
}
