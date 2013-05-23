proto.update = function ( keypath ) {
	utils.clearCache( this, keypath || '' );
	utils.notifyDependants( this, keypath || '' );

	this.fire( 'update:' + keypath );
	this.fire( 'update', keypath );

	return this;
};