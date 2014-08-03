import removeFromArray from 'utils/removeFromArray';

export default function unbindOption ( option ) {
	if ( option.select ) {
		removeFromArray( option.select.options, option );
	}
}
