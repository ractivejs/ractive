module.exports = function ( grunt) {

	return {
		full: {
			options: {
				out: '<%= tmpDir %>/ractive.js',
				paths: {
					'legacy': 'empty/legacy'
				},
				onBuildWrite: getOnBuildWrite()
			}
		},
		legacy: {
			options: {
				out: '<%= tmpDir %>/ractive-legacy.js',
				onBuildWrite: getOnBuildWrite()
			}
		},
		runtime: {
			options: {
				out: '<%= tmpDir %>/ractive.runtime.js',
				paths: {
					'parse/_parse': 'empty/parse',
					'legacy': 'empty/legacy'
				},
				onBuildWrite: getOnBuildWrite()
			}
		},
		runtime_legacy: {
			options: {
				out: '<%= tmpDir %>/ractive-legacy.runtime.js',
				paths: {
					'parse/_parse': 'empty/parse'
				},
				onBuildWrite: getOnBuildWrite()
			}
		},
		options: {
			baseUrl: '<%= tmpDir %>/<%= tmpSrcDir %>/',
			name: 'Ractive',
			optimize: 'none',
			logLevel: 2
		}
	};

	function getOnBuildWrite () {
		var prefixes, used, banned;

		prefixes = {
			'extend__extend': 'Ractive_extend',
			'typeof': '_typeof'
		}; // this is why we need a closure for each build target
		used = {};

		return function ( name, path, contents ) {
			var relativePath, prefix, moduleNames = {},
				srcPath = grunt.template.process( '<%= tmpDir %>/<%= tmpSrcDir %>/' );

			relativePath = path.substring( path.indexOf( srcPath ) + srcPath.length );

			prefix = '/* ' + relativePath + ' */\n';

			return prefix + require( 'amdclean' ).clean({
				prefixTransform: function ( prefix ) {
					var match, result, lastPart;

					// special case
					if ( prefix === 'utils_hasOwnProperty' ) {
						return 'hasOwn';
					}

					if ( prefixes[ prefix ] ) {
						return prefixes[ prefix ];
					}

					prefix = prefix.replace( /(\w+)__(\w+)/, function ( match, $1, $2 ) {
						if ( $1 === $2 ) {
							return $1;
						}

						return match;
					});

					if ( match = /(\w+)_prototype_(\w+)$/.exec( prefix ) ) {
						result = match[1] + '$' + match[2];
					} else {
						if ( prefixes[ prefix ] ) {
							result = prefixes[ prefix ];
						}

						else {
							lastPart = prefix.substring( prefix.lastIndexOf( '_' ) + 1 );

							if ( prefixes[ lastPart ] ) {
								result = prefixes[ lastPart ];
							}

							else if ( !used[ lastPart ] ) {
								process.stdout.write('-');
								result = lastPart;
								prefixes[ prefix ] = lastPart;
								used[ lastPart ] = true;
							}

							else {
								console.error( 'Existing prefix', prefix );
								result = prefix;
							}
						}
					}

					return result;
				},
				code: contents
			}) + '\n';
		};
	};
};
