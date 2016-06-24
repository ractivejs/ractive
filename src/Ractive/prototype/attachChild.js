import Hook from '../../events/Hook';
import runloop from '../../global/runloop';

const attachHook = new Hook( 'attachchild' );

export default function attachChild ( child, options = {} ) {
	// options
	// what to do on unrender
	// what to do on teardown
	// target anchor to render
	// mappings

	const children = this._children;

	let i = children.length;
	while ( i-- ) {
		if ( children[i].ractive === child ) {
			if ( child.parent !== this ) throw new Error( `Instance ${child._guid} is already attached to a different parent ${child.parent._guid}. Please detach it from the other instance using detachChild first.` );
			else throw new Error( `Instance ${child._guid} is already attached to this instance.` );
		}
	}

	const anchors = this._anchors;
	const meta = {
		ractive: child,
		name: options.name || child.constructor.name || 'Ractive',
		liveQueries: [],
		target: options.target,
		bubble () { runloop.addFragment( this.ractive.fragment ); }
	};

	// child should be rendered to an anchor
	if ( options.target ) {
		let i = anchors.length;
		while ( i-- ) {
			if ( anchors[i].name === options.target ) {
				meta.anchor = anchors[i];
				break;
			}
		}
	}

	// child is managing itself
	else {
		meta.parentFragment = this.fragment;
	}

	child.parent = this;
	child.component = meta;
	children.push( meta );

	attachHook.fire( child );

	const promise = runloop.start( child, true );

	if ( meta.target ) {
		if ( child.fragment.rendered ) {
			meta.shouldDestroy = true;
			child.unrender();
		}
		child.el = null;
	} else {
		runloop.forceRebind();
		runloop.scheduleTask( () => child.fragment.rebind( child.viewmodel ) );

		// TODO: update live queries
	}

	if ( meta.anchor ) meta.anchor.addChild( meta );

	runloop.end();

	promise.ractive = child;
	return promise.then( () => child );
}
