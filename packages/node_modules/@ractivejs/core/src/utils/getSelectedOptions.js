import { toArray } from './array';

export default function getSelectedOptions ( select ) {
	/* istanbul ignore next */
	return select.selectedOptions
		? toArray( select.selectedOptions )
		: select.options
			? toArray( select.options ).filter( option => option.selected )
			: [];
}
