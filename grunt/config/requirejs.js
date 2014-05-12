module.exports = {
	full: {
		options: {
			out: 'tmp/ractive.js',
			paths: {
				'legacy': 'empty/legacy'
			},
			onBuildWrite: getOnBuildWrite()
		}
	},
	legacy: {
		options: {
			out: 'tmp/ractive-legacy.js',
			onBuildWrite: getOnBuildWrite()
		}
	},
	runtime: {
		options: {
			out: 'tmp/ractive.runtime.js',
			paths: {
				'parse/_parse': 'empty/parse',
				'legacy': 'empty/legacy'
			},
			onBuildWrite: getOnBuildWrite()
		}
	},
	runtime_legacy: {
		options: {
			out: 'tmp/ractive-legacy.runtime.js',
			paths: {
				'parse/_parse': 'empty/parse'
			},
			onBuildWrite: getOnBuildWrite()
		}
	},
	options: {
		baseUrl: 'tmp/amd/',
		name: 'Ractive',
		optimize: 'none',
		logLevel: 2
	}
};

function getOnBuildWrite () {
	var prefixes, used, banned;

	console.log( 'creating closure' );
	prefixes = {
		'typeof': '_typeof'
	}; // this is why we need a closure for each build target
	used = {};
	banned = /^(typeof)$/; // some module names cannot be function names

	return function ( name, path, contents ) {
		var relativePath, prefix, moduleNames = {};

		relativePath = path.substring( path.indexOf( 'tmp/amd/' ) + 8 );

		prefix = '/* ' + relativePath + ' */\n';

		return prefix + require( 'amdclean' ).clean({
			prefixTransform: function ( prefix ) {
				var match, result, lastPart;

				// special case
				if ( prefix === 'utils_hasOwnProperty' ) {
					return 'hasOwn';
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

						if ( banned.test( lastPart ) ) {
							lastPart += '_';
						}

						if ( !used[ lastPart ] ) {
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
