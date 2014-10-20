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
};

Mapping.prototype = {
	resolve: function ( keypath ) {
		return keypath.replace( this.localKey, this.keypath );
	}
}
