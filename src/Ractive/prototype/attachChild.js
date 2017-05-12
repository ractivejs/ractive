import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import { unrenderChild, updateAnchors } from '../../shared/anchors';

const attachHook = new Hook( 'attachchild' );

export default function attachChild ( child, options = {} ) {
	const children = this._children;

	if ( child.parent && child.parent !== this ) throw new Error( `Instance ${child._guid} is already attached to a different instance ${child.parent._guid}. Please detach it from the other instance using detachChild first.` );
	else if ( child.parent ) throw new Error( `Instance ${child._guid} is already attached to this instance.` );

	const meta = {
		instance: child,
		ractive: this,
		name: options.name || child.constructor.name || 'Ractive',
		target: options.target || false,
		bubble,
		findNextNode
	};
	meta.nameOption = options.name;

	// child is managing itself
	if ( !meta.target ) {
		meta.parentFragment = this.fragment;
		meta.external = true;
	} else {
		let list;
		if ( !( list = children.byName[ meta.target ] ) ) {
			list = [];
			this.set( `@this.children.byName.${meta.target}`, list );
		}
		const idx = options.prepend ? 0 : options.insertAt !== undefined ? options.insertAt : list.length;
		list.splice( idx, 0, meta );
	}

	child.set({
		'@this.parent': this,
		'@this.root': this.root
	});
	child.component = meta;
	children.push( meta );

	attachHook.fire( child );

	const promise = runloop.start( child, true );

	if ( meta.target ) {
		unrenderChild( meta );
		this.set( `@this.children.byName.${meta.target}`, null, { shuffle: true } );
		updateAnchors( this, meta.target );
	} else {
		if ( !child.isolated ) child.viewmodel.attached( this.fragment );
	}

	runloop.end();

	promise.ractive = child;
	return promise.then( () => child );
}

function bubble () { runloop.addFragment( this.instance.fragment ); }

function findNextNode () {
	if ( this.anchor ) return this.anchor.findNextNode();
}
