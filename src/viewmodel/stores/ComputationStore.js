import { isEqual } from 'utils/is';

// TODO: Computation can be used directly here

class ComputationStore {

	constructor ( computation ) {
		this.computation = computation;
	}

	get () {
		return this.computation.get();
	}

	getSettable ( propertyOrIndex ) {
		var value = this.get();

		if ( !value ) {
			// What to do here? And will we even be here?
			throw new Error('Setting a child of non-existant parent expression');
		}

		return value;
	}

	set ( value ) {
		if ( isEqual( this.get(), value ) ) {
			return false;
		}

		this.computation.set( value );

		return true;
	}

	invalidate () {
		this.computation.invalidate();
	}
}

export default ComputationStore;
