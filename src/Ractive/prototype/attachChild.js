import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import updateLiveQueries from '../../view/items/element/updateLiveQueries';
import updateLiveComponentQueries from '../../view/items/component/updateLiveQueries';
import { removeFromArray } from '../../utils/array';

const attachHook = new Hook( 'attachchild' );

export default function attachChild ( child, options = {} ) {
	const children = this._children;

	if ( child.parent && child.parent !== this ) throw new Error( `Instance ${child._guid} is already attached to a different instance ${child.parent._guid}. Please detach it from the other instance using detachChild first.` );
	else if ( child.parent ) throw new Error( `Instance ${child._guid} is already attached to this instance.` );

	const anchors = this._anchors;
	const meta = {
		instance: child,
		ractive: this,
		name: options.name || child.constructor.name || 'Ractive',
		liveQueries: [],
		target: options.target || false,
		bubble,
		removeFromQuery
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
		if ( child.fragment.rendered ) {
			child.findAll( '*' ).forEach( el => updateLiveQueries( el._ractive.proxy ) );
			child.findAllComponents().forEach( cmp => updateLiveComponentQueries( cmp.component ) );
			updateLiveComponentQueries( meta );
		}
	}

	if ( meta.anchor ) meta.anchor.addChild( meta );

	runloop.end();

	promise.ractive = child;
	return promise.then( () => child );
}

function bubble () { runloop.addFragment( this.instance.fragment ); }

function removeFromQuery ( query ) {
	query.remove( this.instance );
	removeFromArray( this.liveQueries, query );
}

