define([
	'config/initOptions',
	'config/registries',
	'utils/defineProperty',
	'extend/wrapMethod',
	'extend/utils/augment',
	'extend/utils/transformCss'
], function (
	initOptions,
	registries,
	defineProperty,
	wrapMethod,
	augment,
	transformCss
) {

	'use strict';

	var blacklisted = {};
	registries.concat( initOptions.keys ).forEach( function ( property ) {
		blacklisted[ property ] = true;
	});

	// This is where we augment the class-level options (inherited from
	// Parent) with the values passed to Parent.extend()

	return function ( Child, childProps ) {
		var key, member;

		registries.forEach( function ( property ) {
			var value = childProps[ property ];

			if ( value ) {
				if ( Child[ property ] ) {
					augment( Child[ property ], value );
				} else {
					Child[ property ] = value;
				}
			}
		});

		initOptions.keys.forEach( function ( key ) {
			var value = childProps[ key ];

			if ( value !== undefined ) {
				// we may need to wrap a function (e.g. the `complete` option)
				if ( typeof value === 'function' && typeof Child[ key ] === 'function' ) {
					Child.defaults[ key ] = wrapMethod( value, Child[ key ] );
				} else {
					Child.defaults[ key ] = childProps[ key ];
				}
			}
		});

		for ( key in childProps ) {
			if ( !blacklisted[ key ] && childProps.hasOwnProperty( key ) ) {
				member = childProps[ key ];

				// if this is a method that overwrites a prototype method, we may need
				// to wrap it
				if ( typeof member === 'function' && typeof Child.prototype[ key ] === 'function' ) {
					Child.prototype[ key ] = wrapMethod( member, Child.prototype[ key ] );
				} else {
					Child.prototype[ key ] = member;
				}
			}
		}

		// Special case - CSS
		if ( childProps.css ) {
			var noCssTransform = Child.hasOwnProperty('noCssTransform')
				? Child.noCssTransform
				: initOptions.defaults.noCssTransform;

			defineProperty( Child, 'css', {
				value: noCssTransform 
					? childProps.css 
					: transformCss( childProps.css, Child._guid )
			});
		}
	};

});
