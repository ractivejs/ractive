export default function Component$createMapping ( origin, originKeypath, localKeypath ) {
	var mapping = new Mapping( this.root, origin, localKeypath, originKeypath );

	// register with origin
	origin.viewmodel.register( originKeypath, mapping, 'mappings' );

	this.mappings[ localKeypath ] = mapping;
	return mapping;
}

var Mapping = function ( local, origin, localKeypath, originKeypath ) {
	this.root = local;
	this.origin = origin;
	this.localKeypath = localKeypath;
	this.keypath = originKeypath; // TODO consistent names
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