var nameOnly = /^(?:\.?\.\/)*(.*)/;
var parents = /^((?:\.\.\/)*).*/;

export default function Ractive$fire ( eventName ) {
	var args, i, len, subscribers, target, ev, upCount; 

	upCount = eventName.match(parents)[1].split('/').length - 1;

	if ( upCount > 0 ) {
		target = this;
		ev = eventName.match(nameOnly)[1];

		for ( i=0; i<upCount; i+=1 ) {
			if ( !!target ) target = target._parent;
		}

		if ( !!target && typeof target.fire === 'function' ) {
			args = Array.prototype.slice.call(arguments, 1);
			args[ 0 ].parent = target;
			args[ 0 ].child = this;
			args.unshift(ev); // make sure to pass along a non-ancestor event name
			target.fire.apply( target, args );
		}
	} else {
		subscribers = this._subs[ eventName ];

		if ( !subscribers ) {
			return;
		}

		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0, len=subscribers.length; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	}
}
