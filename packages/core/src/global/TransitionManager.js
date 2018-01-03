import { removeFromArray } from '../utils/array';

export default class TransitionManager {
	constructor ( callback, parent ) {
		this.callback = callback;
		this.parent = parent;

		this.intros = [];
		this.outros = [];

		this.children = [];
		this.totalChildren = this.outroChildren = 0;

		this.detachQueue = [];
		this.outrosComplete = false;

		if ( parent ) {
			parent.addChild( this );
		}
	}

	add ( transition ) {
		const list = transition.isIntro ? this.intros : this.outros;
		transition.starting = true;
		list.push( transition );
	}

	addChild ( child ) {
		this.children.push( child );

		this.totalChildren += 1;
		this.outroChildren += 1;
	}

	decrementOutros () {
		this.outroChildren -= 1;
		check( this );
	}

	decrementTotal () {
		this.totalChildren -= 1;
		check( this );
	}

	detachNodes () {
		this.detachQueue.forEach( detach );
		this.children.forEach( _detachNodes );
		this.detachQueue = [];
	}

	ready () {
		if ( this.detachQueue.length ) detachImmediate( this );
	}

	remove ( transition ) {
		const list = transition.isIntro ? this.intros : this.outros;
		removeFromArray( list, transition );
		check( this );
	}

	start () {
		this.children.forEach( c => c.start() );
		this.intros.concat( this.outros ).forEach( t => t.start() );
		this.ready = true;
		check( this );
	}
}

function detach ( element ) {
	element.detach();
}

function _detachNodes ( tm ) { // _ to avoid transpiler quirk
	tm.detachNodes();
}

function check ( tm ) {
	if ( !tm.ready || tm.outros.length || tm.outroChildren ) return;

	// If all outros are complete, and we haven't already done this,
	// we notify the parent if there is one, otherwise
	// start detaching nodes
	if ( !tm.outrosComplete ) {
		tm.outrosComplete = true;

		if ( tm.parent && !tm.parent.outrosComplete ) {
			tm.parent.decrementOutros( tm );
		} else {
			tm.detachNodes();
		}
	}

	// Once everything is done, we can notify parent transition
	// manager and call the callback
	if ( !tm.intros.length && !tm.totalChildren ) {
		if ( typeof tm.callback === 'function' ) {
			tm.callback();
		}

		if ( tm.parent && !tm.notifiedTotal ) {
			tm.notifiedTotal = true;
			tm.parent.decrementTotal();
		}
	}
}

// check through the detach queue to see if a node is up or downstream from a
// transition and if not, go ahead and detach it
function detachImmediate ( manager ) {
	const queue = manager.detachQueue;
	const outros = collectAllOutros( manager );

	let i = queue.length;
	let j = 0;
	let node, trans;
	start: while ( i-- ) {
		node = queue[i].node;
		j = outros.length;
		while ( j-- ) {
			trans = outros[j].element.node;
			// check to see if the node is, contains, or is contained by the transitioning node
			if ( trans === node || trans.contains( node ) || node.contains( trans ) ) continue start;
		}

		// no match, we can drop it
		queue[i].detach();
		queue.splice( i, 1 );
	}
}

function collectAllOutros ( manager, _list ) {
	let list = _list;

	// if there's no list, we're starting at the root to build one
	if ( !list ) {
		list = [];
		let parent = manager;
		while ( parent.parent ) parent = parent.parent;
		return collectAllOutros( parent, list );
	} else {
		// grab all outros from child managers
		let i = manager.children.length;
		while ( i-- ) {
			list = collectAllOutros( manager.children[i], list );
		}

		// grab any from this manager if there are any
		if ( manager.outros.length ) list = list.concat( manager.outros );

		return list;
	}
}
