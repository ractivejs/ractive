define(function () {

	'use strict';
	
	return function Viewmodel$teardown () {var this$0 = this;
		var unresolvedImplicitDependency;
	
		// Clear entire cache - this has the desired side-effect
		// of unwrapping adapted values (e.g. arrays)
		Object.keys( this.cache ).forEach( function(keypath ) {return this$0.clearCache( keypath )} );
	
		// Teardown any failed lookups - we don't need them to resolve any more
		while ( unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop() ) {
			unresolvedImplicitDependency.teardown();
		}
	};

});