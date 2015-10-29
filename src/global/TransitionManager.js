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
		if ( tm.parent ) {
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
