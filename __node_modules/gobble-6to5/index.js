module.exports = _6to5;

function _6to5 ( code, options ) {
	options.sourceMap = options.sourceMap !== false;
	return require( '6to5' ).transform( code, options );
}

_6to5.defaults = {
	accept: '.js'
};
