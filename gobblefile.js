/*eslint-env node */
/*eslint object-shorthand: 0 quote-props: 0 */
const fs = require('fs');
const path = require('path');

const fsPlus = require('fs-plus');
const gobble = require('gobble');
const buble = require('buble');
const hoistProps = require('hoist-props');

const time = new Date();
const commitHash = process.env.COMMIT_HASH || 'unknown';
const version = require('./package.json').version;
const versionExt = ~version.indexOf('-edge') ? `-${commitHash}` : '';
const banner = `/*
	Ractive.js v${version}
	Build: ${commitHash}
	Date: ${time}

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/`;

// Had to use path.join because I happen to work on Windows that uses `\`.
const runtimeModulesToIgnore = [
	path.join('src', 'parse', '_parse.js')
];

// Commonly used nodes
const src = gobble('src').moveTo('src');
const tests = gobble('tests');

// Some tests reference back to the source. Structure is preserved so that
// import paths reflect the actual filesystem paths.
const browserTests = gobble([src, tests.include(['helpers/**/*', 'browser/**/*']).moveTo('tests')]);
const nodeTests = gobble([src, tests.include(['helpers/**/*', 'node/**/*']).moveTo('tests')]);

// Create, add, and select profiles based on the --env switch.
module.exports = ({
	'dev:browser': function () {
		return gobble([
			buildUmdLib('ractive.js', []).transform(noConflict),
			gobble('sandbox').moveTo('sandbox'),
			buildBrowserTests(),
			// buildBrowserPerfTests(),
		]);
		// TODO: There should be an observe to run tests here automatically. That
		//       way, you don't need to view the browser or run build.
	},
	'dev:node': function () {
		return gobble([
			buildUmdLib('ractive.js', []).transform(noConflict),
			buildNodeTests(),
			// buildNodePerfTests(),
		]);
		// TODO: There should be an observe to run tests here automatically. That
		//       way, you don't need to view the browser or run build.
	},
	'production': function () {
		const es = gobble([
			buildESLib('ractive.mjs', []),
			buildESLib('ractive.runtime.mjs', runtimeModulesToIgnore)
		]);

		const umd = gobble([
			buildUmdLib('ractive.js', []),
			buildUmdLib('ractive.runtime.js', runtimeModulesToIgnore)
		]).transform(noConflict);

		// Minification only makes sense on the UMD build since it's the only build
		// that's dropped straight into the browser.
		const umdMin = umd.transform(hoistProps).transform('uglifyjs', { ext: '.min.js', sourceMap: false });

		return gobble([
			es,
			umd,
			umdMin,
			buildBrowserTests(),
			buildNodeTests(),
			gobble('bin').moveTo('bin'),
			gobble('lib').moveTo('lib'),
			gobble('typings').moveTo('typings')
		]);
	}
})[gobble.env()]();

/**
 * Helper functions
 */

// Builds a UMD bundle of Ractive
function buildUmdLib(dest, excludedModules) {
	return src.transform('rollup', {
		plugins: [
			// TODO: Browser-specific options
			transpile(),
			interpolatePlaceholders('<@version@>', `${version}${versionExt}`),
			skipModule(excludedModules)
		],
		format: 'umd',
		entry: 'src/Ractive.js',
		moduleName: 'Ractive',
		dest,
		banner
	});
}

// Builds an ES bundle of Ractive
function buildESLib(dest, excludedModules) {
	return src.transform('rollup', {
		plugins: [
			// TODO: Browser-specific options
			transpile(),
			interpolatePlaceholders('<@version@>', `${version}${versionExt}`),
			skipModule(excludedModules)
		],
		format: 'es',
		entry: 'src/Ractive.js',
		moduleName: 'Ractive',
		dest,
		banner
	});
}

// Builds a UMD bundle for browser/PhantomJS tests.
function buildBrowserTests() {
	const testBundle = gobble([
		browserTests,
		browserTests.transform(buildTestEntryPoint, { dir: 'tests/browser' }),
	]).transform('rollup', {
		// TODO: Node-specific options
		plugins: [transpile()],
		format: 'iife',
		entry: 'tests.js',
		dest: 'tests.js',
		moduleName: 'RactiveBrowserTests',
		globals: {
			qunit: 'QUnit',
			simulant: 'simulant'
		}
	}).moveTo('tests/browser');

	return gobble([
		testBundle,
		gobble('tests/qunit').moveTo('tests/browser')
	]);
}

// Builds a CJS bundle for node tests.
function buildNodeTests() {
	return gobble([
		nodeTests,
		nodeTests.transform(buildTestEntryPoint, { dir: 'tests/node' }),
	]).transform('rollup', {
		// TODO: Node-specific options
		plugins: [transpile()],
		format: 'cjs',
		entry: 'tests.js',
		dest: 'tests.js',
		external: [
			'cheerio',
			'qunit'
		]
	}).moveTo('tests/node');
}

/**
 * Rollup plugins
 */

// Replaces special placeholder values with values determined on build.
// TODO: Look for a better-looking placeholder that blends in with JS.
// TODO: Better replace that supports sourcemap?
function interpolatePlaceholders(placeholder, value) {
	return {
		name: 'interpolatePlaceholders',
		transform: function (src, modulePath) {
			return src.replace(new RegExp(`${placeholder}`, 'g'), value);
		}
	};
}

// Replaces a modules content with a null export to omit module contents.
// TODO: Better replace that supports sourcemap?
function skipModule(excludedModules) {
	return {
		name: 'skipModule',
		transform: function (src, modulePath) {
			const moduleRelativePath = path.relative(__dirname, modulePath);
			return excludedModules.indexOf(moduleRelativePath) > -1 ? 'export default null;' : src;
		}
	};
}

// Essentially rollup-plugin-buble, except we take out the middleman and do
// Buble directly. Easier to get Buble updates this way and less dependencies.
function transpile() {
	return {
		name: 'transpile',
		transform: function (src, modulePath) {
			return buble.transform(src, {
				target: { ie: 9 },
				transforms: { modules: false }
			});
		}
	};
}

/**
 * Gobble transforms
 */

// Builds an entrypoint in the designated directory that imports all test specs
// and calls them one after the other.
function buildTestEntryPoint(inDir, outDir, options) {
	const _options = Object.assign({ dir: '', entrypoint: 'tests.js' }, options);
	const testPaths = fsPlus.listTreeSync(path.join(inDir, _options.dir)).filter(testPath => fsPlus.isFileSync(testPath) && path.extname(testPath) === '.js');
	const testImports = testPaths.map((testPath, index) => `import test${index} from './${path.relative(inDir, testPath).replace(/\\/g, '/')}';`).join('\n');
	const testCalls = testPaths.map((testPath, index) => `test${index}();`).join('\n');
	fs.writeFileSync(path.join(outDir, _options.entrypoint), `${testImports}\n${testCalls}`, 'utf8');
	return Promise.resolve();
}

// Augments the no-conflict logic.
// TODO: This can potentially be done in source code.
// TODO: Should be guarded when used in Node.
function noConflict(inFile) {
	return inFile.replace('global.Ractive = factory()', `(function() {
		const current = global.Ractive;
		const next = factory();
		global.Ractive = next;
		next.noConflict = function() {
			global.Ractive = current;
			return next;
		};
	})()`);
}
