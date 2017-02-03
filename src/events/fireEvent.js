import { enqueue, dequeue } from './eventStack';

const initStars = {};
const bubbleStars = {};

// cartesian product of name parts and stars
// adjusted appropriately for special cases
function variants ( name, initial ) {
	const map = initial ? initStars : bubbleStars;
	if ( map[ name ] ) return map[ name ];

	const parts = name.split( '.' );
	const result = [];
	let base = false;

	// initial events the implicit namespace of 'this'
	if ( initial ) {
		parts.unshift( 'this' );
		base = true;
	}

	// use max - 1 bits as a bitmap to pick a part or a *
	// need to skip the full star case if the namespace is synthetic
	const max = Math.pow( 2, parts.length ) - ( initial ? 1 : 0 );
	for ( let i = 0; i < max; i++ ) {
		const join = [];
		for ( let j = 0; j < parts.length; j++ ) {
			join.push( 1 & ( i >> j ) ? '*' : parts[j] );
		}
		result.unshift( join.join( '.' ) );
	}

	if ( base ) {
		// include non-this-namespaced versions
		if ( parts.length > 2 ) {
			result.push.apply( result, variants( name, false ) );
		} else {
			result.push( '*' );
			result.push( name );
		}
	}

	map[ name ] = result;
	return result;
}

export default function fireEvent ( context, eventName, args = [] ) {
	if ( !eventName ) { return; }

	context.name = eventName;

	const eventNames = context.ractive._nsSubs ? variants( eventName, true ) : [ '*', eventName ];

	return fireEventAs( context, eventNames, args, true );
}

function fireEventAs ( context, eventNames, args, initialFire = false ) {
	let bubble = true;
	const { ractive } = context;

	if ( initialFire || ractive._nsSubs ) {
		enqueue( ractive, context );

		let i = eventNames.length;
		while ( i-- ) {
			if ( eventNames[ i ] in ractive._subs ) {
				bubble = notifySubscribers( context, ractive._subs[ eventNames[ i ] ], args ) && bubble;
			}
		}

		dequeue( ractive );
	}

	if ( ractive.parent && bubble ) {
		if ( initialFire && ractive.component ) {
			const fullName = ractive.component.name + '.' + eventNames[ eventNames.length - 1 ];
			eventNames = variants( fullName, false );

			if ( !context.component ) {
				context.component = ractive;
			}

		}

		context.ractive = ractive.parent;

		bubble = fireEventAs( context, eventNames, args );
	}

	return bubble;
}

function notifySubscribers ( context, subscribers, args ) {
	let stopEvent = false;

	// subscribers can be modified inflight, e.g. "once" functionality
	// so we need to copy to make sure everyone gets called
	subscribers = subscribers.slice();

	for ( let i = 0, len = subscribers.length; i < len; i += 1 ) {
		if ( !subscribers[ i ].off && subscribers[ i ].apply( context, args ) === false ) {
			stopEvent = true;
		}
	}

	if ( context.event && stopEvent ) {
		context.event.preventDefault && context.event.preventDefault();
		context.event.stopPropagation && context.event.stopPropagation();
	}

	return !stopEvent;
}
