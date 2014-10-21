import startsWith from 'virtualdom/items/shared/utils/startsWith';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function Viewmodel$map ( origin, originKeypath, localKey ) {
	var mapping = new Mapping( this, origin, localKey, originKeypath );

	// register with origin
	origin.register( originKeypath, mapping, 'mappings' );

	this.mappings[ localKey ] = mapping;
	return mapping;
}

var Mapping = function ( local, origin, localKey, keypath ) {
	this.local = local;
	this.origin = origin;
	this.localKey = localKey;
	this.keypath = keypath;

	this.deps = [];
};

Mapping.prototype = {
	map: function ( keypath ) {
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
		this.deps.push({ keypath: keypath, dep: dependant, group: group });
		this.origin.register( this.map( keypath ), dependant, group );
	},

	unbind: function () {
		var dep;

		while ( dep = this.deps.pop() ) {
			this.origin.unregister( this.map( dep.keypath, dep.dep, dep.group ) );
		}
	},

	unregister: function ( keypath, dependant, group ) {
		var i = this.deps.length;

		while ( i-- ) {
			if ( this.deps[i].dep === dependant ) {
				this.deps.splice( i, 1 );
				break;
			}
		}

		this.origin.unregister( this.map( keypath ), dependant, group );
	}
};
