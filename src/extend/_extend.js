import config from '../Ractive/config/config';
import dataConfigurator from '../Ractive/config/custom/data';
import construct from '../Ractive/construct';
import initialise from '../Ractive/initialise';
import Ractive from '../Ractive';
import isInstance from '../Ractive/static/isInstance';
import styleSet from '../Ractive/static/styleSet';
import styleGet from '../Ractive/static/styleGet';
import sharedSet from '../Ractive/static/sharedSet';
import sharedGet from '../Ractive/static/sharedGet';
import { assign, create, defineProperties, toPairs } from 'utils/object';
import { isArray, isFunction } from 'utils/is';

const callsSuper = /super\s*\(|\.call\s*\(\s*this/;

export function extend ( ...options ) {
	if( !options.length ) {
		return extendOne( this );
	} else {
		return options.reduce( extendOne, this );
	}
}

export function extendWith ( Class, options = {} ) {
	return extendOne( this, options, Class );
}

function extendOne ( Parent, options = {}, Target ) {
	let proto;
	let Child = isFunction( Target ) && Target;

	if ( options.prototype instanceof Ractive ) {
		throw new Error( `Ractive no longer supports multiple inheritance.` );
	}

	if ( Child ) {
		if ( !( Child.prototype instanceof Parent ) ) {
			throw new Error( `Only classes that inherit the appropriate prototype may be used with extend` );
		}
		if ( !callsSuper.test( Child.toString() ) ) {
			throw new Error( `Only classes that call super in their constructor may be used with extend` );
		}

		proto = Child.prototype;
	} else {
		Child = function ( options ) {
			if ( !( this instanceof Child ) ) return new Child( options );

			construct( this, options || {} );
			initialise( this, options || {}, {} );
		};

		proto = create( Parent.prototype );
		proto.constructor = Child;

		Child.prototype = proto;
	}

	// Static properties
	defineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		extend: { value: extend, writable: true, configurable: true },
		extendWith: { value: extendWith, writable: true, configurable: true },
		extensions: { value: [] },

		isInstance: { value: isInstance },

		Parent: { value: Parent },
		Ractive: { value: Ractive },

		styleGet: { value: styleGet.bind( Child ), configurable: true },
		styleSet: { value: styleSet.bind( Child ), configurable: true }
	});

	// extend configuration
	config.extend( Parent, proto, options, Child );

	// store event and observer registries on the constructor when extending
	Child._on = ( Parent._on || [] ).concat( toPairs( options.on ) );
	Child._observe = ( Parent._observe || [] ).concat( toPairs( options.observe ) );

	Parent.extensions.push( Child );

	// attribute defs are not inherited, but they need to be stored
	if ( options.attributes ) {
		let attrs;

		// allow an array of optional props or an object with arrays for optional and required props
		if ( isArray( options.attributes ) ) {
			attrs = { optional: options.attributes, required: [] };
		} else {
			attrs = options.attributes;
		}

		// make sure the requisite keys actually store arrays
		if ( !isArray( attrs.required ) ) attrs.required = [];
		if ( !isArray( attrs.optional ) ) attrs.optional = [];

		Child.attributes = attrs;
	}

	dataConfigurator.extend( Parent, proto, options, Child );

	proto.computed = assign( create( Parent.prototype.computed ), options.computed );
	proto.helpers = assign( create( Parent.prototype.helpers ), options.helpers );

	return Child;
}

defineProperties( Ractive, {
	sharedGet: { value: sharedGet },
	sharedSet: { value: sharedSet },
	styleGet: { configurable: true, value: styleGet.bind( Ractive ) },
	styleSet: { configurable: true, value: styleSet.bind( Ractive ) }
});
