import runloop from 'global/runloop';
import { isEqual } from 'utils/is';
import getPattern from './getPattern';
import Observer from './Observer';


const segmentsPattern = /(\*|[\w|$|_]+)/g;

class PatternObserver {

	constructor ( rootContext, keypath, callback, options ) {
		this.callback = callback;
		this.options = options;
		this.observers = [];
		this.watchers = [];

		this.processSegment( rootContext, keypath.match( segmentsPattern ), [] );
	}

	processSegment ( context, segments, keys ) {
		segments = segments.slice();
		const segment = segments.shift();

		if ( segment === '*' ) {
			let resolved = this.getResolved( segments, keys );
			this.watchers.push( { context, resolved } );
			context.addWatcher( '*', resolved );
		}
		else {
			context = context.join( segment );
			if ( !segments.length ) {
				this.observers.push( new Observer( context, this.callback, this.options, keys ) );
			}
			else {
				this.processSegment( context, segments, keys );
			}
		}
	}

	getResolved ( segments, keys ) {
		const remaining = segments.slice();

		return ( parent, child ) => {

			const resolvedKeys = keys.slice();
			resolvedKeys.push( child.key );

			if ( remaining.length ) {
				this.processSegment( child, remaining, resolvedKeys );
			}
			else {
				this.observers.push( new Observer( child, this.callback, this.options, resolvedKeys ) );
			}
		};
	}

	cancel() {
		const observers = this.observers,
			  watchers = this.watchers;

		var i, l, watcher;

		for ( i = 0, l = watchers.length; i < l; i++ ) {
			watcher = watcherss[i];
			watcher.context.removeWatcher( watcher.resolved );
		}

		for ( i = 0, l = observers.length; i < l; i++ ) {
			observers[i].cancel();
		}
	}
}

export default PatternObserver;
