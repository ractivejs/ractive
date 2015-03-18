import { lastItem } from 'utils/array';

var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var captureGroup;

	// Capture is initiated by a computation, by calling
	// viewmodel.capture() to start and viewmode.release() to end.
	// BUT only "get" calls from ractive.get are to be capture,
	// not any other use of viewmodel.get()

	// capture the keypath, if we're inside a computation
	if ( options.capture && ( captureGroup = lastItem( this.captureGroups ) ) ) {
		if ( !~captureGroup.indexOf( keypath ) ) {
			captureGroup.push( keypath );
		}
	}

	return keypath.get( options );

	// TODO: implement this

	// if ( keypath.isRoot && options.fullRootGet ) {
	// 	for ( key in this.mappings ) {
	// 		value[ key ] = this.mappings[ key ].getValue();
	// 	}
	// }

}

function retrieve ( viewmodel, keypath ) {

	var parentValue, cacheMap, value, wrapped;

	parentValue = viewmodel.get( keypath.parent );

	if ( wrapped = viewmodel.wrapped[ keypath.parent.str ] ) {
		parentValue = wrapped.get();
	}

	if ( parentValue === null || parentValue === undefined ) {
		return;
	}

	// update cache map
	if ( !( cacheMap = viewmodel.cacheMap[ keypath.parent.str ] ) ) {
		viewmodel.cacheMap[ keypath.parent.str ] = [ keypath.str ];
	} else {
		if ( cacheMap.indexOf( keypath.str ) === -1 ) {
			cacheMap.push( keypath.str );
		}
	}

	// If this property doesn't exist, we return a sentinel value
	// so that we know to query parent scope (if such there be)
	if ( typeof parentValue === 'object' && !( keypath.lastKey in parentValue ) ) {
		return viewmodel.cache[ keypath.str ] = FAILED_LOOKUP;
	}

	value = parentValue[ keypath.lastKey ];

	// Do we have an adaptor for this value?
	viewmodel.adapt( keypath.str, value, false );

	// Update cache
	viewmodel.cache[ keypath.str ] = value;
	return value;
}
