import { ALIAS, ANCHOR, COMPONENT, DOCTYPE, ELEMENT, INTERPOLATOR, PARTIAL, SECTION, TRIPLE, YIELDER } from '../../config/types';
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
import Mapping from './component/Mapping';
import Option from './element/specials/Option';
import Partial from './Partial';
import Section from './Section';
import Select from './element/specials/Select';
import Textarea from './element/specials/Textarea';
import Text from './Text';
import Transition from './element/Transition';
import Triple from './Triple';
//import Yielder from './Yielder';
import getComponentConstructor from './component/getComponentConstructor';
import findElement from './shared/findElement';

const constructors = {};
constructors[ ALIAS ] = Alias;
constructors[ ANCHOR ] = Component;
constructors[ DOCTYPE ] = Doctype;
constructors[ INTERPOLATOR ] = Interpolator;
constructors[ PARTIAL ] = Partial;
constructors[ SECTION ] = Section;
constructors[ TRIPLE ] = Triple;
constructors[ YIELDER ] = Partial;

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

	let Item;

	// component mappings are a special case of attribute
	if ( options.template.t === ATTRIBUTE ) {
		let el = options.owner;
		if ( !el || ( el.type !== ANCHOR && el.type !== COMPONENT && el.type !== ELEMENT ) ) {
			el = findElement( options.parentFragment );
		}
		options.element = el;

		Item = el.type === COMPONENT || el.type === ANCHOR ? Mapping : Attribute;
	} else {
		Item = constructors[ options.template.t ];
	}

	if ( !Item ) throw new Error( `Unrecognised item type ${options.template.t}` );

	return new Item( options );
}
