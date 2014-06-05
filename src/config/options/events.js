import registry from 'config/options/registry';
import warn from 'utils/warn';

var config = registry( {
	name: 'events',
	preInit: deprecate,
	postInit: deprecate
});

var message = 'ractive.eventDefinitions has been deprecated in favour of ractive.events. ';

function deprecate ( target, options ) {

	// TODO remove support
	if ( options.eventDefinitions ) {

		if( !options.events ) {

			warn( message + ' Support will be removed in future versions.' );
			options.events = options.eventDefinitions;

		}
		else {

			throw new Error( message + ' You cannot specify both options, please use ractive.events.'  );

		}

	}
}

export default config;
