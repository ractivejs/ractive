define([
	'utils/warn',
	'render/StringFragment/_StringFragment'
], function (
	warn,
	StringFragment
) {

	'use strict';

	var Decorator = function ( descriptor, root, owner, contextStack ) {
		var name, fragment, errorMessage;

		this.root = root;
		this.node = owner.node;

		name = descriptor.n || descriptor;

		if ( typeof name !== 'string' ) {
			fragment = new StringFragment({
				descriptor:   name,
				root:         this.root,
				owner:        owner,
				contextStack: contextStack
			});

			name = fragment.toString();
			fragment.teardown();
		}

		if ( descriptor.a ) {
			this.params = descriptor.a;
		}

		else if ( descriptor.d ) {
			fragment = new StringFragment({
				descriptor:   descriptor.d,
				root:         this.root,
				owner:        owner,
				contextStack: contextStack
			});

			this.params = fragment.toArgsList();
			fragment.teardown();
		}

		this.fn = root.decorators[ name ];

		if ( !this.fn ) {
			errorMessage = 'Missing "' + name + '" decorator. You may need to download a plugin via https://github.com/RactiveJS/Ractive/wiki/Plugins#decorators';

			if ( root.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}
		}
	};

	Decorator.prototype = {
		init: function () {
			var result, args;

			if ( this.params ) {
				args = [ this.node ].concat( this.params );
				result = this.fn.apply( this.root, args );
			} else {
				result = this.fn.call( this.root, this.node );
			}

			if ( !result || !result.teardown ) {
				throw new Error( 'Decorator definition must return an object with a teardown method' );
			}

			// TODO does this make sense?
			this.teardown = result.teardown;
		}
	};

	return Decorator;

});
