import getObserver from './Observer';


const segmentsPattern = /(\*|[\w|$|_]+)/g;

class PatternObserver {

	constructor ( rootContext, keypath, callback, options ) {
		this.callback = callback;
		this.options = {
			init: options.init,
			defer: options.defer,
			context: options.context
		};
		this.observers = [];
		this.watchers = [];

		this.processSegment( rootContext, keypath.match( segmentsPattern ), [] );

		// initial processing has happened on line above, which respects init: true.
		// from now on, any Observer added on pattern match should fire right away
		this.options.init = true;
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
				this.observers.push( getObserver( context, this.callback, this.options, keys ) );
			}
			else {
				this.processSegment( context, segments, keys );
			}
		}
	}

	getResolved ( segments, keys ) {
		const remaining = segments.slice(),
			  added = {};

		return ( parent, child ) => {
			var key;

			if ( child.key === '[*]' ) {
				key = child.index;
			}
			else {
				key = child.key;

				// only add one Observer per key!
				if ( added.hasOwnProperty( key ) ) {
					return;
				}
				added[ key ] = true;
			}

			const resolvedKeys = keys.slice();
			resolvedKeys.push( key );

			if ( remaining.length ) {
				this.processSegment( child, remaining, resolvedKeys );
			}
			else {
				this.observers.push( getObserver( child, this.callback, this.options, resolvedKeys ) );
			}
		};
	}

	cancel() {
		const observers = this.observers,
			  watchers = this.watchers;

		var i, l, watcher;

		for ( i = 0, l = watchers.length; i < l; i++ ) {
			watcher = watchers[i];
			watcher.context.removeWatcher( watcher.resolved );
		}

		for ( i = 0, l = observers.length; i < l; i++ ) {
			observers[i].cancel();
		}
	}
}

export default PatternObserver;
