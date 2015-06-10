import { isEqual } from 'utils/is';

class StateStore {

	constructor ( state ){
		this.state = state;
	}

	get () {
		return this.state;
	}

	getSettable () {
		if ( !this.state ) {
			// Don't think this could happen...
			throw new Error('uh, state store should have a value');
		}

		return this.state;
	}

	set ( state ) {

		if ( isEqual( this.get(), state ) ) {
			return false;
		}

		this.state = state;

		return true;
	}

	invalidate () {

	}
}

export default StateStore;
