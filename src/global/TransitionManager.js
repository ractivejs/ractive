import { removeFromArray } from 'utils/array';
import { teardown } from 'shared/methodCallers';

var TransitionManager = function ( callback, parent ) {
	this.callback = callback;
	this.parent = parent;

	this.intros = [];
	this.outros = [];

	this.children = [];
	this.totalChildren = this.outroChildren = 0;

	this.detachQueue = [];
	this.decoratorQueue = [];
	this.outrosComplete = false;

	if ( parent ) {
		parent.addChild( this );
	}
};

TransitionManager.prototype = {
	addChild: function ( child ) {
		this.children.push( child );

		this.totalChildren += 1;
		this.outroChildren += 1;
	},

	decrementOutros: function () {
		this.outroChildren -= 1;
		check( this );
	},

	decrementTotal: function () {
		this.totalChildren -= 1;
		check( this );
	},

	add: function ( transition ) {
		var list = transition.isIntro ? this.intros : this.outros;
		list.push( transition );
	},

	addDecorator: function ( decorator ) {
		this.decoratorQueue.push( decorator );
	},

	remove: function ( transition ) {
		var list = transition.isIntro ? this.intros : this.outros;
		removeFromArray( list, transition );
		check( this );
	},

	init: function () {
		this.ready = true;
		check( this );
	},

	detachNodes: function () {
		this.decoratorQueue.forEach( teardown );
		this.detachQueue.forEach( detach );
		this.children.forEach( detachNodes );
	}
};

function detach ( element ) {
	element.detach();
}

function detachNodes ( tm ) {
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

export default TransitionManager;
