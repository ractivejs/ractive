import warn from 'utils/warn';
import config from 'config/config';

var alreadyWarned = {}, customHandlers = {};

export default function EventHandler$render () {
	var name = this.name, definition;

	this.node = this.element.node;

	if ( definition = config.registries.events.find( this.root, name ) ) {
		this.custom = definition( this.node, getCustomHandler( name ) );
	} else {
		// Looks like we're dealing with a standard DOM event... but let's check
		if ( !( 'on' + name in this.node ) && !( window && 'on' + name in window ) ) {
			if ( !alreadyWarned[ name ] ) {
				warn( 'Missing "' + this.name + '" event. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#events' );
				alreadyWarned[ name ] = true;
			}
		}

		this.node.addEventListener( name, genericHandler, false );
	}

	// store this on the node itself, so it can be retrieved by a
	// universal handler
	this.node._ractive.events[ name ] = this;
}

function genericHandler ( event ) {
	var storage, handler;

	storage = this._ractive;
	handler = storage.events[ event.type ];

	handler.fire({
		node: this,
		original: event,
		index: storage.index,
		keypath: storage.keypath,
		context: storage.root.get( storage.keypath )
	});
}

function getCustomHandler ( name ) {
	if ( !customHandlers[ name ] ) {
		customHandlers[ name ] = function ( event ) {
			var storage = event.node._ractive;

			event.index = storage.index;
			event.keypath = storage.keypath;
			event.context = storage.root.get( storage.keypath );

			storage.events[ name ].fire( event );
		};
	}

	return customHandlers[ name ];
}
