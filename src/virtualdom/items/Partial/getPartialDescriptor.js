import log from 'utils/log';
import config from 'config/config';
import parser from 'config/options/template/parser';
import deIndent from 'virtualdom/items/Partial/deIndent';

export default function getPartialDescriptor ( ractive, name ) {
	var partial;

	// If the partial in instance or view heirarchy instances, great
	if ( partial = getPartialFromRegistry( ractive, name ) ) {
		return partial;
	}

	// Does it exist on the page as a script tag?
	partial = parser.fromId( name, { noThrow: true } );

	if ( partial ) {
		// is this necessary?
		partial = deIndent( partial );

		// parse and register to this ractive instance
		let parsed = parser.parse( partial, parser.getParseOptions( ractive ) );



		// register (and return main partial if there are others in the template)
		return ractive.partials[ name ] = parsed.t;
	}

	log.error({
		debug: ractive.debug,
		message: 'noTemplateForPartial',
		args: { name: name }
	});

	// No match? Return an empty array
	return [];

}

function getPartialFromRegistry ( ractive, name ) {

	var partials = config.registries.partials;

	// find first instance in the ractive or view hierarchy that has this partial
	var instance = partials.findInstance( ractive, name );

	if ( !instance ) { return; }

	let partial = instance.partials[ name ], fn;

	// partial is a function?
	if ( typeof partial === 'function' ) {
		fn = partial.bind( instance );
		fn.isOwner = instance.partials.hasOwnProperty(name);
		partial = fn( instance.data, parser );
	}

	if ( !partial ) {
		log.warn({
			debug: ractive.debug,
			message: 'noRegistryFunctionReturn',
			args: { registry: 'partial', name: name }
		});
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
			log.warn({
				debug: ractive.debug,
				message: 'noNestedPartials',
				args: { rname: name }
			});
		}

		// if fn, use instance to store result, otherwise needs to go
		// in the correct point in prototype chain on instance or constructor
		let target = fn ? instance : partials.findOwner( instance, name );

		// may be a template with partials, which need to be registered and main template extracted
		target.partials[ name ] = partial = parsed.t;
	}

	// store for reset
	if ( fn ) {
		partial._fn = fn;
	}

	return partial.v ? partial.t : partial;

}
