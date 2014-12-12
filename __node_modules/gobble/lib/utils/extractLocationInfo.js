module.exports = function ( err ) {
	var loc = {}, match;

	if ( err.file !== undefined ) loc.file = err.file;
	if ( err.line !== undefined ) loc.line = err.line;
	if ( err.column !== undefined ) loc.column = err.column;

	if ( err.line === undefined && err.column === undefined && err.loc ) {
		loc.line = err.loc.line;
		loc.column = err.loc.column;
	}

	if ( loc.line === undefined ) {
		if ( match = /line (\d+)/.exec( err.message ) ) {
			loc.line = +match[1];
		}
	}

	if ( loc.column === undefined ) {
		if ( match = /column (\d+)/.exec( err.message ) ) {
			loc.column = +match[1];
		}
	}

	return loc;
};