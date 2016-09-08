import Hook from '../../events/Hook';
import runloop from '../../global/runloop';

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

	runloop.end();

	children.splice( index, 1 );
	child.parent = null;
	child.component = null;

	detachHook.fire( child );

	if ( !meta.anchor && child.fragment.rendered ) {
		// keep live queries up to date
		child.findAll( '*' ).forEach( el => {
			el._ractive.proxy.liveQueries.forEach( q => {
				// remove from non-self queries
				if ( isParent( this, q.ractive ) ) el._ractive.proxy.removeFromQuery( q );
			});
		});

		// keep live component queries up to date
		child.findAllComponents().forEach( cmp => {
			cmp.component.liveQueries.forEach( q => {
				if ( isParent( this, q.ractive ) ) cmp.component.removeFromQuery( q );
			});
		});

		meta.liveQueries.forEach( q => meta.removeFromQuery( q ) );
	}

	promise.ractive = child;
	return promise.then( () => child );
}

function isParent ( target, check ) {
	while ( target ) {
		if ( target === check ) return true;
		target = target.parent;
	}
}

