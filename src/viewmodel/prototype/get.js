import { lastItem } from 'utils/array';
import { hasOwn } from 'utils/object';
import FAILED_LOOKUP from './get/FAILED_LOOKUP';

var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var captureGroup;



	return keypath.get( options );

}
