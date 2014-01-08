define([
	'utils/isArray'
], function (
	isArray
) {

	'use strict';

	var observeOptions = { init: false, debug: true };

	return function ( component, toBind ) {
		var pair, i;

		component.observers = [];

		i = toBind.length;
		while ( i-- ) {
			pair = toBind[i];
			bind( component, pair.parentKeypath, pair.childKeypath );
		}
	};


	function bind ( component, parentKeypath, childKeypath ) {
		var parentInstance, childInstance, settingParent, settingChild, observers, observer, value;

		parentInstance = component.root;
		childInstance = component.instance;

		observers = component.observers;

		observer = parentInstance.observe( parentKeypath, function ( value ) {
			var isSmartUpdate = isArray( value ) && value._ractive && value._ractive.setting;

			if ( !settingParent && !isSmartUpdate ) {
				settingChild = true;
				childInstance.set( childKeypath, value );
				settingChild = false;
			}
		}, observeOptions );

		observers.push( observer );

		if ( childInstance.twoway ) {
			observer = childInstance.observe( childKeypath, function ( value ) {
				if ( !settingChild ) {
					settingParent = true;
					parentInstance.set( parentKeypath, value );
					settingParent = false;
				}
			}, observeOptions );

			observers.push( observer );

			// initialise - in case the component has default data etc
			value = childInstance.get( childKeypath );
			if ( value !== undefined ) {
				parentInstance.set( parentKeypath, value );
			}
		}
	}

});