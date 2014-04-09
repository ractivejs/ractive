// Adaptor for promises-aplus-tests

var Promise;

GLOBAL.define = function ( fun ) {
	Promise = fun();
};

require( '../src/utils/Promise' );

module.exports = {
	resolved: function ( val ) {
		return new Promise( function ( resolve, reject ) {
			resolve( val );
		});
	},

	rejected: function ( reason ) {
		return new Promise( function ( resolve, reject ) {
			reject( reason );
		});
	},

	deferred: function () {
		var obj;

		obj = {};

		obj.promise = new Promise( function ( resolve, reject ) {
			obj.resolve = resolve;
			obj.reject = reject;
		});

		return obj;
	}
};
