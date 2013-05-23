proto.update = function ( keypath ) {
	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	this.fire( 'update:' + keypath );
	this.fire( 'update', keypath );

	return this;
};