import { normalise } from 'shared/keypaths';
import getInnerContext from 'shared/getInnerContext';

export default function resolveRef ( ractive, ref, fragment, noUnresolved ) {
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
		keypath = resolveAmbiguousReference( ractive, ref, fragment, false, noUnresolved );
	}

	if ( keypath && noUnresolved && keypath.unresolved ) {
		return;
	}

	return keypath;
}

function resolveAncestorRef ( baseContext, ref ) {

	// the way KeypathExpression are currently handled, context can
	// be null because there's no corresponding keypath.
	// But now it really it doesn't work because context might be above that and not the root
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

function resolveAmbiguousReference ( ractive, ref /* string */, fragment, isParentLookup, noUnresolved ) {
	var context,
		keys,
		key,
		parentValue,
		hasContextChain,
		parentKeypath,
		keypath,
		viewmodel = ractive.viewmodel;



	if ( !ref ) {
		return viewmodel.rootKeypath;
	}

	// temp until figure out bcuz logic already in keypath
	keys = ref.split( '.' ),
	key = keys.shift();

	while ( fragment ) {
		context = fragment.context;
		fragment = fragment.parent;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;

		if ( viewmodel.hasKeypath( context.str + '.' + ref ) ) {
			return viewmodel.getKeypath( context.str + '.' + ref );
		}

		// parentValue = ractive.viewmodel.get( context );
		// revist when mapped keypaths are ready
		parentValue = context.get();

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context.join( ref );
		}
	}

	// this block is some core logic about finding keypaths amongst existing
	// keypath trees and viewmodels
	if ( key === '' ) {
		return viewmodel.rootKeypath;
	}
	else if ( viewmodel.hasKeypath( ref ) && ( keypath = viewmodel.getKeypath( ref ) ) && ( !noUnresolved || !keypath.unresolved ) ) {
		return keypath;
	}
	// is first key in this viewmodel?
	else if ( viewmodel.hasKeypath( key ) && ( keypath = viewmodel.getKeypath( key ) ) && ( !noUnresolved || !keypath.unresolved )  ) {
		parentKeypath = viewmodel.getKeypath( key );

		// parent lives in same viewmodel, join to it to get the new keypath
		if ( parentKeypath.owner === viewmodel ) {
			keypath = parentKeypath.join( keys.join( '.' ) );
		}
		else {
			// this keypath already exists as a child over in the other viewmodel
			if ( parentKeypath.owner.hasKeypath( ref ) ) {
				keypath = parentKeypath.owner.getKeypath( ref );
			}
			// doesn't exist yet, just join to create it
			else {
				keypath = parentKeypath.join( keys.join( '.' ) );
			}

			// store a lookup in "this" viewmodel to the new keypath
			viewmodel.keypathCache[ ref ] = keypath;
		}

		return keypath;
	}
	else if ( viewmodel.rootKeypath.hasChild( key ) ) {
		// just hasn't been fetched yet
		return ractive.viewmodel.getKeypath( ref );
	}


	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive.parent && !ractive.isolated ) {
		hasContextChain = true;
		fragment = ractive.component.parentFragment;

		if ( parentKeypath = resolveAmbiguousReference( ractive.parent, key, fragment, true, noUnresolved ) ) {

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

}
