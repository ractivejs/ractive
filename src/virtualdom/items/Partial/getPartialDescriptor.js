import warn from 'utils/warn';
import config from 'config/config';
import parser from 'config/options/template/parser';
import deIndent from 'virtualdom/items/Partial/deIndent';

export default function getPartialDescriptor ( ractive, name ) {
	var partial, errorMessage;

	// If the partial was specified on this instance, great
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
		return ractive.partials[ name ] = config.template.processCompound( ractive, parsed );

	}

	// No match? Return an empty array
	errorMessage = 'Could not find template for partial "' + name + '"';

	if ( ractive.isDebug() ) {
		throw new Error( errorMessage );
	} else {
		warn( errorMessage );
	}

	return [];

}

function getPartialFromRegistry ( ractive, name ) {

	// get the ractive instance on which the partial is found
	var instance = config.registries.partials.findInstance( ractive, name );

	if ( instance ) {

		let partial = instance.partials[ name ];

		// If this was added manually to the registry,
		// but hasn't been parsed, parse it now
		if ( !parser.isParsed( partial ) ) {

			// use the parseOptions of the ractive instance
			// on which it was found
			partial = parser.parse( partial, parser.getParseOptions( instance ) );

			// may be a template with partials, which need to
			// be registered and main template extracted
			instance.partials[ name ] = partial = config.template.processCompound( instance, partial );
		}

		return partial;
	}
}
