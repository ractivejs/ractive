import config from 'config/config';
import log from 'utils/log';
import circular from 'circular';

var Ractive;
circular.push( function () {
	Ractive = circular.Ractive;
});

// finds the component constructor in the registry or view hierarchy registries

export default function getComponent ( ractive, name ) {

	var component, instance = config.registries.components.findInstance( ractive, name );

	if ( instance ) {
		component = instance.components[ name ];

		// best test we have for not Ractive.extend
		if ( !component._parent ) {
			// function option, execute and store for reset
			let fn = component.bind( instance );
			fn.isOwner = instance.components.hasOwnProperty( name );
			component = fn( instance.data );

			if ( !component ) {
				log.warn({
					debug: ractive.debug,
					message: 'noRegistryFunctionReturn',
					args: { registry: 'component', name: name }
				});
				return;
			}

			if ( typeof component === 'string' ) {
				//allow string lookup
				component = getComponent ( ractive, component );
			}

			component._fn = fn;
			instance.components[ name ] = component;
		}
	}

	return component;
}
