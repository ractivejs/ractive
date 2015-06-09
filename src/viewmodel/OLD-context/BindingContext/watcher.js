import { isArray } from 'utils/is';
import { addToArray, removeFromArray } from 'utils/array';
import { hasChildFor, hasKeys } from './shared/hasChildren';

export function addWatcher ( key, handler, noInit ) {
	const watchers = this.watchers || ( this.watchers = new Watchers( this ) );

	watchers.add( key, handler, noInit );

	if ( key === '*' && !noInit ) {
		this.flushProperties( watchers );
	}
}

export function removeWatcher ( key, handler ) {
	const watchers = this.watchers;

	if ( watchers ) {
		watchers.remove( key, handler );
	}
}

export function flushProperties ( watchers ) {
	const value = this.get();

	if ( isArray( value ) && !this.members ) {
		this.getOrCreateMembers();
	}
	else if ( hasKeys( value ) ) {
		const keys = Object.keys( value );

		let key, context;
		for ( var i = 0, l = keys.length; i < l; i++ ) {
			key = keys[i];
			context = this.findChild( key );
			if ( context ) {
				watchers.notify( key, context );
			}
			else {
				this.join( key );
			}
		}
	}
}

class Watchers {

	constructor ( context ) {
		this.context = context;
		this.watchers = {};
	}

	_notify ( key, keyWatchers, child ) {
		let watcher;
		for ( var i = 0, l = keyWatchers.length; i < l; i++ ) {
			// watchers may unsubscribe in flight
			if ( watcher = keyWatchers[i] ) {
				watcher( this.context, child );
			}
		}
	}

	_get ( key ) {
		const watchers = this.watchers;
		if ( watchers.hasOwnProperty( key ) ) {
			return watchers[ key ];
		}
	}

	_getOrCreate ( key ) {
		const watchers = this._get( key );

		if ( !watchers ) {
			return this.watchers[ key ] = [];
		}

		return watchers;
	}

	notify ( key, child ) {
		const watchers = this._get( key );
		if( watchers ) {
			this._notify( key, watchers, child );
		}
		// wildcard watcher
		if ( key !== '*' ) {
			this.notify( '*', child );
		}
	}

	add ( key, handler ) {
		addToArray( this._getOrCreate( key ), handler );
	}

	remove ( key, handler ) {
		const watchers = this._get( key );
		if( watchers ) {
			removeFromArray( watchers, handler );
		}
	}

	notifyAllMatches () {
		const watchers = this.watchers,
			  value = this.context.get(),
			  keys = Object.keys( watchers );

		let key;

		for( var i = 0, l = keys.length; i < l; i++ ) {
			key = keys[i];
			if ( hasChildFor( value, key ) ) {
				this._notify( key, watchers[ key ] );
			}
		}
	}
}
