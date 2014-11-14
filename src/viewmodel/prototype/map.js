import startsWith from 'virtualdom/items/shared/utils/startsWith';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function Viewmodel$map ( key, options ) {
	var mapping = new Mapping( this, key, options );

	this.mappings[ mapping.localKey ] = mapping;

	return mapping;
}

var Mapping = function ( local, localKey, options ) {

	this.local = local;
	this.localKey = localKey;
	this.origin = options.origin;
	this.resolved = false;
	this.legacy = options.legacy;

	if ( options.keypath !== undefined ) {
		this.resolve( options.keypath );
	}

	this.deps = [];
	this.unresolved = [];

	this.ready = true;

};

Mapping.prototype = {
	get: function ( keypath, options ) {
		if ( !this.resolved ) {
			return undefined;
		}

		return this.origin.get( this.map( keypath ), options );
	},

	getValue: function () {
		if ( !this.resolved ) {
			return undefined;
		}

		return this.origin.get( this.keypath );
	},

	map: function ( keypath ) {
		// TODO: should this be cached and only run when keypath changes?
		return keypath.replace( this.localKey, this.keypath );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( startsWith( this.keypath, oldKeypath ) ) {
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
		this.resolved = keypath !== undefined;

		if ( keypath !== undefined ) {

			this.origin.register( keypath, this, 'mappings' );


			if( this.legacy ) {
				// keep local data in sync, for browsers w/ no defineProperty
				this.origin.register( keypath, {
					setValue: value => {
						this.local.ractive.data[ this.localKey ] = value;
					}
				}, 'default' );
			}

			if ( this.ready ) {
				this.unresolved.forEach( u => {
					if ( u.group === 'mappings' ) { // TODO should these be treated w/ separate process?
						u.dep.local.mark( u.dep.localKey );
						u.dep.origin = this.origin;
						u.dep.keypath = keypath;
					} else {
						this.register( u.keypath, u.dep, u.group );
						u.dep.setValue( this.get( u.keypath ) );
					}
				});

				this.deps.forEach( d => this.origin.register( this.map( d.keypath ), d.dep, d.group ) );
				this.local.mark( this.localKey );
			}

		}
	},

	set: function ( keypath, value ) {
		if ( !this.resolved ) {
			throw new Error( 'Something very odd happened. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.map( keypath ), value );
	},

	setValue: function ( value ) {
		if ( !this.resolved ) {
			throw new Error( 'Something very odd happened. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
		}

		this.origin.set( this.keypath, value );
	},

	unbind: function () {
		var dep;

		while ( dep = this.deps.pop() ) {
			this.origin.unregister( this.map( dep.keypath, dep.dep, dep.group ) );
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
