export default function Viewmodel$init () {
	var key, computation, computations = [];

	for ( key in this.ractive.computed ) {
		computation = this.compute( key, this.ractive.computed[ key ] );
		computations.push( computation );
	}

	computations.forEach( init );

	computations.forEach( c => {
		var mapping;
		if ( mapping = this.mappings[ c.key ] ) {
			let origin = mapping.origin,
				keypath = mapping.keypath;

			mapping.teardown();

			delete this.mappings[ c.key ];

			origin.map( keypath, {
				origin: this,
				keypath: key
			});
		}
	})
}

function init ( computation ) {
	computation.init();
}

