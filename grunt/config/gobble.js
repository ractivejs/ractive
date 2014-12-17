module.exports = {
	toTmpDir: {
		dest: '<%= tmpDir %>',
		environment: 'production',
		force: true,
		config: function () {
			var gobble = require( 'gobble' ),
				src, es5, amd, bundle, src, test, result = [];

			var transpilerOptions = {
				globals: 'define Promise QUnit _modules test start asyncTest ok equal notEqual deepEqual expect throws simulant HTMLDocument jQuery MouseEvent'.split( ' ' ).reduce( function ( globals, name ) {
					globals[ name ] = true;
					return globals;
				}, {})
			};

			src = gobble( 'src' );
			es5 = src.transform( '6to5', { blacklist: [ 'modules', 'useStrict' ]});
			amd = es5.transform( 'esperanto', { strict: true });

			bundles = gobble([
				es5.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive.js',
					skip: [ 'legacy' ]
				}),

				es5.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive-legacy.js'
				}),

				es5.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive.runtime.js',
					skip: [ 'legacy', 'parse/_parse' ]
				}),

				es5.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive-legacy.runtime.js',
					skip: [ 'parse/_parse' ]
				})
			]);

			src = gobble([ amd, bundles ]).moveTo( 'src' );

			test = gobble([
				gobble( 'test' ).exclude([ 'modules/**', 'samples/**' ]),
				gobble( 'test' ).include([ 'modules/**', 'samples/**' ]).transform( 'es6-transpiler', transpilerOptions )
			]).moveTo( 'test' );

			result = [ src, test ];

			return gobble( result );
		}
	}
};
