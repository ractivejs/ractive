import { ELEMENT, INTERPOLATOR, PARTIAL, SECTION, TRIPLE } from '../../config/types';
import Component from './Component';
import Element from './Element';
import Interpolator from './Interpolator';
import Option from './element/specials/Option';
import Partial from './Partial';
import Section from './Section';
import Select from './element/specials/Select';
import Text from './Text';
import Triple from './Triple';
import { findInViewHierarchy } from 'shared/registry';

const constructors = {
	[ INTERPOLATOR ]: Interpolator,
	[ PARTIAL ]: Partial,
	[ SECTION ]: Section,
	[ TRIPLE ]: Triple
};

const specialElements = {
	select: Select,
	option: Option
};

export default function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	if ( options.template.t === ELEMENT ) {
		// could be component or element
		const ComponentConstructor = findInViewHierarchy( 'components', options.parentFragment.ractive, options.template.e );
		if ( ComponentConstructor ) {
			return new Component( options, ComponentConstructor );
		}

		const tagName = options.template.e.toLowerCase();

		const ElementConstructor = specialElements[ tagName ] || Element;
		return new ElementConstructor( options );
	}

	const Item = constructors[ options.template.t ];

	if ( !Item ) throw new Error( `Unrecognised item type ${options.template.t}` );

	return new Item( options );
}
