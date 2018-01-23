import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import { updateAnchors } from '../../shared/anchors';

const detachHook = new Hook( 'detachchild' );

export default function detachChild ( child ) {
	const children = this._children;
	let meta, index;

	let i = children.length;
	while ( i-- ) {
		if ( children[i].instance === child ) {
			index = i;
			meta = children[i];
			break;
		}
	}

	if ( !meta || child.parent !== this ) throw new Error( `Instance ${child._guid} is not attached to this instance.` );

	const promise = runloop.start( child, true );

	if ( meta.anchor ) meta.anchor.removeChild( meta );
	if ( !child.isolated ) child.viewmodel.detached();

	runloop.end();

	children.splice( index, 1 );
	if ( meta.target ) {
		this.splice( `@this.children.byName.${meta.target}`, children.byName[ meta.target ].indexOf(meta), 1 );
		updateAnchors( this, meta.target );
	}
	child.set({
		'@this.parent': undefined,
		'@this.root': child
	});
	child.component = null;

	detachHook.fire( child );

	promise.ractive = child;
	return promise.then( () => child );
}
