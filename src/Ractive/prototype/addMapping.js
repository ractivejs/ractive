import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';
import resolveReference from '../../view/resolvers/resolveReference';

export default function addMapping ( dest, src, opts = {} ) {
	if ( splitKeypath( dest ).length !== 1 ) throw new Error( `Mappings must be a single top-level key. ${dest} is invalid.` );
	const keys = splitKeypath( src );

	let model;

	if ( opts.ractive ) model = opts.ractive.viewmodel.joinAll( keys );

	if ( !model ) {
		model = resolveReference( this.component.parentFragment || this.fragment.componentFragment || this.parent.fragment, src );
	}

	if ( !model ) throw new Error( `Mapping source '${src}' could not be resolved for '${dest}'.` );

	this._mappings[ dest ] = model;

	runloop.start();
	if ( this.viewmodel.map( dest, model ) ) {
		// this is a remapping, so a rebind is in order
		// TODO: make this specific to the relevant keypath
		runloop.forceRebind();
		this.fragment.rebind( this.viewmodel );
	} else {
		this.viewmodel.clearUnresolveds();
	}
	runloop.end();
}
