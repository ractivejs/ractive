import normaliseRef from 'utils/normaliseRef';
import getInnerContext from 'shared/getInnerContext';
import createComponentBinding from 'shared/createComponentBinding';

var ancestorErrorMessage, getOptions;

ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';

getOptions = { evaluateWrapped: true };

export default function resolveRef ( ractive, ref, fragment ) {
	var context,
		key,
		index,
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
		return ref.substring( 2 );
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	if ( ref.charAt( 0 ) === '.' ) {
		return resolveAncestorReference( getInnerContext( fragment ), ref );
	}

	// ...otherwise we need to find the keypath
	key = ref.split( '.' )[0];

	do {
		context = fragment.context;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;
		parentValue = ractive.viewmodel.get( context, getOptions );

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context + '.' + ref;
		}
	} while ( fragment = fragment.parent );

	// Root/computed property?
	if ( key in ractive.data || key in ractive.viewmodel.computations ) {
		return ref;
	}

	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive._parent && !ractive.isolated ) {
		fragment = ractive.component.parentFragment;

		// Special case - index refs
		if ( fragment.indexRefs && ( index = fragment.indexRefs[ ref ] ) !== undefined ) {
			// Create an index ref binding, so that it can be rebound letter if necessary.
			// It doesn't have an alias since it's an implicit binding, hence `...[ ref ] = ref`
			ractive.component.indexRefBindings[ ref ] = ref;
			ractive.viewmodel.set( ref, index, true );
			return;
		}

		keypath = resolveRef( ractive._parent, ref, fragment );

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

			ractive.viewmodel.set( childKeypath, ractive._parent.viewmodel.get( parentKeypath ), true );
			createComponentBinding( ractive.component, ractive._parent, parentKeypath, childKeypath );

			return ref;
		}
	}

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the reference
	if ( !hasContextChain ) {
		return ref;
	}

	if ( ractive.viewmodel.get( ref ) !== undefined ) {
		return ref;
	}
}

function resolveAncestorReference ( baseContext, ref ) {
	var contextKeys;

	// {{.}} means 'current context'
	if ( ref === '.' ) return baseContext;

	contextKeys = baseContext ? baseContext.split( '.' ) : [];

	// ancestor references (starting "../") go up the tree
	if ( ref.substr( 0, 3 ) === '../' ) {
		while ( ref.substr( 0, 3 ) === '../' ) {
			if ( !contextKeys.length ) {
				throw new Error( ancestorErrorMessage );
			}

			contextKeys.pop();
			ref = ref.substring( 3 );
		}

		contextKeys.push( ref );
		return contextKeys.join( '.' );
	}

	// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
	if ( !baseContext ) {
		return ref.replace( /^\.\/?/, '' );
	}

	return baseContext + ref.replace( /^\.\//, '.' );
}
