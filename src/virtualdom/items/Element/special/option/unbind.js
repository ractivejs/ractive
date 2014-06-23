import removeFromArray from 'utils/removeFromArray';

export default function unbindOption ( option ) {
	removeFromArray( option.select.options, option );
}
