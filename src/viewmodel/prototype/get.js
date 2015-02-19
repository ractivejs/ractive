import { lastItem } from 'utils/array';

var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var mapping, captureGroup;

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

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.get( keypath, options );
	}

	return keypath.get( options );
}
