import warn from 'utils/warn';
import circular from 'circular';

var Fragment, getValueOptions, Decorator;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { args: true };

Decorator = function ( template, ractive, owner ) {
	var decorator = this, name, fragment, errorMessage;

	decorator.root = ractive;
	decorator.node = owner.node;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template:   name,
			root:         ractive,
			owner:        owner
		});

		name = fragment.toString();
		fragment.teardown();
	}

	if ( template.a ) {
		decorator.params = template.a;
	}

	else if ( template.d ) {
		decorator.fragment = new Fragment({
			template:   template.d,
			root:         ractive,
			owner:        owner
		});

		decorator.params = decorator.fragment.getValue( getValueOptions );

		decorator.fragment.bubble = function () {
			this.dirtyArgs = this.dirtyValue = true;
			decorator.params = this.getValue( getValueOptions );

			if ( decorator.ready ) {
				decorator.update();
			}
		};
	}

	decorator.fn = ractive.decorators[ name ];

	if ( !decorator.fn ) {
		errorMessage = 'Missing "' + name + '" decorator. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#decorators';

		if ( ractive.debug ) {
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
		this.actual = result;
		this.ready = true;
	},

	update: function () {
		if ( this.actual.update ) {
			this.actual.update.apply( this.root, this.params );
		}

		else {
			this.actual.teardown( true );
			this.init();
		}
	},

	teardown: function ( updating ) {
		this.actual.teardown();

		if ( !updating && this.fragment ) {
			this.fragment.teardown();
		}
	}
};

export default Decorator;
