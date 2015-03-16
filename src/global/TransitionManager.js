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

	window.TEST && console.log( 'this.TEST: ', !!parent );
	window.TEST && ( this.TEST = true );

	this.WRONG = window.WRONG;
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
		window.TEST && console.log( 'init' );
		this.ready = true;
		check( this );
	},

	detachNodes: function () {
		if ( this.TEST ) {
			console.log( 'detaching nodes' );

			this.detachQueue.forEach( e => {
				console.log( 'e.node', e.node.outerHTML );
			});
		}
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
	tm.TEST && console.log( 'check' );
	if ( !tm.ready || tm.outros.length || tm.outroChildren ) return;

	// If all outros are complete, and we haven't already done this,
	// we notify the parent if there is one, otherwise
	// start detaching nodes
	if ( !tm.outrosComplete ) {
		tm.TEST && console.log( 'ready ', !!tm.parent );
		//tm.TEST && console.log( 'wrong parent ', tm.parent.WRONG );

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
