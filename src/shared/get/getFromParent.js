define([
	'circular',
	'global/runloop',
	'shared/createComponentBinding',
	'shared/get/FailedLookup',
	'Ractive/prototype/shared/replaceData'
], function (
	circular,
	runloop,
	createComponentBinding,
	FailedLookup,
	replaceData
) {

	'use strict';

	var get;

	circular.push( function () {
		get = circular.get;
	});

	return function getFromParent ( child, keypath, options ) {
		var parent, fragment, keypathToTest, value, failedLookup;

		parent = child._parent;

		if ( child._failedLookups[ keypath ] ) {
			return;
		}

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

		// Register a failed lookup, as it's likely that we need to create a binding
		// as soon as this value is initialised (e.g. it's an implicit dependency of
		// an evaluator)
		if ( options && options.isTopLevel ) {
			failedLookup = new FailedLookup( child, parent, keypath, child.component.parentFragment );

			child._failedLookups[ keypath ] = true;
			child._failedLookups.push( failedLookup );

			runloop.addUnresolved( failedLookup );
		}
	};

	function createLateComponentBinding ( parent, child, parentKeypath, childKeypath, value ) {
		replaceData( child, childKeypath, value );
		createComponentBinding( child.component, parent, parentKeypath, childKeypath );
	}

});
