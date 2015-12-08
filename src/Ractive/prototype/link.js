import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';
import runloop from '../../global/runloop';
import Promise from '../../utils/Promise';

export default function link( there, here ) {
	if ( here === there || (there + '.').indexOf( here + '.' ) === 0 || (here + '.').indexOf( there + '.' ) === 0 ) {
		throw new Error( 'A keypath cannot be linked to itself.' );
	}

	let unlink, run, model;

	let ln = this._links[ here ];

	if ( ln ) {
		if ( ln.source.model.str !== there || ln.dest.model.str !== here ) {
			unlink = this.unlink( here );
		} else {
			return Promise.resolve( true );
		}
	}

	run = runloop.start();

	// may need to allow a mapping to resolve implicitly
	const sourcePath = splitKeypath( there );
	if ( !this.viewmodel.has( sourcePath[0] ) && this.component ) {
		model = resolveReference( this.component.parentFragment, sourcePath[0] );

		if ( model ) {
			this.viewmodel.map( sourcePath[0], model );
		}
	}

	ln = new Link( this.viewmodel.joinAll( sourcePath ), this.viewmodel.joinAll( splitKeypath( here ) ), this );
	this._links[ here ] = ln;
	ln.source.handleChange();

	runloop.end();

	return Promise.all( [ unlink, run ] );
}

class Link {
	constructor ( source, dest, ractive ) {
		this.source = new LinkSide( source, this );
		this.dest = new LinkSide( dest, this );
		this.ractive = ractive;
		this.locked = false;
		this.initialValue = dest.get();
	}

	sync ( side ) {
		if ( !this.locked ) {
			this.locked = true;

			if ( side === this.dest ) {
				this.source.model.set( this.dest.model.get() );
			} else {
				this.dest.model.set( this.source.model.get() );
			}

			this.locked = false;
		}
	}

	unlink () {
		this.source.model.unregister( this.source );
		this.dest.model.unregister( this.dest );
	}
}

class LinkSide {
	constructor ( model, owner ) {
		this.model = model;
		this.owner = owner;
		model.register( this );
	}

	handleChange () {
		this.owner.sync( this );
	}
}
