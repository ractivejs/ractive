class ReferenceStore {

	constructor ( reference, model ) {
		this.model = model;
		this.reference = reference;
		this.resolved = null;
	}

	get () {
		var resolved, value;

		if ( !( resolved = this.resolved ) && typeof ( value = this.reference.get() ) !== 'undefined' ) {
			resolved = this.resolved = this.model.parent.join( value );
			if ( resolved ) {
				resolved.register( this.model, 'computed' );
			}
		}
		return resolved ? resolved.get() : void 0;
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

		this.resolved.set( value );
		return !this.resolved || this.resolved.dirty;
	}

	invalidate () {
		if ( this.resolved ) {
			this.resolved.unregister( this.model, 'computed' );
			this.resolved = null;
		}
	}
}

export default ReferenceStore;
