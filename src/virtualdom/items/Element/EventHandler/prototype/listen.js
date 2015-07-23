import { warnOnceIfDebug } from 'utils/log';
import { isJsdom } from 'config/environment';
import { missingPlugin } from 'config/errors';
import genericHandler from '../shared/genericHandler';
import { findInViewHierarchy } from 'shared/registry';

var customHandlers = {},
	touchEvents = {
		touchstart: true,
		touchmove: true,
		touchend: true,
		touchcancel: true,
		//not w3c, but supported in some browsers
		touchleave: true
	};

export default function EventHandler$listen () {
	var definition, name = this.name;

	if ( this.invalid ) { return; }

	if ( definition = findInViewHierarchy( 'events', this.root, name ) ) {
		this.custom = definition( this.node, getCustomHandler( name ) );
	} else {
		// Looks like we're dealing with a standard DOM event... but let's check
		if ( !( 'on' + name in this.node ) && !( window && 'on' + name in window ) && !isJsdom ) {

			// okay to use touch events if this browser doesn't support them
			if ( !touchEvents[ name ] ) {
				warnOnceIfDebug( missingPlugin( name, 'event' ), { node: this.node });
			}

			return;
		}

		this.node.addEventListener( name, genericHandler, false );
	}

	this.hasListener = true;
}

function getCustomHandler ( name ) {
	if ( !customHandlers[ name ] ) {
		customHandlers[ name ] = function ( event ) {
		  	var storage,
  			    handler,
  			    indices,
  	  		  index = {};
  			storage = event.node._ractive;
  			handler = storage.events[name];

  			if (indices = Resolvers_findIndexRefs(handler.element.parentFragment)) {
  				index = Resolvers_findIndexRefs.resolve(indices);
  			}

  			event.index = index;
  			event.keypath = storage.keypath.str;
  			event.context = storage.root.viewmodel.get(storage.keypath);

  			storage.events[name].fire(event);
		};
	}

	return customHandlers[ name ];
}
