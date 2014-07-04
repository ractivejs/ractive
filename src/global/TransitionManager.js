import removeFromArray from 'utils/removeFromArray';

var TransitionManager = function ( callback, parent ) {
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
	if ( !tm.ready ) return;

	// If all outros are complete, we notify the parent if there
	// is one, otherwise start detaching nodes
	if ( !tm.outros.length && !tm.outroChildren ) {
		if ( !tm.outrosComplete ) {
			if ( tm.parent ) {
				tm.parent.decrementOutros( tm );
			} else {
				tm.detachNodes();
			}
		}

		tm.outrosComplete = true;
	}

	else {
		return;
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
