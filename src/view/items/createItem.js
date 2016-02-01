import { ALIAS, DOCTYPE, ELEMENT, INTERPOLATOR, PARTIAL, SECTION, TRIPLE, YIELDER } from '../../config/types';
import { ATTRIBUTE, BINDING_FLAG, DECORATOR, EVENT, TRANSITION } from '../../config/types';
import Alias from './Alias';
import Attribute from './element/Attribute';
import BindingFlag from './element/BindingFlag';
import Component from './Component';
import Decorator from './element/Decorator';
import Doctype from './Doctype';
import Form from './element/specials/Form';
import Element from './Element';
import EventDirective from './shared/EventDirective';
import Interpolator from './Interpolator';
import Input from './element/specials/Input';
import Option from './element/specials/Option';
import Partial from './Partial';
import Section from './Section';
import Select from './element/specials/Select';
import Textarea from './element/specials/Textarea';
import Text from './Text';
import Transition from './element/Transition';
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

constructors[ ATTRIBUTE ] = Attribute;
constructors[ BINDING_FLAG ] = BindingFlag;
constructors[ DECORATOR ] = Decorator;
constructors[ EVENT ] = EventDirective;
constructors[ TRANSITION ] = Transition;

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
