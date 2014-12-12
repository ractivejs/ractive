import DataTracker from './DataTracker';

function Mapping ( localKey, options ) {
	this.localKey = localKey;
	this.keypath = options.keypath;
	this.origin = options.origin;

	this.trackData = options.trackData;
	this.resolved = false;
}

export default Mapping;

Mapping.prototype = {

	get: function ( keypath, options ) {
		if ( !this.resolved ) {
			return undefined;
		}
		return this.origin.get( this.map( keypath ), options );
	},

	getValue: function () {
		if ( !this.keypath ) {
			return undefined;
		}
		return this.origin.get( this.keypath );
	},

	initViewmodel: function ( viewmodel ){
		this.local = viewmodel;
		this.deps = [];
		this.local.mappings[ this.localKey ] = this;
		this.setup();
	},

	map: function ( keypath ) {
		return keypath.replace( this.localKey, this.keypath );
	},

	register: function ( keypath, dependant, group ) {
		this.deps.push({ keypath: keypath, dep: dependant, group: group });
		this.origin.register( this.map( keypath ), dependant, group );
	},

	resolve: function ( keypath ) {

		if ( this.keypath !== undefined ) {
			this.unbind( true );
		}

		this.keypath = keypath;
		this.setup();
	},

	set: function ( keypath, value ) {
		// TODO: force resolution
		if ( !this.resolved ) {
			throw new Error( 'Something very odd happened. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.map( keypath ), value );
	},

	setup: function () {
		if ( this.keypath === undefined ) { return; }

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
				d.dep.setValue( this.origin.get( keypath ) );
			});

			this.origin.mark( this.keypath );
		}
	},

	setValue: function ( value ) {
		if ( !this.keypath ) {
			throw new Error( 'Mapping does not have keypath, cannot set value. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.keypath, value );
	},

	unbind: function ( keepLocal ) {
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

	unregister: function ( keypath, dependant, group ) {
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
