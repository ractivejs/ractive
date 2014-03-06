module.exports = {
	full: {
		options: {
			out: 'tmp/Ractive.js',
			paths: {
				'legacy': 'empty/legacy'
			}
		}
	},
	legacy: {
		options: {
			out: 'tmp/Ractive-legacy.js'
		}
	},
	runtime: {
		options: {
			out: 'tmp/Ractive.runtime.js',
			paths: {
				'parse/_parse': 'empty/parse',
				'legacy': 'empty/legacy'
			}
		}
	},
	runtime_legacy: {
		options: {
			out: 'tmp/Ractive-legacy.runtime.js',
			paths: {
				'parse/_parse': 'empty/parse'
			}
		}
	},
	options: {
		baseUrl: 'src/',
		name: 'Ractive',
		optimize: 'none',
		logLevel: 2,
		onBuildWrite: function( name, path, contents ) {
			var moduleNames = {};

			return require( 'amdclean' ).clean({
				code: contents
			}) + '\n';
		},
		wrap: {
			startFile: 'wrapper/banner.js',
			endFile: 'wrapper/footer.js'
		}
	}
};
