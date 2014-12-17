import { warn } from 'utils/log';

// TODO: deprecate in future release
var deprecations = {
	construct: {
		deprecated: 'beforeInit',
		replacement: 'onconstruct'
	},
	render: {
		deprecated: 'init',
		message: 'The "init" method has been deprecated ' +
			'and will likely be removed in a future release. ' +
			'You can either use the "oninit" method which will fire ' +
			'only once prior to, and regardless of, any eventual ractive ' +
			'instance being rendered, or if you need to access the ' +
			'rendered DOM, use "onrender" instead. ' +
			'See http://docs.ractivejs.org/latest/migrating for more information.'
	},
	complete: {
		deprecated: 'complete',
		replacement: 'oncomplete'
	}
};

function Hook ( event ) {
	this.event = event;
	this.method = 'on' + event;
	this.deprecate = deprecations[ event ];
}

Hook.prototype.fire = function ( ractive, arg ) {
	function call ( method ) {
		if ( ractive[ method ] ) {
			arg ? ractive[ method ]( arg ) : ractive[ method ]();
			return true;
		}
	}

	call( this.method );

	if ( !ractive[ this.method ] && this.deprecate && call( this.deprecate.deprecated ) ) {
		if ( this.deprecate.message ) {
			warn( this.deprecate.message );
		} else {
			warn( 'The method "%s" has been deprecated in favor of "%s" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.', this.deprecate.deprecated, this.deprecate.replacement );
		}
	}

	arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );
};

export default Hook;
