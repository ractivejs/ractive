/*eslint-env node */
/*eslint object-shorthand: 0 quote-props: 0 */
const fs = require('fs');
const path = require('path');

const fsPlus = require('fs-plus');
const gobble = require('gobble');
const buble = require('buble');
const rollupLib = require('rollup');
const MagicString = require('magic-string');

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

const runtimeModulesToIgnore = ['parse/_parse.js'].map(p => p.split('/').join(path.sep));
const placeholders = { BUILD_PLACEHOLDER_VERSION: version };

const src = gobble('src').transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
const polyfills = src.include(['polyfills.js']);

const tests = gobble('tests').transform(transpile, { accept: ['.js'] });
const browserTests = tests.include(['helpers/**/*', 'browser/**/*']);
const nodeTests = tests.include(['helpers/**/*', 'node/**/*']);

const benchmarks = gobble('benchmarks').transform(transpile, { accept: ['.js'] }).moveTo('benchmarks');

const qunit = gobble('qunit').moveTo('qunit');
const typings = gobble('typings').moveTo('typings');
const bin = gobble('bin').moveTo('bin');
const lib = gobble('lib').moveTo('lib');

const manifest = gobble('manifests').transform(replacePlaceholders);
const sandbox = gobble('sandbox');


module.exports = ({
	'dev:browser'() {
		const lib = buildUmdLib('ractive.js', []);
		const tests = buildBrowserTests();
		const polyfills = buildUmdPolyfill();
		return gobble([lib, polyfills, tests, sandbox, qunit]);
	},
	'bundle:test'() {
		const lib = buildUmdLib('ractive.js', []);
		const browserTests = buildBrowserTests();
		const nodeTests = buildNodeTests();
		const polyfills = buildUmdPolyfill();
		return gobble([lib, polyfills, qunit, browserTests, nodeTests]);
	},
	'bundle:benchmark'(){
		const lib = buildUmdLib('ractive.js', []);
		return gobble([lib, polyfills, benchmarks]);
	},
	'bundle:release'() {
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

		return gobble([libEs, libUmd, libUmdMin, polyfillEs, polyfillUmd, polyfillUmdMin, bin, lib, typings, manifest]);
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
		entry: 'Ractive.js',
		dest: dest,
		banner: banner,
		noConflict: true,
		cache: false,
		sourceMap: true
	});
}

// Builds an ES bundle of Ractive
function buildESLib(dest, excludedModules) {
	return src.transform(rollup, {
		plugins: [skipModule(excludedModules)],
		format: 'es',
		entry: 'Ractive.js',
		dest: dest,
		banner: banner,
		cache: false,
		sourceMap: true
	});
}

// Builds a UMD bundle for browser/PhantomJS tests.
function buildBrowserTests() {
	return gobble([
		browserTests,
		browserTests.transform(buildTestEntryPoint, { dir: 'browser' })
	])
		.transform('hardlink')
		.transform(rollup, {
			moduleName: 'RactiveBrowserTests',
			format: 'iife',
			entry: 'index.js',
			dest: 'tests-browser.js',
			globals: {
				qunit: 'QUnit',
				simulant: 'simulant'
			},
			external: ['qunit', 'simulant'],
			cache: false,
			sourceMap: true
		});
}

// Builds a CJS bundle for node tests.
function buildNodeTests() {
	return gobble([
		nodeTests,
		nodeTests.transform(buildTestEntryPoint, { dir: 'node' })
	])
		.transform('hardlink')
		.transform(rollup, {
			format: 'cjs',
			entry: 'index.js',
			dest: 'tests-node.js',
			external: ['cheerio'],
			cache: false,
			sourceMap: true
		});
}

function buildUmdPolyfill() {
	return polyfills.transform(rollup, {
		moduleName: 'RactivePolyfills',
		format: 'umd',
		entry: 'polyfills.js',
		dest: 'polyfills.js',
		cache: false,
		sourceMap: true
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
function skipModule(excludedModules) {
	return {
		name: 'skipModule',
		transform: function (src, modulePath) {
			// Gobble has a predictable directory structure of gobble/transform/number
			// so we slice at 3 to slice relative to project root.
			const moduleRelativePath = path.relative(__dirname, modulePath).split(path.sep).slice(3).join(path.sep);
			const isModuleExcluded = excludedModules.indexOf(moduleRelativePath) > -1;

			const source = new MagicString(src);
			const sourceLength = src.length;

			const transformCode = isModuleExcluded ? source.overwrite(0, sourceLength, 'export default null;'): source;
			const transformMap = transformCode.generateMap({ hires: true });

			return { code: transformCode.toString(), map: transformMap.toString() };
		}
	};
}

/* Gobble transforms */

// Essentially gobble-buble but takes out the middleman.
// eslint-disable-next-line no-unused-vars
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
	fs.writeFileSync(path.join(outDir, 'index.js'), `${testImports}\n${testCalls}`, 'utf8');
	return Promise.resolve();
}

// Looks for placeholders in the code and replaces them.
// eslint-disable-next-line no-unused-vars
function replacePlaceholders(src, options) {
	return Object.keys(placeholders).reduce((out, placeholder) => {
		return out.replace(new RegExp(`${placeholder}`, 'g'), placeholders[placeholder]);
	}, src);
}

function rollup(indir, outdir, options) {
	if (!options.entry) throw new Error('You must supply `options.entry`');

	options.dest = path.resolve(outdir, options.dest || options.entry);
	options.entry = path.resolve(indir, options.entry);

	return rollupLib.rollup(options).then(bundle => bundle.write(options));
}
