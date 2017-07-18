import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';
import runloop from '../../global/runloop';

export default function link ( there, here, options ) {
	let model;
	const target = ( options && ( options.ractive || options.instance ) ) || this;

	// may need to allow a mapping to resolve implicitly
	const sourcePath = splitKeypath( there );
	if ( !target.viewmodel.has( sourcePath[0] ) && target.component ) {
		model = resolveReference( target.component.parentFragment, sourcePath[0] );
		model = model.joinAll( sourcePath.slice( 1 ) );
	}

	const src = model || target.viewmodel.joinAll( sourcePath );
	const dest = this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false });

	if ( isUpstream( src, dest ) || isUpstream( dest, src ) ) {
		throw new Error( 'A keypath cannot be linked to itself.' );
	}

	const promise = runloop.start();

	dest.link( src, there );

	runloop.end();

	return promise;
}

function isUpstream ( check, start ) {
	let model = start;
	while ( model ) {
		if ( model === check ) return true;
		model = model.target || model.parent;
	}
}
