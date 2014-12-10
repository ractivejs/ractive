import create from 'utils/create';
import log from 'utils/log/log';

export default function Viewmodel$init () {
	var key, computation, computations = [];

	for ( key in this.ractive.computed ) {
		computation = this.compute( key, this.ractive.computed[ key ] );
		computations.push( computation );
	}

	computations.forEach( init );
}

function init ( computation ) {
	computation.init();
}
