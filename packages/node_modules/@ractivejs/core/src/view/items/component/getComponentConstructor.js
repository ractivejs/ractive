import { noRegistryFunctionReturn } from '../../../config/errors';
import { warnIfDebug } from '../../../utils/log';
import { findInstance } from '../../../shared/registry';

// finds the component constructor in the registry or view hierarchy registries
export default function getComponentConstructor ( ractive, name ) {
	const instance = findInstance( 'components', ractive, name );
	let Component;

	if ( instance ) {
		Component = instance.components[ name ];

		// best test we have for not Ractive.extend
		if ( Component && !Component.Parent ) {
			// function option, execute and store for reset
			const fn = Component.bind( instance );
			fn.isOwner = instance.components.hasOwnProperty( name );
			Component = fn();

			if ( !Component ) {
				warnIfDebug( noRegistryFunctionReturn, name, 'component', 'component', { ractive });
				return;
			}

			if ( typeof Component === 'string' ) {
				// allow string lookup
				Component = getComponentConstructor( ractive, Component );
			}

			Component._fn = fn;
			instance.components[ name ] = Component;
		}
	}

	return Component;
}
