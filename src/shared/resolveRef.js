define( function () {

	'use strict';

	var ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';

	// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
	// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
	return function ( ractive, ref, contextStack ) {

		var keypath, keys, lastKey, contextKeys, innerMostContext, postfix, parentKeypath, parentValue, wrapped, context;

		// Implicit iterators - i.e. {{.}} - are a special case
		if ( ref === '.' ) {
			if ( !contextStack.length ) {
				return '';
			}

			keypath = contextStack[ contextStack.length - 1 ];
		}

		// If a reference begins with '.', it's either a restricted reference or
		// an ancestor reference...
		else if ( ref.charAt( 0 ) === '.' ) {

			// ...either way we need to get the innermost context
			context = contextStack[ contextStack.length - 1 ];
			contextKeys = context ? context.split( '.' ) : [];

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
				keypath = contextKeys.join( '.' );
			}

			// not an ancestor reference - must be a restricted reference (prepended with ".")
			else if ( !context ) {
				keypath = ref.substring( 1 );
			}

			else {
				keypath = context + ref;
			}
		}

		else {
			keys = ref.split( '.' );
			lastKey = keys.pop();
			postfix = keys.length ? '.' + keys.join( '.' ) : '';

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMostContext = contextStack.pop();
				parentKeypath = innerMostContext + postfix;

				parentValue = ractive.get( parentKeypath );

				if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
					parentValue = wrapped.get();
				}

				if ( typeof parentValue === 'object' && parentValue !== null && parentValue[ lastKey ] !== undefined ) {
					keypath = innerMostContext + '.' + ref;
					break;
				}
			}

			// Still no keypath?
			if ( !keypath ) {
				// We need both of these - the first enables components to treat data contexts
				// like lexical scopes in JavaScript functions...
				if ( ractive.data.hasOwnProperty( ref ) ) {
					keypath = ref;
				}

				// while the second deals with references like `foo.bar`
				else if ( ractive.get( ref ) !== undefined ) {
					keypath = ref;
				}
			}
		}

		return keypath ? keypath.replace( /^\./, '' ) : keypath;
	};

});