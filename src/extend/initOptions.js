define( function () {

	'use strict';

	var getObject, getArray, properties;

	getObject = function () { return {}; };
	getArray = function () { return []; };

	properties = {
		el:                 { enumerable: true, value: false     },
		preserveWhitespace: { enumerable: true, value: false     },
		append:             { enumerable: true, value: false     },
		twoway:             { enumerable: true, value: true      },
		modifyArrays:       { enumerable: true, value: true      },
		data:               { enumerable: true, value: getObject },
		lazy:               { enumerable: true, value: false     },
		debug:              { enumerable: true, value: false     },
		transitions:        { enumerable: true, value: getObject },
		decorators:         { enumerable: true, value: getObject },
		events:             { enumerable: true, value: getObject },
		noIntro:            { enumerable: true, value: false     },
		transitionsEnabled: { enumerable: true, value: true      },
		magic:              { enumerable: true, value: false     },
		adaptors:           { enumerable: true, value: getArray  }
	};

	return {
		keys: function() {
			return Object.keys(properties);
		},

		properties: function() {
			return properties;
		}
	};

});
