import { splitKeypath } from '../../shared/keypaths';

function badReference ( key ) {
	throw new Error( `An index or key reference (${key}) cannot have child properties` );
}

export default function resolveAmbiguousReference ( fragment, ref ) {
	const localViewmodel = fragment.findContext().root;
	const keys = splitKeypath( ref );
	const key = keys[0];

	let hasContextChain;
	let crossedComponentBoundary;
	let aliases;

	while ( fragment ) {
		// repeated fragments
		if ( fragment.isIteration ) {
			if ( key === fragment.parent.keyRef ) {
				if ( keys.length > 1 ) badReference( key );
				return fragment.context.getKeyModel();
			}

			if ( key === fragment.parent.indexRef ) {
				if ( keys.length > 1 ) badReference( key );
				return fragment.context.getIndexModel( fragment.index );
			}
		}

		// alias node or iteration
		if ( ( ( aliases = fragment.owner.aliases ) || ( aliases = fragment.aliases ) ) && aliases.hasOwnProperty( key ) ) {
			let model = aliases[ key ];

			if ( keys.length === 1 ) return model;
			else if ( typeof model.joinAll === 'function' ) {
				return model.joinAll( keys.slice( 1 ) );
			}
		}

		if ( fragment.context ) {
			// TODO better encapsulate the component check
			if ( !fragment.isRoot || fragment.ractive.component ) hasContextChain = true;

			if ( fragment.context.has( key ) ) {
				if ( crossedComponentBoundary ) {
					localViewmodel.map( key, fragment.context.joinKey( key ) );
				}

				return fragment.context.joinAll( keys );
			}
		}

		//if ( fragment.componentParent && !fragment.ractive.isolated ) {
		if ( ( fragment.componentParent || ( !fragment.parent && fragment.ractive.component ) ) && !fragment.ractive.isolated ) {
			// ascend through component boundary
			fragment = fragment.componentParent || fragment.ractive.component.parentFragment;
			crossedComponentBoundary = true;
		} else {
			fragment = fragment.parent;
		}
	}

	if ( !hasContextChain ) {
		return localViewmodel.joinAll( keys );
	}
}
