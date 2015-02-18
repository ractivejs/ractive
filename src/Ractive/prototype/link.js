import { getKeypath, normalise } from 'shared/keypaths';
//import runloop from 'global/runloop';
import Promise from 'utils/Promise';

/*export function link( there, here ) {
	here = getKeypath( normalise( here ) );
	if ( !here.parent || !here.parent.isRoot ) {
		throw new Error( `Ractive cannot currently create non-root links. Your target keypath, "${here.str}", contains at least one ".".` );
	}

	let promise = runloop.start( this, true );

	let error = this.viewmodel.link( getKeypath( normalise( there ) ), here );

	runloop.end();

	if ( error ) {
		throw new Error( error.message );
	}

	return promise;
}

export function unlink( here ) {
	let promise = runloop.start( this, true );

	let error = this.viewmodel.unlink( getKeypath( normalise( here ) ) );

	runloop.end();

	if ( error ) {
		throw new Error( error.message );
	}

	return promise;
}*/

export function link( there, here ) {
	here = getKeypath( normalise( here ) ), there = getKeypath( normalise( there ) );

	if ( there === here || here.startsWith( there ) || there.startsWith( here ) ) {
		throw new Error( 'You cannot link a keypath to itself.' );
	}

	let ln = this._links[ here.str ], promise;

	if ( ln ) {
		if ( ln.source !== there || ln.dest !== here ) {
			promise = unlink.call( this, here.str );
		} else { // this is already linked, so nothing to do
			return Promise.resolve( true );
		}
	}

	ln = new Link( there, here, this );
	this.viewmodel.register( there, ln, 'default' );
	this.viewmodel.register( here, ln, 'default' );

	this._links[ here.str ] = ln;

	// update the link and return the update's promise
	return Promise.all( promise, this.set( here.str, this.get( there.str ) ) );
}

export function unlink( here ) {
	let ln = this._links[ here ];

	if ( ln ) {
		this.viewmodel.unregister( ln.here, ln, 'default' );
		this.viewmodel.unregister( ln.there, ln, 'default' );
		delete this._links[ here ];
		// TODO: unset?
		return this.set( here, undefined );
	} else {
		return Promise.resolve( true );
	}
}

function Link( there, here, ractive ) {
	this.there = there, this.here = here, this.ractive = ractive;
	this.locked = false;
	this.regex = new RegExp( `^${here.str.replace(/\./g, '\\.')}|^${there.str.replace(/\./g, '\\.')}` );
}
Link.prototype = {
	setValue( value, keypath ) {
		if ( !this.locked ) {
			this.locked = true;

			let toUpdate = ( keypath === this.there ? this.here : this.there ).str;
			this.ractive.set( toUpdate, value );

			this.locked = false;
		}
	},
	refineValue( refinements ) {
		if ( !this.locked ) {
			this.locked = true;

			refinements.forEach( k => {
				let toUpdate =  ( k.startsWith( this.there ) ? k.replace( this.there, this.here ) : k.replace( this.here, this.there ) ).str ;
				this.ractive.update( toUpdate );
			});

			this.locked = false;
		}
	}
};
