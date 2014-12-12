var gobble = require( 'gobble' );

module.exports = gobble( 'test/src' ).map( function ( content ) {
	return content.replace( '${test}', 'test that ran successfully' );
});
