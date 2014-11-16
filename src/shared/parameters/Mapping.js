import equalsOrStartsWith from 'shared/keypaths/equalsOrStartsWith';
import getNewKeypath from 'shared/keypaths/getNew';

function Mapping ( localKey, options ) {
	this.localKey = localKey;
	this.keypath = options.keypath;
	this.origin = options.origin;
	this.trackData = options.trackData;
	this.resolved = this.ready = false;
}

export default Mapping;

Mapping.prototype = {

	setViewmodel: function ( viewmodel ){
		this.local = viewmodel;
		this.deps = [];
		this.unresolved = [];
		this.setup();
		this.ready = true;
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

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( equalsOrStartsWith( this.keypath, oldKeypath ) ) {
			this.deps.forEach( d => this.origin.unregister( this.map( d.keypath ), d.dep, d.group ) );
			this.keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath );
			this.deps.forEach( d => this.origin.register( this.map( d.keypath ), d.dep, d.group ) );
		}
	},

	register: function ( keypath, dependant, group ) {
		var dep = { keypath: keypath, dep: dependant, group: group };

		if ( !this.resolved ) {
			this.unresolved.push( dep );
		} else {
			this.deps.push({ keypath: keypath, dep: dependant, group: group });
			this.origin.register( this.map( keypath ), dependant, group );
		}
	},

	resolve: function ( keypath ) {
		if ( this.keypath !== undefined ) {
			this.origin.unregister( this.keypath, this, 'mappings' );
			this.deps.forEach( d => this.origin.unregister( this.map( d.keypath ), d.dep, d.group ) );
		}
		this.keypath = keypath;
		this.setup();
	},

	setup: function () {
		if ( this.keypath === undefined ) { return; }

		this.resolved = true;

		this.origin.register( this.keypath, this, 'mappings' );

		if( this.trackData ) {
			// keep local data in sync, for browsers w/ no defineProperty
			this.tracker = {
				setValue: value => {
					this.local.ractive.data[ this.localKey ] = value;
				}
			};

			this.origin.register( this.keypath, this.tracker );
		}

		if ( this.ready ) {
			this.unresolved.forEach( u => {
				if ( u.group === 'mappings' ) { // TODO should these be treated w/ separate process?
					u.dep.local.mark( u.dep.localKey );
					u.dep.origin = this.origin;
					u.dep.keypath = this.keypath;
				} else {
					this.register( u.keypath, u.dep, u.group );
					u.dep.setValue( this.get( u.keypath ) );
				}
			});

			this.deps.forEach( d => this.origin.register( this.map( d.keypath ), d.dep, d.group ) );
			this.local.mark( this.localKey );
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

	teardown: function () {
		this.unbind();
		this.origin.unregister( this.keypath, this, 'mappings' );
		if ( this.tracker ) {
			this.origin.unregister( this.keypath, this.tracker );
		}
	},

	unbind: function () {
		var dep;
		while ( dep = this.deps.pop() ) {
			this.origin.unregister( this.map( dep.keypath ), dep.dep, dep.group );
		}
	},

	unregister: function ( keypath, dependant, group ) {
		var deps, i;

		deps = this.resolved ? this.deps : this.unresolved;
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
