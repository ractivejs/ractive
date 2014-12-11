module.exports = {
	toTmpDir: {
		dest: '<%= tmpDir %>',
		environment: 'production',
		force: true,
		config: function () {
			var gobble = require( 'gobble' ),
				src, amd, bundle, src, test, result = [];

			var transpilerOptions = {
				globals: 'define Promise QUnit _modules test start asyncTest ok equal notEqual deepEqual expect throws simulant HTMLDocument jQuery MouseEvent'.split( ' ' ).reduce( function ( globals, name ) {
					globals[ name ] = true;
					return globals;
				}, {})
			};

			src = gobble( 'src' );//.transform( '6to5', { blacklist: [ 'modules' ]});
			amd = src.transform( 'esperanto' );

			bundles = gobble([
				src.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive.js',
					skip: [ 'legacy' ]
				}),

				src.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive-legacy.js'
				}),

				src.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive.runtime.js',
					skip: [ 'legacy', 'parse/_parse' ]
				}),

				src.transform( 'esperanto-bundle', {
					type: 'umd',
					entry: 'Ractive.js',
					name: 'Ractive',
					dest: 'ractive-legacy.runtime.js',
					skip: [ 'parse/_parse' ]
				})
			]);

			src = gobble([ amd, bundles ]).transform( '6to5' ).moveTo( 'src' );

			test = gobble( 'test' )
				.transform( 'es6-transpiler', transpilerOptions )
				.moveTo( 'test' );

			result = [ src, test ];

			return gobble( result );
		}
	}
};
