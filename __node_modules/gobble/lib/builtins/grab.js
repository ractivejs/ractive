module.exports = function grab ( inputdir, outputdir, options ) {
	var merge = require( '../file/merge' );
	return merge( inputdir, options.src ).to( outputdir );
};
