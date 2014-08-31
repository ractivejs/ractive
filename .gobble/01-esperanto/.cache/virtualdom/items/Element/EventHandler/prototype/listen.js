define(['config/config','virtualdom/items/Element/EventHandler/shared/genericHandler','utils/log'],function (config, genericHandler, log) {

	'use strict';
	
	var __export;
	
	var customHandlers = {};
	
	__export = function EventHandler$listen () {
	
		var definition, name = this.name;
	
		if ( this.invalid ) { return; }
	
		if ( definition = config.registries.events.find( this.root, name ) ) {
			this.custom = definition( this.node, getCustomHandler( name ) );
		} else {
			// Looks like we're dealing with a standard DOM event... but let's check
			if ( !( 'on' + name in this.node ) && !( window && 'on' + name in window ) ) {
				log.error({
					debug: this.root.debug,
					message: 'missingPlugin',
					args: {
						plugin: 'event',
						name: name
					}
				});
			}
	
			this.node.addEventListener( name, genericHandler, false );
		}
	
		this.hasListener = true;
	
	};
	
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
	return __export;

});