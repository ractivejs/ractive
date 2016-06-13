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
		var list = transition.isIntro ? this.intros : this.outros;
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
	}

	remove ( transition ) {
		var list = transition.isIntro ? this.intros : this.outros;
		removeFromArray( list, transition );
		check( this );
	}

	start () {
		detachImmediate( this );
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
		if ( tm.parent && !tm.parent.outrosComplete ) {
			tm.parent.decrementOutros( tm );
		} else {
			tm.detachNodes();
		}

		tm.outrosComplete = true;
	}

	// Once everything is done, we can notify parent transition
	// manager and call the callback
	if ( !tm.intros.length && !tm.totalChildren ) {
		if ( typeof tm.callback === 'function' ) {
			tm.callback();
		}

		if ( tm.parent ) {
			tm.parent.decrementTotal();
		}
	}
}

// check through the detach queue to see if a node is up or downstream from a
// transition and if not, go ahead and detach it
function detachImmediate ( manager ) {
	const queue = manager.detachQueue;
	const outros = collectAllOutros( manager );

	let i = queue.length, j = 0, node, trans;
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

function collectAllOutros ( manager, list ) {
	if ( !list ) {
		list = [];
		let parent = manager;
		while ( parent.parent ) parent = parent.parent;
		return collectAllOutros( parent, list );
	} else {
		let i = manager.children.length;
		while ( i-- ) {
			list = collectAllOutros( manager.children[i], list );
		}
		list = list.concat( manager.outros );
		return list;
	}
}
