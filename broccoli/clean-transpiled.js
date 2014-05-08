'use strict';
var Filter = require('broccoli-filter')

// boilerplate broccoli filter, extract to own module...
function CleanTranspileFilter(inputTree /*, options*/) {
	if (!(this instanceof CleanTranspileFilter)) {
		return new CleanTranspileFilter(inputTree /*, options*/);
	}

	this.inputTree = inputTree;
	//this.options = options || {};
}

CleanTranspileFilter.prototype = Object.create(Filter.prototype);
CleanTranspileFilter.prototype.constructor = CleanTranspileFilter;
CleanTranspileFilter.prototype.extensions = ['js'];
CleanTranspileFilter.prototype.targetExtension = 'js';

CleanTranspileFilter.prototype.processString = function ( src ) {
	var dependencies = {};

	src = src

		// anonymise the module
		.replace( /^define\(".+?",\s+/, 'define(' )

		// remove "exports" from dependency list
		.replace( /,?"exports"/, '' )

		// remove empty dependency lists
		.replace( /^define\(\[\],\s+/, 'define(' )

		// gather dependency names
		.replace( /\svar (.+?) = __dependency(\d+)__\["default"\];\n/g, function ( match, name, num ) {
			dependencies[ num ] = name;
			return '';
		})

		// replace dependency names
		.replace( /__dependency(\d+)__,/g, function ( match, num ) {
			return ( dependencies[ num ] ? dependencies[ num ] + ',' : '' );
		})

		// remove __exports__
		.replace( /,?\s*__exports__/, '' )

		// `return` instead of `__exports__['default'] =`
		.replace( /__exports__\["default"\] =/, 'return' );

	return src;
};

module.exports = CleanTranspileFilter;
