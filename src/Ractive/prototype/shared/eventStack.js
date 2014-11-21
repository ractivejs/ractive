var eventStack = {
	enqueue: function( ractive, event ) {
		if ( ractive.event ) {
			ractive._eventQueue = ractive._eventQueue || [];
			ractive._eventQueue.push( ractive.event );
		}
		ractive.event = event;
	},
	dequeue: function( ractive ) {
		if ( ractive._eventQueue && ractive._eventQueue.length ) {
			ractive.event = ractive._eventQueue.pop();
		} else {
			delete ractive.event;
		}
	}
};

export default eventStack;
