import normaliseRef from 'utils/normaliseRef';
import getInnerContext from 'shared/getInnerContext';
import resolveAncestorRef from 'shared/resolveAncestorRef';

export default function resolveRef ( ractive, ref, fragment, isParentLookup ) {
	var restricted,
		context,
		key,
		keypath,
		parentValue,
		hasContextChain,
		parentKeys,
		childKeys,
		parentKeypath,
		childKeypath;

	ref = normaliseRef( ref );

	// If a reference begins '~/', it's a top-level reference
	if ( ref.substr( 0, 2 ) === '~/' ) {
		ref = ref.substring( 2 );
		restricted = true;
		//return ref;
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	else if ( ref.charAt( 0 ) === '.' ) {
		ref = resolveAncestorRef( getInnerContext( fragment ), ref );
		restricted = true;
		//return ref;
	}

	if ( ref === null ) {
		return ref;
	}

	if ( restricted && rootProperty( ractive, ref.split( '.' )[0] ) ) {
		return ref;
	}

	// ...otherwise we need to find the keypath
	key = ref.split( '.' )[0];

	while ( fragment ) {
		context = fragment.context;
		fragment = fragment.parent;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;
		parentValue = ractive.viewmodel.get( context );

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context + '.' + ref;
		}
	}

	// Root/computed/mapped property?
	if ( rootProperty( ractive, key ) ) {
		return ref;
	}

	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive.parent && !ractive.isolated ) {
		hasContextChain = true;
		fragment = ractive.component.parentFragment;

		keypath = resolveRef( ractive.parent, ref, fragment, true );

		if ( keypath ) {
			// We need to create an inter-component binding

			// If parent keypath is 'one.foo' and child is 'two.foo', we bind
			// 'one' to 'two' as it's more efficient and avoids edge cases
			parentKeys = keypath.split( '.' );
			childKeys = ref.split( '.' );

			while ( parentKeys.length > 1 && childKeys.length > 1 && parentKeys[ parentKeys.length - 1 ] === childKeys[ childKeys.length - 1 ] ) {
				parentKeys.pop();
				childKeys.pop();
			}

			parentKeypath = parentKeys.join( '.' );
			childKeypath = childKeys.join( '.' );

			// TODO trace back to origin
			ractive.viewmodel.map( childKeypath, {
				origin: ractive.parent.viewmodel,
				keypath: parentKeypath
			});

			return ref;
		}
	}

	if ( restricted ) {
		return ref;
	}

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the reference
	if ( !isParentLookup && !hasContextChain ) {
		// the data object needs to have a property by this name,
		// to prevent future failed lookups
		ractive.viewmodel.set( ref, undefined );
		return ref;
	}

	if ( restricted || ractive.viewmodel.get( ref ) !== undefined ) {
		return ref;
	}
}

function rootProperty ( ractive, key ) {
	return key in ractive.data || key in ractive.viewmodel.computations || key in ractive.viewmodel.mappings;
}
