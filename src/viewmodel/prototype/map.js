export default function Viewmodel$map ( origin, originKeypath, localKey ) {
	var mapping = new Mapping( this, origin, localKey, originKeypath );

	// register with origin
	origin.register( originKeypath, mapping, 'mappings' );

	this.mappings[ localKey ] = mapping;
	return mapping;
}

var Mapping = function ( local, origin, localKey, originKeypath ) {
	this.local = local;
	this.origin = origin;
	this.localKey = localKey;
	this.originKeypath = originKeypath; // TODO consistent names
};

Mapping.prototype = {
	// rebind: function ( x, y, oldKeypath, newKeypath ) {
	// 	console.log( 'rebinding mapping', oldKeypath, newKeypath, this );

	// 	console.log( 'this.root.viewmodel.bindings', this.root.viewmodel.bindings );

	// 	this.origin.viewmodel.unregister( oldKeypath, this, 'mappings' );
	// 	this.origin.viewmodel.register( newKeypath, this, 'mappings' );

	// 	this.keypath = newKeypath;
	// }
};