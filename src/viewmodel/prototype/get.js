import { lastItem } from 'utils/array';
import { hasOwn } from 'utils/object';
import FAILED_LOOKUP from './get/FAILED_LOOKUP';

var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var captureGroup;

	// capture the keypath, if we're inside a computation
	if ( options.capture && ( captureGroup = lastItem( this.captureGroups ) ) ) {
		if ( !~captureGroup.indexOf( keypath ) ) {
			captureGroup.push( keypath );
		}
	}



	return keypath.get( options );

}
