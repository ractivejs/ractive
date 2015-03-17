class ReferenceStore {

	constructor ( reference, model ) {
		this.model = model;
		this.reference = reference;
		this.resolved = null;
		this.selfSet = false;
	}

	get () {
		var resolved = this.resolved, value;

		if ( !resolved ) {
			value = this.reference.get();

			if( value != null ) {
				resolved = this.resolved = this.model.parent.join( value );
			}

			if ( resolved ) {
				resolved.register( this.model, 'computed' );
			}
		}

		if ( resolved ) {
			return resolved.get();
		}
	}

	getSettable ( propertyOrIndex ) {
		throw new Error('ReferenceStore should not have getSettable called.');
	}

	set ( value ) {
		if ( !this.resolved ) {
			if ( typeof value !== 'undefined' ) {
				throw new Error('ReferenceStore set called without resolved.');
			}
			return;
		}

		this.selfSet = true;
		this.resolved.set( value );
		this.selfSet = false;

		return this.resolved.dirty;
	}

	invalidate () {
		if ( !this.selfSet && this.resolved ) {
			this.resolved.unregister( this.model, 'computed' );
			this.resolved = null;
		}
	}
}

export default ReferenceStore;
