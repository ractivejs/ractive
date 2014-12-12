module.exports = es6transpiler;

function es6transpiler ( code, options ) {
	var transpiled;

	// es6-transpiler uses String#contains, which is not available in node 0.10.x
	if ( !String.prototype.contains ) {
		String.prototype.contains = function () { return this.indexOf.apply( this, arguments ) !== -1; };
	}

	options.src = code;
	transpiled = require( 'es6-transpiler' ).run( options );

	if ( transpiled.errors.length ) {
		throw new Error( 'Errors transpiling code: ' + JSON.stringify( transpiled.errors ) );
	}

	return transpiled.src;
}

es6transpiler.defaults = {
	accept: '.js'
};
