// import equalsOrStartsWith from 'shared/keypaths/equalsOrStartsWith';
// import getNewKeypath from 'shared/keypaths/getNew';

function Mapping ( localKey, options ) {
	this.localKey = localKey;
	this.keypath = options.keypath;
	this.origin = options.origin;
	this.trackData = options.trackData;
	this.resolved = false;
}

export default Mapping;

Mapping.prototype = {

	setViewmodel: function ( viewmodel, deps ){
		this.local = viewmodel;
		this.deps = deps || [];
		this.setup();
	},

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

	map: function ( keypath ) {
		return keypath.replace( this.localKey, this.keypath );
	},

	// Test has shown this is never called. True? Or are we missing a test case?

	// rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
	// 	if ( equalsOrStartsWith( this.keypath, oldKeypath ) ) {
	// 		this.deps.forEach( d => this.origin.unregister( this.map( d.keypath ), d.dep, d.group ) );
	// 		this.keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath );
	// 		this.deps.forEach( d => this.origin.register( this.map( d.keypath ), d.dep, d.group ) );
	// 	}
	// },

	register: function ( keypath, dependant, group ) {
		this.deps.push({ keypath: keypath, dep: dependant, group: group });
		this.origin.register( this.map( keypath ), dependant, group );
	},

	resolve: function ( keypath ) {
		if ( this.keypath !== undefined ) {
			this.unbind();
		}
		this.keypath = keypath;
		this.setup();
	},

	setup: function () {
		if ( this.keypath === undefined ) { return; }

		this.resolved = true;

		// keep local data in sync, for browsers w/ no defineProperty
		if( this.trackData ) {
			this.tracker = {
				keypath: this.localKey,
				setValue: value => {
					var data = this.local.ractive.data;
					data[ this.localKey ] = value;
				}
			};
			this.origin.register( this.keypath, this.tracker );
		}

		if ( this.deps.length ) {
			this.deps.forEach( d => this.origin.register( this.map( d.keypath ), d.dep, d.group ) );
			this.origin.mark( this.keypath );
		}
	},

	set: function ( keypath, value ) {
		if ( !this.resolved ) {
			throw new Error( 'Something very odd happened. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.map( keypath ), value );
	},

	setValue: function ( value ) {
		if ( !this.keypath ) {
			throw new Error( 'Mapping does not have keypath, cannot set value. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.keypath, value );
	},

	unbind: function () {
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
