var UnresolvedDependency = function ( computation, ref ) {
	this.computation = computation;
	this.viewmodel = computation.viewmodel;
	this.ref = ref;

	// TODO this seems like a red flag!
	this.root = this.viewmodel.ractive;
	this.parentFragment = this.root.component && this.root.component.parentFragment;
};

UnresolvedDependency.prototype = {
	resolve: function ( keypath ) {
		this.computation.softDeps.push( keypath );
		this.computation.unresolvedDeps[ keypath.str ] = null;
		this.viewmodel.register( keypath, this.computation, 'computed' );
	}
};

export default UnresolvedDependency;