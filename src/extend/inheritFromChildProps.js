define([
	'extend/registries',
	'extend/initOptions',
	'extend/wrapMethod',
	'extend/utils/augment'
], function (
	registries,
	initOptions,
	wrapMethod,
	augment
) {

	'use strict';

	var blacklist, blacklisted;

	blacklist = registries.concat( initOptions.keys() );
	blacklisted = {};
	blacklist.forEach( function ( property ) {
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

		initOptions.keys().forEach( function ( property ) {
			var value = childProps[ property ];

			if ( value !== undefined ) {
				// we may need to wrap a function (e.g. the `complete` option)
				if ( typeof value === 'function' && typeof Child[ property ] === 'function' ) {
					Child[ property ] = wrapMethod( value, Child[ property ] );
				} else {
					Child[ property ] = childProps[ property ];
				}
			}
		});

		for ( key in childProps ) {

			if ( childProps.hasOwnProperty( key ) && !blacklisted[ key ] ) {
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
	};

});
