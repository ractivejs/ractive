import { ALIAS, DOCTYPE, ELEMENT, INTERPOLATOR, PARTIAL, SECTION, TRIPLE, YIELDER } from '../../constants/types';
import Alias from './Alias';
import Component from './Component';
import Doctype from './Doctype';
import Form from './element/specials/Form';
import Element from './Element';
import Interpolator from './Interpolator';
import Input from './element/specials/Input';
import Option from './element/specials/Option';
import Partial from './Partial';
import Section from './Section';
import Select from './element/specials/Select';
import Textarea from './element/specials/Textarea';
import Text from './Text';
import Triple from './Triple';
import Yielder from './Yielder';
import getComponentConstructor from './component/getComponentConstructor';

const constructors = {};
constructors[ ALIAS ] = Alias;
constructors[ DOCTYPE ] = Doctype;
constructors[ INTERPOLATOR ] = Interpolator;
constructors[ PARTIAL ] = Partial;
constructors[ SECTION ] = Section;
constructors[ TRIPLE ] = Triple;
constructors[ YIELDER ] = Yielder;

const specialElements = {
	doctype: Doctype,
	form: Form,
	input: Input,
	option: Option,
	select: Select,
	textarea: Textarea
};

export default function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	if ( options.template.t === ELEMENT ) {
		// could be component or element
		const ComponentConstructor = getComponentConstructor( options.parentFragment.ractive, options.template.e );
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
