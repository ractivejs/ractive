import { addToArray, removeFromArray } from 'utils/array';
import hasChildFor from './shared/hasChildFor';

export default class Watchers {

	constructor ( context ) {
		this.context = context;
		this.watchers = {};
	}

	_notify ( keyWatchers, child ) {
		let watch;
		for ( var i = 0, l = keyWatchers.length; i < l; i++ ) {
			keyWatchers[i]( this.context, child );
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
			this._notify( watchers, child );
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
		var watchers = this._get( key );
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
				this._notify( watchers[ key ] );
			}
		}
	}
}
