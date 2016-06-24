import Hook from '../../events/Hook';
import runloop from '../../global/runloop';

const detachHook = new Hook( 'detachchild' );

export default function detachChild ( child ) {
	const children = this._children;
	let meta, index;

	let i = children.length;
	while ( i-- ) {
		if ( children[i].ractive === child ) {
			index = i;
			meta = children[i];
			break;
		}
	}

	if ( !meta || child.parent !== this ) throw new Error( `Instance ${child._guid} is not attached to this instance.` );

	const promise = runloop.start( child, true );

	if ( meta.anchor ) meta.anchor.removeChild( meta );
	child.viewmodel.resetMappings();

	runloop.forceRebind();
	child.fragment.rebind();

	runloop.end();

	children.splice( index, 1 );
	child.parent = null;
	child.component = null;

	detachHook.fire( child );

	promise.ractive = child;
	return promise.then( () => child );
}
