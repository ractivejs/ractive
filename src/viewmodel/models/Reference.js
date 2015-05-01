import Context from './Context';

class Reference extends Context {

	constructor ( key ) {
		this.resolved = null;
		super( key, noopStore );
	}

	getJoinKey () {
		return this.key;
	}

	get () {
		this.resolve();

		let resolved;
		if ( resolved = this.resolved ) {
			return resolved.get();
		}
	}

	getSettable () {
		this.resolve();

		let resolved;
		if ( resolved = this.resolved ) {
			return resolved.getSettable();
		}
		else {
			// TODO ???
			throw new Error('ArrayMemberReference not settable, need to force?')
		}
	}

	resolve () {
		if ( this.resolved ) {
			return;
		}

		let resolved,
			joinParent = this.parent.getJoinModel(),
			key = this.getJoinKey();

		if ( joinParent && key != null ) {
			resolved = this.resolved = joinParent.join( key );
		}

		if ( resolved ) {
			resolved.register( this, 'computed' );
		}
	}

	// Don't know if this is answer to not re-resolving with old value
	// on cascade. Probably a better option...
	cascadeDown () {
		// this.createOrReconcileMembers( this.get() );
		this.cascadeChildren( this.members );
		this.cascadeChildren( this.properties );
	}


	set ( value ) {
		this.resolve();

		let resolved = this.resolved;
		if ( !resolved ) {
			// TODO force resolve?
			if ( typeof value !== 'undefined' ) {
				throw new Error('Reference set called without resolved.');
			}
			return;
		}

		resolved.set( value );
	}

	reset () {
		if ( this.resolved ) {
			this.resolved.unregister( this, 'computed' );
			this.resolved = null;
		}

		this.mark();

		this.resetChildren( this.properties );
		// TODO: do members actually need to be reset ???
		this.resetChildren( this.members );

	}

	resetChildren ( children ) {
		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].reset();
		}
	}

	getJoinModel () {
		this.resolve();
		let resolved = this.resolved;
		if ( !resolved ) {
			// TODO:  create new Unresolved() ????
			throw new Error('Reference getJoinModel called without resolved.');
		}
		return resolved;
	}

	createChild ( key ) {
		return new Reference( key );
	}

	doJoin ( keys, testFirstKey, firstKey ) {

		this.resolve();

		if ( !this.resolved ) {
			throw new Error('attempt to join unresolved reference');
		}

		return super.doJoin( keys, testFirstKey, firstKey );
	}
}

export default Reference;
