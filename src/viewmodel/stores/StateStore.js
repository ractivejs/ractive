import { isEqual } from 'utils/is';

class StateStore {

	constructor ( state ){
		this.state = state;
	}

	get () {
		return this.state;
	}

	getSettable () {
		// TODO Should be allowed once we allow object state
		throw new Error('uh, shouldn\'t get value of an state store as a parent');
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
