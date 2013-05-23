// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
utils.resolveRef = function ( root, ref, contextStack ) {

	var keys, lastKey, innerMostContext, contextKeys, parentValue, keypath;

	// Implicit iterators - i.e. {{.}} - are a special case
	if ( ref === '.' ) {
		return contextStack[ contextStack.length - 1 ];
	}

	keys = utils.splitKeypath( ref );
	lastKey = keys.pop();

	// Clone the context stack, so we don't mutate the original
	contextStack = contextStack.concat();

	// Take each context from the stack, working backwards from the innermost context
	while ( contextStack.length ) {

		innerMostContext = contextStack.pop();
		contextKeys = utils.splitKeypath( innerMostContext );

		parentValue = root.get( contextKeys.concat( keys ) );

		if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
			keypath = innerMostContext + '.' + ref;
			break;
		}
	}

	if ( !keypath && root.get( ref ) !== undefined ) {
		keypath = ref;
	}

	return keypath;
};



// utils.resolveRef = function ( root, mustache ) {

// 	var ref, contextStack, keys, lastKey, innerMostContext, contextKeys, parentValue, keypath;

// 	ref = mustache.descriptor.r;
// 	contextStack = mustache.contextStack;

// 	// Implicit iterators - i.e. {{.}} - are a special case
// 	if ( ref === '.' ) {
// 		keypath = contextStack[ contextStack.length - 1 ];
// 	}

// 	else {
// 		keys = utils.splitKeypath( ref );
// 		lastKey = keys.pop();

// 		// Clone the context stack, so we don't mutate the original
// 		contextStack = contextStack.concat();

// 		// Take each context from the stack, working backwards from the innermost context
// 		while ( contextStack.length ) {

// 			innerMostContext = contextStack.pop();
// 			contextKeys = utils.splitKeypath( innerMostContext );

// 			parentValue = root.get( contextKeys.concat( keys ) );

// 			if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
// 				keypath = innerMostContext + '.' + ref;
// 				break;
// 			}
// 		}

// 		if ( !keypath && root.get( ref ) !== undefined ) {
// 			keypath = ref;
// 		}
// 	}

// 	if ( keypath ) {
// 		mustache.keypath = keypath;
// 		mustache.keys = utils.splitKeypath( mustache.keypath );

// 		mustache.observerRefs = utils.observe( root, mustache );
// 		mustache.update( root.get( mustache.keypath ) );

// 		return true; // indicate success
// 	}

// 	return false; // failure
// };