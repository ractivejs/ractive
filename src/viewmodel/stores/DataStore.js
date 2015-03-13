import { isEqual } from 'utils/is';

class DataStore {

	constructor ( data ) {
		this.data = data;
	}

	get () {
		return this.data;
	}

	getSettable () {
		var value = this.get();

		if ( !value ) {
			// silent set directly on store
			this.set( value = {} );
		}

		return value;
	}

	set ( value ) {
		if ( isEqual( this.get(), value ) ) {
			return false;
		}
		this.data = value;
		return true;
	}

	invalidate () {

	}
}

export default DataStore;
