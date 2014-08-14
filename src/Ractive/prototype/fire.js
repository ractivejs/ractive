var sigils, doNothing;

sigils = /^(\**)(.*)/;
doNothing = function () {};

export default function Ractive$fire ( eventName, event ) {
	var args, i, len, name, originalEvent, match, cmp, target, stopBubble = false, bubbleMode, stopEvent = false, subscribers;

	match = sigils.exec(eventName);
	bubbleMode = match[ 1 ].length;
	name = match[ 2 ];

	// find all of the relevant subscribers for this event
	if ( bubbleMode === 0 ) { // no bubble
		subscribers = [ { cmp: this, subs: this._subs[ name ] } ];

		if ( !subscribers[ 0 ].subs ) {
			return;
		}
	} else { // bubble
		target = this;
		subscribers = [];

		while ( !!target ) {
			if ( !!target._subs[ name ] ) {
				subscribers.push( { cmp: target, subs: target._subs[ name ] } );
				if ( bubbleMode === 1 ) target = null;
				else target = target._parent;
			} else {
				target = target._parent;
			}
		}

		if ( !subscribers ) return;

		if ( !!event ) {
			event.cancelBubble = ( bubbleMode === 1 ? doNothing : function () { stopBubble = true; });
		}
	}

	args = Array.prototype.slice.call( arguments, 1 );

	// fire this event on the appropriate component(s)
	for ( cmp of subscribers ) {
		if ( cmp.cmp !== this ) event.component = this;

		for ( i=0, len=cmp.subs.length; i<len; i+=1 ) {
			if ( cmp.subs[ i ].apply( cmp.cmp, args ) === false ) {
				stopEvent = true;
			}
		}

		if ( stopBubble ) break;
	}

	if ( stopEvent && ( originalEvent = event.original ) ) {
		originalEvent.preventDefault && originalEvent.preventDefault();
		originalEvent.stopPropagation && originalEvent.stopPropagation();
	}
}
