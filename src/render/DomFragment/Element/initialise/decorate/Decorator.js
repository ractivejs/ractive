define([
	'utils/warn',
	'render/StringFragment/_StringFragment'
], function (
	warn,
	StringFragment
) {

	'use strict';

	var Decorator = function ( descriptor, root, owner, contextStack ) {
		var fragment, errorMessage;

		this.root = root;
		this.node = owner.node;

		if ( typeof descriptor === 'string' ) {
			this.name = descriptor;
		} else {
			this.name = descriptor.n;

			if ( descriptor.a ) {
				this._params = descriptor.a;
			} else if ( descriptor.d ) {
				// TODO is there a way to interpret dynamic arguments without all the
				// 'dependency thrashing'?
				fragment = new StringFragment({
					descriptor:   descriptor.d,
					root:         root,
					owner:        owner,
					contextStack: contextStack
				});

				this._params = fragment.toJSON();
				fragment.teardown();
			}
		}

		this._fn = root.decorators[ this.name ];

		if ( !this._fn ) {
			errorMessage = 'Missing "' + descriptor.o + '" decorator. You may need to download a plugin via https://github.com/RactiveJS/Ractive/wiki/Plugins#decorators';

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

			if ( this._params ) {
				args = [ this.node ].concat( this._params );
				result = this._fn.apply( this.root, args );
			} else {
				result = this._fn.call( this.root, this.node );
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