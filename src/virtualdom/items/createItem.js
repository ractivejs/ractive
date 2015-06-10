import { ELEMENT, INTERPOLATOR, SECTION } from '../../config/types';
import Element from './Element';
import Interpolator from './Interpolator';
import Section from './Section';
import Text from './Text';

const constructors = {
	[ ELEMENT ]: Element,
	[ INTERPOLATOR ]: Interpolator,
	[ SECTION ]: Section
}

export default function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options.template );
	}

	const Item = constructors[ options.template.t ];

	if ( !Item ) throw new Error( `Unrecognised item type ${options.template.t}` );

	return new Item( options );
}
