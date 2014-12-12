module.exports = function summariseChanges ( changes ) {
	var summary = {
		add: 0,
		unlink: 0,
		change: 0
	}, report = [];

	changes.forEach( function ( change ) {
		summary[ change.type ] += 1;
	});

	if ( summary.add ) {
		report.push( summary.add + ( summary.add === 1 ? ' file' : ' files' ) + ' added' );
	}

	if ( summary.change ) {
		report.push( summary.change + ( summary.change === 1 ? ' file' : ' files' ) + ' changed' );
	}

	if ( summary.unlink ) {
		report.push( summary.unlink + ( summary.unlink === 1 ? ' file' : ' files' ) + ' removed' );
	}

	return report.join( ', ' );
};