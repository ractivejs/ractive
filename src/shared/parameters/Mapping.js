import DataTracker from './DataTracker';
import { isFunction } from 'utils/is';

function Mapping ( localKey, options ) {
	this.localKey = localKey;
	this.keypath = options.keypath;
	this.origin = options.origin;

	if ( options.force ) {
		this.force = options.force;
	}

	this.deps = [];
	this.unresolved = [];

	this.trackData = options.trackData;
	this.resolved = false;
}

export default Mapping;

Mapping.prototype = {
	ensureKeypath () {
		if ( !this.keypath ) {
			if ( isFunction( this.force ) ) {
				this.force();
			}

			if ( !this.keypath ) {
				throw new Error( 'Mapping "' + this.localKey.str + '" on component "' + this.local.ractive.component.name + '" does not have a keypath. This is usually caused by an ambiguous complex reference, which can usually be fixed by scoping your references.' );
			}
		}
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
		this.ensureKeypath();
		this.origin.set( this.map( keypath ), value );
	},

	setup () {
		if ( this.keypath === undefined ) {
			return;
		}

		this.resolved = true;

		// keep local data in sync, for browsers w/ no defineProperty
		if ( this.trackData ) {
			this.tracker = new DataTracker( this.localKey, this.local );
			this.origin.register( this.keypath, this.tracker );
		}

		// accumulated dependants can now be registered
		if ( this.deps.length ) {
			this.deps.forEach( d => {
				var keypath = this.map( d.keypath );
				this.origin.register( keypath, d.dep, d.group );

				// if the dep has a setter, it's a reference, otherwise, a computation
				if ( isFunction( d.dep.setValue ) ) {
					d.dep.setValue( this.origin.get( keypath ) );
				} else {
					// computations have no setter, get it to recompute via viewmodel
					this.local.mark( d.dep.key );
				}
			});

			this.origin.mark( this.keypath );
		}
	},

	setValue ( value ) {
		this.ensureKeypath();
		this.origin.set( this.keypath, value );
	},

	unbind ( keepLocal ) {
		if ( !keepLocal ) {
			delete this.local.mappings[ this.localKey ];
		}

		this.deps.forEach( d => {
			this.origin.unregister( this.map( d.keypath ), d.dep, d.group );
		});

		if ( this.tracker ) {
			this.origin.unregister( this.keypath, this.tracker );
		}
	},

	unregister ( keypath, dependant, group ) {
		var deps = this.deps, i = deps.length;

		while ( i-- ) {
			if ( deps[i].dep === dependant ) {
				deps.splice( i, 1 );
				break;
			}
		}
		this.origin.unregister( this.map( keypath ), dependant, group );
	}
};
