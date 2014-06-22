import removeFromArray from 'utils/removeFromArray';

var TransitionManager = function ( callback, previous ) {
	this.callback = callback;
	this.previous = previous;

	this.list = [];
	this.detachQueue = [];

	if ( previous ) {
		previous.add( this );
	}
};

TransitionManager.prototype = {
	add: function ( transition ) {
		this.list.push( transition );
	},

	remove: function ( transition ) {
		removeFromArray( this.list, transition );
		check( this );
	},

	init: function () {
		this.ready = true;
		check( this );
	}
};

function check ( transitionManager ) {
	if ( !transitionManager.ready ) return;

	if ( !transitionManager.list.length ) {
		transitionManager.detachQueue.forEach( detach );

		if ( typeof transitionManager.callback === 'function' ) {
			transitionManager.callback();
		}

		if ( transitionManager.previous ) {
			transitionManager.previous.remove( transitionManager );
		}
	}
}

function detach ( element ) {
	element.detach();
}

export default TransitionManager;
