// TODO add a transition manager, allow a complete handler to be specified

proto.update = function ( keypath ) {
	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	processDeferredUpdates( this );

	this.fire( 'update', keypath );

	return this;
};