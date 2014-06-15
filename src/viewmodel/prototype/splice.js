import types from 'config/types';

export default function Viewmodel$splice ( keypath, spliceSummary ) {
	var viewmodel = this, i, dependants, updateDependant, childKeypath;

	// TODO surely we don't need the block before AND after
	for ( i = spliceSummary.rangeStart; i < spliceSummary.clearEnd; i += 1 ) {
		viewmodel.clearCache( keypath + '.' + i );
	}

	if ( dependants = viewmodel.deps[ 'default' ][ keypath ] ) {
		dependants.filter( canSplice ).forEach( dependant => dependant.splice( spliceSummary ) );
	}

	// if we're removing old items and adding new ones, simultaneously, we need to force an update
	if ( spliceSummary.added && spliceSummary.removed ) {
		for ( i = spliceSummary.rangeStart; i < spliceSummary.rangeEnd; i += 1 ) {
			childKeypath = keypath + '.' + i;
			viewmodel.mark( childKeypath );
		}
	}

	// If length property has changed - notify dependants
	if ( spliceSummary.balance ) {
		viewmodel.mark( keypath + '.length' );
	}
}

function canSplice ( dependant ) {
	return dependant.type === types.SECTION && !dependant.inverted && dependant.rendered;
}
