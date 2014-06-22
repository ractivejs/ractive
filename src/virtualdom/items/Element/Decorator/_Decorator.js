import log from 'utils/log';
import circular from 'circular';
import config from 'config/config';

var Fragment, getValueOptions, Decorator;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { args: true };

Decorator = function ( element, template ) {
	var decorator = this, ractive, name, fragment;

	decorator.element = element;
	decorator.root = ractive = element.root;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template: name,
			root:     ractive,
			owner:    element
		});

		name = fragment.toString();
		fragment.unbind();
	}

	if ( template.a ) {
		decorator.params = template.a;
	}

	else if ( template.d ) {
		decorator.fragment = new Fragment({
			template: template.d,
			root:     ractive,
			owner:    element
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

	decorator.fn = config.registries.decorators.find( ractive, name );

	if ( !decorator.fn ) {

		log.error({
			debug: ractive.debug,
			message: 'missingPlugin',
			args: {
				plugin: 'decorator',
				name: name
			}
		})
	}
};

Decorator.prototype = {
	init: function () {
		var decorator = this, node, result, args;

		node = decorator.element.node;

		if ( decorator.params ) {
			args = [ node ].concat( decorator.params );
			result = decorator.fn.apply( decorator.root, args );
		} else {
			result = decorator.fn.call( decorator.root, node );
		}

		if ( !result || !result.teardown ) {
			throw new Error( 'Decorator definition must return an object with a teardown method' );
		}

		// TODO does this make sense?
		decorator.actual = result;
		decorator.ready = true;
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
			this.fragment.unbind();
		}
	}
};

export default Decorator;
