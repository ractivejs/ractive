import { noRegistryFunctionReturn } from '../../../config/errors';
import { warnIfDebug } from '../../../utils/log';
import parser from '../../../Ractive/config/runtime-parser';
import { findInstance } from '../../../shared/registry';
import { fillGaps } from '../../../utils/object';

export default function getPartialTemplate ( ractive, name, parentFragment ) {
	// If the partial in instance or view heirarchy instances, great
	let partial = getPartialFromRegistry( ractive, name, parentFragment || {} );
	if ( partial ) return partial;

	// Does it exist on the page as a script tag?
	partial = parser.fromId( name, { noThrow: true } );
	if ( partial ) {
		// parse and register to this ractive instance
		const parsed = parser.parseFor( partial, ractive );

		// register extra partials on the ractive instance if they don't already exist
		if ( parsed.p ) fillGaps( ractive.partials, parsed.p );

		// register (and return main partial if there are others in the template)
		return ractive.partials[ name ] = parsed.t;
	}
}

function getPartialFromRegistry ( ractive, name, parentFragment ) {
	// if there was an instance up-hierarchy, cool
	let partial = findParentPartial( name, parentFragment.owner );
	if ( partial ) return partial;

	// find first instance in the ractive or view hierarchy that has this partial
	const instance = findInstance( 'partials', ractive, name );

	if ( !instance ) { return; }

	partial = instance.partials[ name ];

	// partial is a function?
	let fn;
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
		const parsed = parser.parseFor( partial, instance );

		// Partials cannot contain nested partials!
		// TODO add a test for this
		if ( parsed.p ) {
			warnIfDebug( 'Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive });
		}

		// if fn, use instance to store result, otherwise needs to go
		// in the correct point in prototype chain on instance or constructor
		const target = fn ? instance : findOwner( instance, name );

		// may be a template with partials, which need to be registered and main template extracted
		target.partials[ name ] = partial = parsed.t;
	}

	// store for reset
	if ( fn ) partial._fn = fn;

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
		: findConstructor( constructor.Parent, key );
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
