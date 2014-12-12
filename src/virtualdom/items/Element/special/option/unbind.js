import { removeFromArray } from 'utils/array';

export default function unbindOption ( option ) {
	if ( option.select ) {
		removeFromArray( option.select.options, option );
	}
}
