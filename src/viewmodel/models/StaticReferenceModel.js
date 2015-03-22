import Model from './Model';

var noopStore = {};

class StaticReferenceModel extends Model {

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

	resolve () {
		if ( this.resolved ) {
			return;
		}

		let resolved,
			joinParent = this.parent.getJoinModel(),
			key = this.getJoinKey();

		if ( joinParent && key ) {
			resolved = this.resolved = joinParent.join( key );
		}

		if ( resolved ) {
			resolved.register( this, 'computed' );
		}
	}


	set ( value ) {
		var resolved = this.resolved;
		if ( !resolved ) {
			if ( typeof value !== 'undefined' ) {
				throw new Error('StaticReferenceModel set called without resolved.');
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

		let children;
		// reset child references
		if ( children = this.children ) {
			let i, l;

			for( i = 0, l = children.length; i < l; i++ ) {
				children[i].reset();
			}
		}

	}

	getJoinModel () {
		this.resolve();
		let resolved = this.resolved;
		if ( !resolved ) {
			// TODO:  create new ProxyModel() ????
			throw new Error('StaticReferenceModel getJoinModel called without resolved.');
		}
		return resolved;
	}

	// TODO: tryJoin

	join ( keypath ) {

		this.resolve();
		if ( !this.resolved ) {
			throw new Error('attempt to join unresolved reference');
		}

		var keys = ( '' + keypath ).split( '.' ),
			key,
			childRef,
			parent = this;

		while ( key = keys.shift() ) {
			childRef = new StaticReferenceModel( key );
			parent.addChild( childRef );
			parent = childRef;
		}

		return childRef;
	}

}

export default StaticReferenceModel;
