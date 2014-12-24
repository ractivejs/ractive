import { noRegistryFunctionReturn } from 'config/errors';
import { warn } from 'utils/log';
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
				if ( ractive.debug ) {
					warn( noRegistryFunctionReturn, name, 'component', 'component' );
				}

				return;
			}

			if ( typeof Component === 'string' ) {
				// allow string lookup
				Component = getComponent ( ractive, Component );
			}

			Component._fn = fn;
			instance.components[ name ] = Component;
		}
	}

	return Component;
}
