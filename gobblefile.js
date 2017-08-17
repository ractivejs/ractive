/*eslint-env node */
/*eslint object-shorthand: 0 quote-props: 0 */
const fs = require('fs');
const path = require('path');

const fsPlus = require('fs-plus');
const gobble = require('gobble');
const buble = require('buble');
const rollupLib = require('rollup');
const rollupAlias = require('rollup-plugin-alias');
const istanbul = require('rollup-plugin-istanbul');
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

const ractiveAliases = rollupAlias({
	resolve: ['.js'],

	src: path.resolve('./src'),
	config: path.resolve('./src/config'),
	parse: path.resolve('./src/parse'),
	shared: path.resolve('./src/shared'),
	utils: path.resolve('./src/utils')
});


const runtimeModulesToIgnore = ['parse/_parse.js'].map(p => p.split('/').join(path.sep));
const placeholders = { BUILD_PLACEHOLDER_VERSION: version };

const src = gobble('src');
const polyfills = src.include(['polyfills.js']);
const tests = gobble('tests').transform(transpile, { accept: ['.js'] });
const browserTests = tests.include(['helpers/**/*', 'browser/**/*']);
const nodeTests = tests.include(['helpers/**/*', 'node/**/*']);

const qunit = gobble('qunit').moveTo('qunit');
const typings = gobble('typings').moveTo('typings');
const bin = gobble('bin').moveTo('bin');
const lib = gobble('lib').moveTo('lib');

const manifest = gobble('manifests').transform(replacePlaceholders);
const sandbox = gobble('sandbox');

module.exports = ({
	'dev:browser'() {
		const lib = buildUmdLib('ractive.js', [], [ractiveAliases]);
		const tests = buildBrowserTests();
		const polyfills = buildUmdPolyfill();
		return gobble([lib, polyfills, tests, sandbox, qunit]);
	},
	'bundle:test'() {
		const lib = buildUmdLib('ractive.js', [], [ractiveAliases, istanbul()]);
		const browserTests = buildBrowserTests();
		const nodeTests = buildNodeTests();
		const polyfills = buildUmdPolyfill();
		return gobble([lib, polyfills, qunit, browserTests, nodeTests]);
	},
	'bundle:release'() {
		const libEsFull = buildESLib('ractive.mjs', [], [ractiveAliases]);
		const libEsRuntime = buildESLib('runtime.mjs', runtimeModulesToIgnore, [ractiveAliases]);

		const libUmdFull = buildUmdLib('ractive.js', [], [ractiveAliases]);
		const libUmdRuntime = buildUmdLib('runtime.js', runtimeModulesToIgnore, [ractiveAliases]);

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
function buildUmdLib(dest, excludedModules, extraRollupPlugins) {
	return src.transform(rollup, {
		plugins: [skipModule(excludedModules)].concat(extraRollupPlugins || []),
		moduleName: 'Ractive',
		format: 'umd',
		entry: 'Ractive.js',
		dest: dest,
		banner: banner,
		noConflict: true,
		cache: false,
		sourceMap: true
	}).transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
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
	}).transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
}

// Builds a UMD bundle for browser/PhantomJS tests.
function buildBrowserTests() {
	return gobble([
		browserTests,
		browserTests.transform(buildTestEntryPoint, { dir: 'browser' })
	])
		.transform(copy)
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
		.transform(copy)
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
	}).transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
}

function buildESPolyfill() {
	return polyfills.transform(rollup, {
		format: 'es',
		entry: 'polyfills.js',
		dest: 'polyfills.mjs',
		cache: false
	}).transform(transpile, { accept: ['.js'] }).transform(replacePlaceholders);
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

	return rollupLib.rollup(options).then(bundle => bundle.write(options));
}
