import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';
import runloop from '../../global/runloop';

export default function link( there, here, options ) {
	if ( here === there || (there + '.').indexOf( here + '.' ) === 0 || (here + '.').indexOf( there + '.' ) === 0 ) {
		throw new Error( 'A keypath cannot be linked to itself.' );
	}

	const promise = runloop.start();
	let model;
	const target = ( options && options.ractive ) || this;

	// may need to allow a mapping to resolve implicitly
	const sourcePath = splitKeypath( there );
	if ( !target.viewmodel.has( sourcePath[0] ) && target.component ) {
		model = resolveReference( target.component.parentFragment, sourcePath[0] );
		model = model.joinAll( sourcePath.slice( 1 ) );
	}

	this.viewmodel.joinAll( splitKeypath( here ) ).link( model || target.viewmodel.joinAll( sourcePath ), there );

	runloop.end();

	return promise;
}
