import Hook from './Hook';

function HookQueue ( event ) {
	this.hook = new Hook( event );
	this.inProcess = {};
	this.queue = {};
}

HookQueue.prototype = {

	constructor: HookQueue,

	begin: function ( ractive ) {
		this.inProcess[ ractive._guid ] = true;
	},

	end: function ( ractive ) {

		var parent = ractive.parent;

		// If this is *isn't* a child of a component that's in process,
		// it should call methods or fire at this point
		if ( !parent || !this.inProcess[ parent._guid ] ) {
			fire( this, ractive );
		}
		// elsewise, handoff to parent to fire when ready
		else {
			getChildQueue( this.queue, parent ).push( ractive );
		}

		delete this.inProcess[ ractive._guid ];
	}
};

function getChildQueue ( queue, ractive ) {
	return queue[ ractive._guid ] || ( queue[ ractive._guid ] = [] );
}

function fire ( hookQueue, ractive ) {

	var childQueue = getChildQueue( hookQueue.queue, ractive );

	hookQueue.hook.fire( ractive );

	// queue is "live" because components can end up being
	// added while hooks fire on parents that modify data values.
	while ( childQueue.length ) {
		fire( hookQueue, childQueue.shift() );
	}

	delete hookQueue.queue[ ractive._guid ];
}


export default HookQueue;
