import { normalise } from 'shared/keypaths';
import getInnerContext from 'shared/getInnerContext';

export default function resolveRef ( ractive, ref, fragment ) {
	var keypath;

	ref = normalise( ref );

	// If a reference begins '~/', it's a top-level reference
	if ( ref.substr( 0, 2 ) === '~/' ) {
		keypath = ractive.viewmodel.getKeypath( ref.substring( 2 ) );

		// createMappingIfNecessary( ractive, keypath.firstKey, fragment );
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	else if ( ref[0] === '.' ) {
		keypath = resolveAncestorRef( getInnerContext( fragment ), ref );

		// if ( keypath ) {
		// 	createMappingIfNecessary( ractive, keypath.firstKey, fragment );
		// }
	}

	// ...otherwise we need to figure out the keypath based on context
	else {
		keypath = resolveAmbiguousReference( ractive, ref, fragment );
	}

	return keypath;
}

function resolveAncestorRef ( baseContext, ref ) {

	// the way KeypathExpression are currently handled, context can
	// be null because there's no corresponding keypath
	// really it doesn't work because context might be above that and not the root
	//
	// When we have Dedicated Keypath for those,
	// should iron that out
	if( !baseContext ) { return; }

	// {{.}} means 'current context'
    if ( ref === '.' ) { return baseContext; }

	// ancestor references (starting "../") go up the tree
	if ( ref.substr( 0, 3 ) === '../' ) {

		while ( ref.substr( 0, 3 ) === '../' ) {
			if ( baseContext.isRoot ) {
				throw new Error( 'Could not resolve reference - too many "../" prefixes' );
			}

			baseContext = baseContext.parent;
			ref = ref.substring( 3 );
		}

        return baseContext.join( ref );
    }

	// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
	return baseContext.join( ref );
}

function resolveAmbiguousReference ( ractive, ref /* string */, fragment, isParentLookup ) {
	var context,
		key,
		parentValue,
		hasContextChain,
		parentKeypath;



	if ( !ref ) {
		return ractive.viewmodel.rootKeypath;
	}

	// temp until figure out
	key = ref.split( '.' )[0];

	while ( fragment ) {
		context = fragment.context;
		fragment = fragment.parent;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;

		// parentValue = ractive.viewmodel.get( context );
		// revist when mapped keypaths are ready
		parentValue = context.get();

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context.join( ref );
		}
	}

	if ( isRootProperty( ractive.viewmodel, key ) ) {
		return ractive.viewmodel.getKeypath( ref );
	}

	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive.parent && !ractive.isolated ) {
		hasContextChain = true;
		fragment = ractive.component.parentFragment;

		if ( parentKeypath = resolveAmbiguousReference( ractive.parent, key, fragment, true ) ) {

			ractive.viewmodel.keypathCache[ key ] = parentKeypath;

			// // We need to create an inter-component binding
			// ractive.viewmodel.map( ractive.viewmodel.getKeypath( key ), {
			// 	origin: ractive.parent.viewmodel,
			// 	keypath: parentKeypath
			// });

			return ractive.viewmodel.getKeypath( ref );
		}
	}

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the reference
	if ( !isParentLookup && !hasContextChain ) {
		// the data object needs to have a property by this name,
		// to prevent future failed lookups
		ref = ractive.viewmodel.getKeypath( ref );
		ractive.viewmodel.set( ref, undefined );
		return ref;
	}
}

// function createMappingIfNecessary ( ractive, key ) {
// 	var parentKeypath;

// 	if ( !ractive.parent || ractive.isolated || isRootProperty( ractive.viewmodel, key ) ) {
// 		return;
// 	}

// 	key = ractive.parent.viewmodel.getKeypath( key );

// 	if ( parentKeypath = resolveAmbiguousReference( ractive.parent, key, ractive.component.parentFragment, true ) ) {
// 		ractive.viewmodel.map( key, {
// 			origin: ractive.parent.viewmodel,
// 			keypath: parentKeypath
// 		});
// 	}
// }

function isRootProperty ( viewmodel, key ) {
	// special case for reference to root
	return key === ''
		|| viewmodel.hasKeypath( key )
		|| viewmodel.rootKeypath.hasChild( key );

		// || ( viewmodel.hasKeypath( key ) && !!viewmodel.getKeypath( key ).computation )
		// || key in viewmodel.mappings;
}
