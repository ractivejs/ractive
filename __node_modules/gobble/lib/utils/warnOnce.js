var alreadyWarned = {};

module.exports = function warnOnce () {
	var warning = require( 'util' ).format.apply( null, arguments );

	if ( !alreadyWarned[ warning ] ) {
		console.log( warning );
		alreadyWarned[ warning ] = true;
	}
};