module.exports = esperanto;

var methods = {
	amd: 'toAmd',
	cjs: 'toCjs',
	umd: 'toUmd'
};

function esperanto ( es6, options ) {
	var method = methods[ options.type || 'amd' ];

	if ( !method ) {
		throw new Error( 'The gobble-esperanto plugin supports the following types: ' + Object.keys( methods ).join( ', ' ) );
	}

	if ( !!options.sourceMap ) {
		options.sourceMapSource = this.src;
		options.sourceMapFile = this.dest;
	}

	return require( 'esperanto' )[ method ]( es6, options );
}

esperanto.defaults = {
	accept: '.js'
};
