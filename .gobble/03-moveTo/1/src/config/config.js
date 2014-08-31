define(['config/options/css/css','config/options/data','config/defaults/options','config/options/template/template','config/options/groups/parseOptions','config/options/groups/registries','utils/wrapPrototypeMethod','config/deprecate'],function (css, data, defaults, template, parseOptions, registries, wrap, deprecate) {

	'use strict';
	
	var custom, options, config;
	
	custom = {
		data: data,
		template: template,
		css: css
	};
	
	options = Object.keys( defaults )
		.filter( function(key ) {return !registries[ key ] && !custom[ key ] && !parseOptions[ key ]} );
	
	// this defines the order:
	config = [].concat(
		custom.data,
		parseOptions,
		options,
		registries,
		custom.template,
		custom.css
	);
	
	for( var key in custom ) {
		config[ key ] = custom[ key ];
	}
	
	// for iteration
	config.keys = Object.keys( defaults ).concat( registries.map( function(r ) {return r.name} ) ).concat( [ 'css' ] );
	
	config.parseOptions = parseOptions;
	config.registries = registries;
	
	
	function customConfig ( method, key, Parent, instance, options ) {
		custom[ key ][ method ]( Parent, instance, options );
	}
	
	config.extend = function ( Parent, proto, options ) {
		configure( 'extend', Parent, proto, options );
	};
	
	config.init = function ( Parent, ractive, options ) {
		configure( 'init', Parent, ractive, options );
	
		if ( ractive._config ) {
			ractive._config.options = options;
		}
	};
	
	function configure ( method, Parent, instance, options ) {
		deprecate( options );
	
		customConfig( method, 'data', Parent, instance, options );
	
		config.parseOptions.forEach( function(key ) {
			if ( key in options ) {
				instance[ key ] = options[ key ];
			}
		});
	
		for ( var key in options ) {
			if ( key in defaults && !( key in config.parseOptions ) && !( key in custom ) ) {
				var value = options[ key ];
				instance[ key ] = typeof value === 'function'
					? wrap( Parent.prototype, key, value )
					: value;
			}
		}
	
		config.registries.forEach( function(registry ) {
			registry[ method ]( Parent, instance, options );
		});
	
		customConfig( method, 'template', Parent, instance, options );
		customConfig( method, 'css', Parent, instance, options );
	}
	
	config.reset = function ( ractive ) {
		return config.filter( function(c ) {
			return c.reset && c.reset( ractive );
		}).map( function(c ) {return c.name} );
	};
	
	return config;

});