import log from 'utils/log';

export default function Viewmodel$init () {
	var key, computation, computations = [];

	for ( key in this.ractive.computed ) {
		computation = this.compute( key, this.ractive.computed[ key ] );
		computations.push( computation );

		if ( key in this.mappings ) {
			log.critical({
				message: 'Cannot map to a computed property (\'' + key + '\')'
			});
		}
	}

	computations.forEach( init );
}

function init ( computation ) {
	computation.init();
}
