define([
	'circular',
	'shared/createComponentBinding',
	'shared/set'
], function (
	circular,
	createComponentBinding,
	set
) {

	'use strict';

	var get;

	circular.push( function () {
		get = circular.get;
	});

	return function getFromParent ( child, keypath ) {
		var parent, fragment, keypathToTest, value;

		parent = child._parent;

		fragment = child.component.parentFragment;
		do {
			if ( !fragment.context ) {
				continue;
			}

			keypathToTest = fragment.context + '.' + keypath;
			value = get( parent, keypathToTest );

			if ( value !== undefined ) {
				createLateComponentBinding( parent, child, keypathToTest, keypath, value );
				return value;
			}
		} while ( fragment = fragment.parent );

		value = get( parent, keypath );
		if ( value !== undefined ) {
			createLateComponentBinding( parent, child, keypath, keypath, value );
			return value;
		}
	};

	function createLateComponentBinding ( parent, child, parentKeypath, childKeypath, value ) {
		set( child, childKeypath, value, true );
		createComponentBinding( child.component, parent, parentKeypath, childKeypath );
	}

});
