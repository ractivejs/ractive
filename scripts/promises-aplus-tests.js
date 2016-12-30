#!/usr/bin/env node

var sander = require( 'sander' ),
	esperanto = require( 'esperanto' ),
	promisesAplusTests = require( 'promises-aplus-tests' ),

	promiseSrc,
	promiseCjs,
	P;

promiseSrc = sander.readFileSync( __dirname, '../src/utils/Promise.js' ).toString();
promiseCjs = esperanto.toCjs( promiseSrc );

sander.writeFileSync( __dirname, '../tmp/Promise.js', promiseCjs.code );
P = require( '../tmp/Promise' );

promisesAplusTests({
	resolved: function ( val ) {
		return P.resolve( val );
	},

	rejected: function ( reason ) {
		return P.reject( reason );
	},

	deferred: function () {
		var obj = {};

		obj.promise = new P( function ( resolve, reject ) {
			obj.resolve = resolve;
			obj.reject = reject;
		});

		return obj;
	}
}, { reporter: 'dot' }, function ( err ) {
	if ( err ) throw err;
	console.log( 'done' );
});