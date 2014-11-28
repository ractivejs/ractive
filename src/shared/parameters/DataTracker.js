function DataTracker ( key, viewmodel ) {
	this.keypath = key;
	this.viewmodel = viewmodel;
}

export default DataTracker;

DataTracker.prototype.setValue = function ( value ) {
	this.viewmodel.set( this.keypath, value, { noMapping: true } );
};

