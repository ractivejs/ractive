// Adaptor for promises-aplus-tests

var promise;

GLOBAL.define = function ( fun ) {
	promise = fun();
};

require( '../src/utils/promise' );

module.exports = {
	resolved: function ( val ) {
		return promise( function ( resolve, reject ) {
			resolve( val );
		});
	},

	rejected: function ( reason ) {
		return promise( function ( resolve, reject ) {
			reject( reason );
		});
	},

	deferred: function () {
		var obj;

		obj = {};

		obj.promise = promise( function ( resolve, reject ) {
			obj.resolve = resolve;
			obj.reject = reject;
		});

		return obj;
	}
};
