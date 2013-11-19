define([
	'utils/warn',
	'render/StringFragment/_StringFragment'
], function (
	warn,
	StringFragment
) {
	
	'use strict';

	return function ( descriptor, root, owner, contextStack ) {

		var name, args, frag, fn, errorMessage;

		name = descriptor.n || descriptor;
		fn = root.decorators[ name ];

		if ( fn ) {
			
			if ( descriptor.a ) {
				args = descriptor.a;
			} else if ( descriptor.d ) {
				// TODO this is madness...
				frag = new StringFragment({
					descriptor:   descriptor.d,
					root:         root,
					owner:        owner,
					contextStack: contextStack
				});

				args = frag.toJSON();
				frag.teardown();
			}

			if ( args ) {
				args.unshift( owner.node );
				owner.decorator = fn.apply( root, args );
			} else {
				owner.decorator = fn.call( root, owner.node );
			}

			if ( !owner.decorator || !owner.decorator.teardown ) {
				throw new Error( 'Decorator definition must return an object with a teardown method' );
			}
		}

		else {
			errorMessage = 'Missing decorator "' + descriptor.o + '"';
			
			if ( root.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}
		}
	};

});