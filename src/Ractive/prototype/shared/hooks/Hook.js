import { warnIfDebug } from '../../../../utils/log';

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

	fire ( ractive, arg ) {
		function call ( method ) {
			if ( ractive[ method ] ) {
				try {
          arg ? ractive[ method ]( arg ) : ractive[ method ]();
        } catch (e) {
          ractive.fire('error', e);
          console.error(e);
        };
				return true;
			}
		}

		call( this.method );

		if ( !ractive[ this.method ] && this.deprecate && call( this.deprecate.deprecated ) ) {
			if ( this.deprecate.message ) {
				warnIfDebug( this.deprecate.message );
			} else {
				warnIfDebug( 'The method "%s" has been deprecated in favor of "%s" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.', this.deprecate.deprecated, this.deprecate.replacement );
			}
		}

		arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );
	}
}
