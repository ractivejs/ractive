/*global require, describe, it */

var Ractive = require( '../../ractive' );
Ractive.WELCOME_MESSAGE = 'Ractive tests...';
var assert = require( 'assert' );

describe( 'Ractive', function () {
	it( 'should be a function', function () {
		assert.equal( typeof Ractive, 'function' );
	});
});
