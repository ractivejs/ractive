import { removeFromArray } from 'utils/array';

class Dependants {

	constructor () {
		this.methods = Object.create( null );
	}

	keys () {
		return Object.keys( this.methods );
	}

	list ( method ) {
		return this.methods[ method ];
	}

	has ( method ) {
		return !!this.list( method );
	}

	add ( method, dependant ) {
		const methods = this.methods,
			  list = methods[ method ];

		if ( list ) {
			list.push( dependant );
		}
		else {
			methods[ method ] = [ dependant ];
		}
	}

	remove ( method, dependant ) {
		const methods = this.methods[ method ];
		if ( methods ) {
			removeFromArray( methods, dependant );
		}
	}

	notify ( method, arg ) {
		const dependants = this.methods[ method ];

		if ( !dependants ) {
			return;
		}

		const length = dependants.length;

		var dependant;

		for( let i = 0; i < length; i++ ) {
			// dependants can unregsiter as
			// higher level dependants are fired
			// TODO: there may be a chance we miss
			// a dependant if array length slide past
			// a valid dependant
			if ( dependant = dependants[i] ) {
				dependant[ method ]( arg );
			}
		}
	}
}

export default Dependants;
