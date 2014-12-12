module.exports = function moveTo ( inputdir, outputdir, options ) {
	var merge = require( '../file/merge' );
	return merge( inputdir ).to( outputdir, options.dest );
};
