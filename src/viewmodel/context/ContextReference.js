import BindingContext from './BindingContext';

var noopStore = {};

// ContextReference references another BindingContext,
// and may change the BindingContext to which it refers.
// It delegates most operations to the "resolved" reference,
// but it maintains its own dependancies and wraps creation
// of children to return ContextReference instances as well.

class ContextReference extends BindingContext {

	constructor ( key ) {
		this.resolved = null;
		super( key, noopStore );
	}

	getJoinKey () {
		return this.key;
	}

	get () {
		const resolved = this.resolve();

		if ( resolved ) {
			return resolved.get();
		}
	}

	getSettable () {
		const resolved = this.resolve();

		if ( !resolved ) {
			// TODO: do we need to force? or is this never called?
			throw new Error('ContextReference getSettable() called when unresolved')
		}

		return resolved.getSettable();
	}

	resolve () {
		return this.resolved || this.tryResolve();
	}

	tryResolve () {
		const key = this.getJoinKey(),
			  joinParent = this.parent.getJoinModel();

		let resolved;

		if ( joinParent && key != null ) {
			resolved = this.resolved = joinParent.join( key );
		}

		if ( resolved ) {
			resolved.register( this, 'computed' );
		}

		return resolved;
	}

	// Context References were re-resolving with old value
	// on cascade. by overriding cascadeDown and
	// not running the creteOrReconcileMembers (commented out
	// first line below) it fixes the issue.
	// Don't know if this is best way or if there is a better option...
	cascadeDown () {
		// this.createOrReconcileMembers( this.get() );
		this.cascadeChildren( this.members );
		this.cascadeChildren( this.properties );
	}

	set ( value ) {
		const resolved = this.resolve();

		if ( !resolved ) {
			// TODO force resolve or will this ever be called?
			if ( typeof value !== 'undefined' ) {
				throw new Error('ContextReference set() called with value when unresolved');
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
		// test removing this line
		this.resetChildren( this.members );

	}

	resetChildren ( children ) {
		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].reset();
		}
	}

	getJoinModel () {
		return this.resolve();
	}

	createChild ( key ) {
		return new ContextReference( key );
	}

	doJoin ( keys, testFirstKey, firstKey ) {

		const resolved = this.resolve();

		if ( !resolved ) {
			throw new Error('ContextReference attempt to join when unresolved');
		}

		return super.doJoin( keys, testFirstKey, firstKey );
	}
}

export default ContextReference;
