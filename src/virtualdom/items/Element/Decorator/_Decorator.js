import log from 'utils/log/log';
import circular from 'circular';
import config from 'config/config';

var Fragment, getValueOptions, Decorator;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { args: true };

Decorator = function ( element, template ) {
	var self = this, ractive, name, fragment;

	this.element = element;
	this.root = ractive = element.root;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template: name,
			root:     ractive,
			owner:    element
		});

		name = fragment.toString();
		fragment.unbind();

		if ( name === '' ) {
			// empty string okay, just no decorator
			return;
		}
	}

	if ( template.a ) {
		this.params = template.a;
	}

	else if ( template.d ) {
		this.fragment = new Fragment({
			template: template.d,
			root:     ractive,
			owner:    element
		});

		this.params = this.fragment.getValue( getValueOptions );

		this.fragment.bubble = function () {
			this.dirtyArgs = this.dirtyValue = true;
			self.params = this.getValue( getValueOptions );

			if ( self.ready ) {
				self.update();
			}
		};
	}

	this.fn = config.registries.decorators.find( ractive, name );

	if ( !this.fn ) {
		log.error({
			debug: ractive.debug,
			message: 'missingPlugin',
			args: {
				plugin: 'decorator',
				name: name
			}
		});
	}
};

Decorator.prototype = {
	init: function () {
		var node, result, args;

		node = this.element.node;

		if ( this.params ) {
			args = [ node ].concat( this.params );
			result = this.fn.apply( this.root, args );
		} else {
			result = this.fn.call( this.root, node );
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

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( this.fragment ) {
			this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	},

	teardown: function ( updating ) {
		this.torndown = true;
		if ( this.ready ) {
			this.actual.teardown();
		}

		if ( !updating && this.fragment ) {
			this.fragment.unbind();
		}
	}
};

export default Decorator;
