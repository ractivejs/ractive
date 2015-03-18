export default function Viewmodel$map ( key, options ) {
	var mapping = this.mappings[ key.str ] = new Mapping( key, options );
	mapping.initViewmodel( this );
	return mapping;
}

var Mapping = function ( localKey, options ) {
	this.localKey = localKey;
	this.keypath = options.keypath;
	this.origin = options.origin;

	this.deps = [];
	this.unresolved = [];

	this.resolved = false;
};

Mapping.prototype = {
	forceResolution () {
		// TODO warn, as per #1692?
		this.keypath = this.localKey;
		this.setup();
	},

	get ( keypath, options ) {
		if ( !this.resolved ) {
			return undefined;
		}
		return this.origin.get( this.map( keypath ), options );
	},

	getValue () {
		if ( !this.keypath ) {
			return undefined;
		}
		return this.origin.get( this.keypath );
	},

	initViewmodel ( viewmodel ) {
		this.local = viewmodel;
		this.setup();
	},

	map ( keypath ) {
    		if( typeof this.keypath === undefined ) {
    			return this.localKey;
    		}
    		return keypath.replace( this.localKey, this.keypath );
	},

	register ( keypath, dependant, group ) {
		this.deps.push({ keypath: keypath, dep: dependant, group: group });

		if ( this.resolved ) {
			this.origin.register( this.map( keypath ), dependant, group );
		}
	},

	resolve ( keypath ) {
		if ( this.keypath !== undefined ) {
			this.unbind( true );
		}

		this.keypath = keypath;
		this.setup();
	},

	set ( keypath, value ) {
		if ( !this.resolved ) {
			this.forceResolution();
		}

		this.origin.set( this.map( keypath ), value );
	},

	setup () {
		if ( this.keypath === undefined ) {
			return;
		}

		this.resolved = true;

		// accumulated dependants can now be registered
		if ( this.deps.length ) {
			this.deps.forEach( d => {
				var keypath = this.map( d.keypath );
				this.origin.register( keypath, d.dep, d.group );

				// TODO this is a bit of a red flag... all deps should be the same?
				if ( d.dep.setValue ) {
					d.dep.setValue( this.origin.get( keypath ) );
				} else if ( d.dep.invalidate ) {
					d.dep.invalidate();
				} else {
					throw new Error( 'An unexpected error occurred. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
				}
			});

			this.origin.mark( this.keypath );
		}
	},

	setValue ( value ) {
		if ( !this.keypath ) {
			throw new Error( 'Mapping does not have keypath, cannot set value. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.keypath, value );
	},

	unbind ( keepLocal ) {
		if ( !keepLocal ) {
			delete this.local.mappings[ this.localKey ];
		}

		if( !this.resolved ) {
			return;
		}

		this.deps.forEach( d => {
			this.origin.unregister( this.map( d.keypath ), d.dep, d.group );
		});

		if ( this.tracker ) {
			this.origin.unregister( this.keypath, this.tracker );
		}
	},

	unregister ( keypath, dependant, group ) {
		var deps, i;

		if( !this.resolved ) {
			return;
		}

		deps = this.deps;
		i = deps.length;

		while ( i-- ) {
			if ( deps[i].dep === dependant ) {
				deps.splice( i, 1 );
				break;
			}
		}
		this.origin.unregister( this.map( keypath ), dependant, group );
	}
};
