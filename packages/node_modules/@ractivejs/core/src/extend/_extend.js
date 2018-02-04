import { toPairs } from '../utils/object';
import config from '../Ractive/config/config';
import dataConfigurator from '../Ractive/config/custom/data';
import construct from '../Ractive/construct';
import initialise from '../Ractive/initialise';
import Ractive from '../index';
import isInstance from '../Ractive/static/isInstance';

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
	let Child = typeof Target === 'function' && Target;

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

		proto = Object.create( Parent.prototype );
		proto.constructor = Child;

		Child.prototype = proto;
	}

	// Static properties
	Object.defineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },
		extendClass: { value: extendWith, writable: true, configurable: true },

		Parent: { value: Parent },
		Ractive: { value: Ractive },

		isInstance: { value: isInstance }
	});

	// extend configuration
	config.extend( Parent, proto, options );

	// store event and observer registries on the constructor when extending
	Child._on = ( Parent._on || [] ).concat( toPairs( options.on ) );
	Child._observe = ( Parent._observe || [] ).concat( toPairs( options.observe ) );

	// attribute defs are not inherited, but they need to be stored
	if ( options.attributes ) {
		let attrs;

		// allow an array of optional props or an object with arrays for optional and required props
		if ( Array.isArray( options.attributes ) ) {
			attrs = { optional: options.attributes, required: [] };
		} else {
			attrs = options.attributes;
		}

		// make sure the requisite keys actually store arrays
		if ( !Array.isArray( attrs.required ) ) attrs.required = [];
		if ( !Array.isArray( attrs.optional ) ) attrs.optional = [];

		Child.attributes = attrs;
	}

	dataConfigurator.extend( Parent, proto, options );

	if ( options.computed ) {
		proto.computed = Object.assign( Object.create( Parent.prototype.computed ), options.computed );
	}

	return Child;
}
