import { noRegistryFunctionReturn } from '../../../config/errors';
import { warnIfDebug } from '../../../utils/log';
import parser from '../../../Ractive/config/custom/template/parser';
import { findInstance } from '../../../shared/registry';

export default function getPartialTemplate ( ractive, name, parentFragment ) {
	var partial;

	// If the partial in instance or view heirarchy instances, great
	if ( partial = getPartialFromRegistry( ractive, name, parentFragment || {} ) ) {
		return partial;
	}

	// Does it exist on the page as a script tag?
	partial = parser.fromId( name, { noThrow: true } );

	if ( partial ) {
		// parse and register to this ractive instance
		let parsed = parser.parse( partial, parser.getParseOptions( ractive ) );

		// register (and return main partial if there are others in the template)
		return ractive.partials[ name ] = parsed.t;
	}
}

function getPartialFromRegistry ( ractive, name, parentFragment ) {
	let fn, partial = findParentPartial( name, parentFragment.owner );

	// if there was an instance up-hierarchy, cool
	if ( partial ) return partial;

	// find first instance in the ractive or view hierarchy that has this partial
	var instance = findInstance( 'partials', ractive, name );

	if ( !instance ) { return; }

	partial = instance.partials[ name ];

	// partial is a function?
	if ( typeof partial === 'function' ) {
		fn = partial.bind( instance );
		fn.isOwner = instance.partials.hasOwnProperty(name);
		partial = fn.call( ractive, parser );
	}

	if ( !partial && partial !== '' ) {
		warnIfDebug( noRegistryFunctionReturn, name, 'partial', 'partial', { ractive });
		return;
	}

	// If this was added manually to the registry,
	// but hasn't been parsed, parse it now
	if ( !parser.isParsed( partial ) ) {

		// use the parseOptions of the ractive instance on which it was found
		let parsed = parser.parse( partial, parser.getParseOptions( instance ) );

		// Partials cannot contain nested partials!
		// TODO add a test for this
		if ( parsed.p ) {
			warnIfDebug( 'Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive });
		}

		// if fn, use instance to store result, otherwise needs to go
		// in the correct point in prototype chain on instance or constructor
		let target = fn ? instance : findOwner( instance, name );

		// may be a template with partials, which need to be registered and main template extracted
		target.partials[ name ] = partial = parsed.t;
	}

	// store for reset
	if ( fn ) {
		partial._fn = fn;
	}

	return partial.v ? partial.t : partial;
}

function findOwner ( ractive, key ) {
	return ractive.partials.hasOwnProperty( key )
		? ractive
		: findConstructor( ractive.constructor, key);
}

function findConstructor ( constructor, key ) {
	if ( !constructor ) { return; }
	return constructor.partials.hasOwnProperty( key )
		? constructor
		: findConstructor( constructor._Parent, key );
}

function findParentPartial( name, parent ) {
	if ( parent ) {
		if ( parent.template && parent.template.p && parent.template.p[name] ) {
			return parent.template.p[name];
		} else if ( parent.parentFragment && parent.parentFragment.owner ) {
			return findParentPartial( name, parent.parentFragment.owner );
		}
	}
}
