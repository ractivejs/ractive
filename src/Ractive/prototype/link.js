import { getKeypath, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

export function link( there, here ) {
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
}
