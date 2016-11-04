import { toArray } from './array';

export default function getSelectedOptions ( select ) {
	return select.selectedOptions
		? toArray( select.selectedOptions )
		: select.options
			? toArray( select.options ).filter( option => option.selected )
			: [];
}
