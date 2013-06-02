proto.update = function ( keypath ) {
	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	processDeferredUpdates( this );

	this.fire( 'update:' + keypath );
	this.fire( 'update', keypath );

	return this;
};