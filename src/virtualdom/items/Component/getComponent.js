import log from 'utils/log/log';
import { findInstance } from 'shared/registry';

// finds the component constructor in the registry or view hierarchy registries

export default function getComponent ( ractive, name ) {

	var Component, instance = findInstance( 'components', ractive, name );

	if ( instance ) {
		Component = instance.components[ name ];

		// best test we have for not Ractive.extend
		if ( !Component._Parent ) {
			// function option, execute and store for reset
			let fn = Component.bind( instance );
			fn.isOwner = instance.components.hasOwnProperty( name );
			Component = fn( instance.data );

			if ( !Component ) {
				log.warn({
					debug: ractive.debug,
					message: 'noRegistryFunctionReturn',
					args: { registry: 'component', name: name }
				});
				return;
			}

			if ( typeof Component === 'string' ) {
				//allow string lookup
				Component = getComponent ( ractive, Component );
			}

			Component._fn = fn;
			instance.components[ name ] = Component;
		}
	}

	return Component;
}
