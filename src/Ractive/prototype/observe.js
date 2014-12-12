import { isObject } from 'utils/is';
import getObserverFacade from './observe/getObserverFacade';

export default function Ractive$observe ( keypath, callback, options ) {

	var observers, map, keypaths, i;

	// Allow a map of keypaths to handlers
	if ( isObject( keypath ) ) {
		options = callback;
		map = keypath;

		observers = [];

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath ) ) {
				callback = map[ keypath ];
				observers.push( this.observe( keypath, callback, options ) );
			}
		}

		return {
			cancel: function () {
				while ( observers.length ) {
					observers.pop().cancel();
				}
			}
		};
	}

	// Allow `ractive.observe( callback )` - i.e. observe entire model
	if ( typeof keypath === 'function' ) {
		options = callback;
		callback = keypath;
		keypath = '';

		return getObserverFacade( this, keypath, callback, options );
	}

	keypaths = keypath.split( ' ' );

	// Single keypath
	if ( keypaths.length === 1 ) {
		return getObserverFacade( this, keypath, callback, options );
	}

	// Multiple space-separated keypaths
	observers = [];

	i = keypaths.length;
	while ( i-- ) {
		keypath = keypaths[i];

		if ( keypath ) {
			observers.push( getObserverFacade( this, keypath, callback, options ) );
		}
	}

	return {
		cancel: function () {
			while ( observers.length ) {
				observers.pop().cancel();
			}
		}
	};
}
