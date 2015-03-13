import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';

var hasChild = function ( value, key ) {
	if ( value == null ) {
		return false;
	}
	if ( ( typeof value === 'object' || typeof value === 'function' ) && !( key in value ) ) {
		return false;
	}
	return true;
}

class PropertyStore {

	constructor ( property, model ) {
		this.model = model;
		this.property = property;
	}

	get () {
		var value = this.model.parent.get();
		if( hasChild( value, this.property ) ) {
			return value[ this.property ];
		}
		// FAILED_LOOKUP
	}

	getSettable ( propertyOrIndex ) {
		var value = this.get();

		if ( !value ) {
			// set value as {} or []
			value = createBranch( propertyOrIndex );
			// silent set
			this.set( value );
		}

		return value;
	}

	set ( value ) {
		if ( isEqual( this.get(), value ) ) {
			return false;
		}

		this.model.parent.getSettable( this.property )[ this.property ] = value;

		return true;
	}

	invalidate () {

	}
}


export default PropertyStore;
