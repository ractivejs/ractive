define(['utils/wrapPrototypeMethod','utils/wrapMethod','config/config','circular'],function (wrapPrototype, wrap, config, circular) {

	'use strict';
	
	var __export;
	
	var Ractive,
		// would be nice to not have these here,
		// they get added during initialise, so for now we have
		// to make sure not to try and extend them.
		// Possibly, we could re-order and not add till later
		// in process.
		blacklisted = {
			'_parent' : true,
			'_component' : true
		},
		childOptions = {
			toPrototype: toPrototype,
			toOptions: toOptions
		},
		registries = config.registries;
	
	config.keys.forEach( function(key ) {return blacklisted[ key ] = true} );
	
	circular.push( function () {
		Ractive = circular.Ractive;
	});
	
	__export = childOptions;
	
	function toPrototype ( parent, proto, options ) {
		for ( var key in options ) {
			if ( !( key in blacklisted ) && options.hasOwnProperty( key ) ) {
				var member = options[ key ];
	
				// if this is a method that overwrites a method, wrap it:
				if ( typeof member === 'function' ) {
					member = wrapPrototype( parent, key, member );
				}
	
				proto[ key ] = member;
			}
		}
	}
	
	function toOptions ( Child ) {
		if ( !( Child.prototype instanceof Ractive ) ) { return Child; }
	
		var options = {};
	
		while ( Child ) {
			registries.forEach( function(r ) {
				addRegistry(
					r.useDefaults ? Child.prototype : Child,
					options, r.name );
			});
	
			Object.keys( Child.prototype ).forEach( function(key ) {
				if ( key === 'computed' ) { return; }
	
				var value = Child.prototype[ key ];
	
				if ( !( key in options ) ) {
					options[ key ] = value._method ? value._method : value;
				}
	
				// is it a wrapped function?
				else if ( typeof options[ key ] === 'function'
						&& typeof value === 'function'
						&& options[ key ]._method ) {
	
					var result, needsSuper = value._method;
	
					if( needsSuper ) { value = value._method; }
	
					// rewrap bound directly to parent fn
					result = wrap( options[ key ]._method, value );
	
	
					if( needsSuper ) { result._method = result; }
	
					options[ key ] = result;
				}
			});
	
			if( Child._parent !== Ractive ) {
				Child = Child._parent;
			} else {
				Child = false;
			}
		}
	
		return options;
	}
	
	function addRegistry ( target, options, name ) {
		var registry, keys = Object.keys( target[ name ] );
	
		if ( !keys.length ) { return; }
	
		if ( !( registry = options[ name ] ) ) {
			registry = options[ name ] = {};
		}
	
		keys
			.filter( function(key ) {return !( key in registry )} )
			.forEach( function(key ) {return registry[ key ] = target[ name ][ key ]} );
	}
	return __export;

});