define([
	'config/types',
	'shared/notifyDependants'
], function (
	types,
	notifyDependants
) {

	'use strict';

	return function ( ractive, keypath, newIndices, lengthUnchanged ) {

		var updateDependant;

		ractive._changes.push( keypath );

		updateDependant = function ( dependant ) {
			// references need to get processed before mustaches
			if ( dependant.type === types.REFERENCE ) {
				dependant.update();
			}

			// is this a DOM section?
			else if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
				dependant.merge( newIndices );

			} else {
				dependant.update();
			}
		};

		// Go through all dependant priority levels, finding merge targets
		ractive._deps.forEach( function ( depsByKeypath ) {
			var dependants = depsByKeypath[ keypath ];

			if ( dependants ) {
				dependants.forEach( updateDependant );
			}
		});

		// length property has changed - notify dependants
		// TODO in some cases (e.g. todo list example, when marking all as complete, then
		// adding a new item (which should deactivate the 'all complete' checkbox
		// but doesn't) this needs to happen before other updates. But doing so causes
		// other mental problems. not sure what's going on...
		if ( !lengthUnchanged ) {
			notifyDependants( ractive, keypath + '.length', true );
		}
	};

});
