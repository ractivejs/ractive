define([
	'circular',
	'utils/normaliseKeypath',
	'utils/hasOwnProperty',
	'shared/getInnerContext'
], function (
	circular,
	normaliseKeypath,
	hasOwnProperty,
	getInnerContext
) {

	'use strict';

	var get, ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';

	circular.push( function () {
		get = circular.get;
	});

	return function resolveRef ( ractive, ref, fragment ) {
		var context, contextKeys, keys, lastKey, postfix, parentKeypath, parentValue, wrapped;

		ref = normaliseKeypath( ref );

		// Implicit iterators - i.e. {{.}} - are a special case
		if ( ref === '.' ) {
			return getInnerContext( fragment );
		}

		// If a reference begins with '.', it's either a restricted reference or
		// an ancestor reference...
		if ( ref.charAt( 0 ) === '.' ) {

			// ...either way we need to get the innermost context
			context = getInnerContext( fragment );
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
				return contextKeys.join( '.' );
			}

			// not an ancestor reference - must be a restricted reference (prepended with ".")
			if ( !context ) {
				return ref.substring( 1 );
			}

			return context + ref;
		}

		// Now we need to try and resolve the reference against any
		// contexts set by parent list/object sections
		keys = ref.split( '.' );
		lastKey = keys.pop();
		postfix = keys.length ? '.' + keys.join( '.' ) : '';

		do {
			context = fragment.context;

			if ( !context ) {
				continue;
			}

			parentKeypath = context + postfix;
			parentValue = get( ractive, parentKeypath );

			if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
				parentValue = wrapped.get();
			}

			if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && lastKey in parentValue ) {
				return context + '.' + ref;
			}
		} while ( fragment = fragment.parent );


		// Still no keypath?

		// We need both of these - the first enables components to treat data contexts
		// like lexical scopes in JavaScript functions...
		if ( hasOwnProperty.call( ractive.data, ref ) ) {
			return ref;
		}

		// while the second deals with references like `foo.bar`
		else if ( get( ractive, ref ) !== undefined ) {
			return ref;
		}
	};

});
