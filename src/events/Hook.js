import { warnIfDebug } from '../utils/log';

// TODO: deprecate in future release
const deprecations = {
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

export default class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
		this.deprecate = deprecations[ event ];
	}

	call ( method, ractive, arg ) {
		if ( ractive[ method ] ) {
			arg ? ractive[ method ]( arg ) : ractive[ method ]();
			return true;
		}
	}

	fire ( ractive, arg ) {
		this.call( this.method, ractive, arg );

		// handle deprecations
		if ( !ractive[ this.method ] && this.deprecate && this.call( this.deprecate.deprecated, ractive, arg ) ) {
			if ( this.deprecate.message ) {
				warnIfDebug( this.deprecate.message );
			} else {
				warnIfDebug( 'The method "%s" has been deprecated in favor of "%s" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.', this.deprecate.deprecated, this.deprecate.replacement );
			}
		}

		// TODO should probably use internal method, in case ractive.fire was overwritten
		arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );
	}
}
