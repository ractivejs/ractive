define([
	'utils/defineProperty',
	'shared/get/_get',
	'shared/set'
], function (
	defineProperty,
	get,
	set
) {

	'use strict';

	return function createMagicModeProperties ( component ) {
		var fragment, ractive, context, object, properties, key, i;

		fragment = component.parentFragment;
		ractive = component.root;

		properties = [];

		do {
			context = fragment.context;

			if ( !context ) {
				continue;
			}

			object = ractive.get( context );

			for ( key in object ) {
				if ( !properties[ key ] && object.hasOwnProperty( key ) ) {
					properties.push( key );
					properties[ key ] = true;
				}
			}
		} while ( fragment = fragment.parent );

		for ( key in ractive.data ) {
			properties.push( key );
			properties[ key ] = true;
		}

		i = properties.length;
		while ( i-- ) {
			createAccessors( component.instance, properties[i] );
		}
	};


	function createAccessors ( instance, key ) {
		defineProperty( instance.data, key, {
			get: function () {
				delete instance.data[ key ];
				return get( instance, key );
			},
			set: function ( value ) {
				delete instance.data[ key ];
				set( instance, key, value );
			},
			configurable: true
		});
	}

});