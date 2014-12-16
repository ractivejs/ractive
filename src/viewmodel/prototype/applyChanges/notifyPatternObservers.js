export default notifyPatternObservers;

function notifyPatternObservers ( viewmodel, keypath, onlyDirect ) {
	var potentialWildcardMatches;

	updateMatchingPatternObservers( viewmodel, keypath );

	if ( onlyDirect ) {
		return;
	}

	potentialWildcardMatches = keypath.wildcardMatches();
	potentialWildcardMatches.forEach( upstreamPattern => {
		cascade( viewmodel, upstreamPattern, keypath );
	});
}


function cascade ( viewmodel, upstreamPattern, keypath ) {
	var group, map, actualChildKeypath;

	group = viewmodel.depsMap.patternObservers;

	if ( !( group && (map = group[ upstreamPattern ]) ) ) { return; }

	map.forEach( childKeypath => {
		actualChildKeypath = keypath.join( childKeypath.lastKey ); // 'foo.bar.baz'

		updateMatchingPatternObservers( viewmodel, actualChildKeypath );
		cascade( viewmodel, childKeypath, actualChildKeypath );
	});
}

function updateMatchingPatternObservers ( viewmodel, keypath ) {
	viewmodel.patternObservers.forEach( observer => {
		if ( observer.regex.test( keypath ) ) {
			observer.update( keypath );
		}
	});
}
