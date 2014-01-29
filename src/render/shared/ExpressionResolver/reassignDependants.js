define([
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	registerDependant,
	unregisterDependant
) {

	'use strict';

	return function ( ractive, oldKeypath, newKeypath ) {
		var toReassign, i, dependant;

		toReassign = [];

		gatherDependants( ractive, oldKeypath, toReassign );

		i = toReassign.length;
		while ( i-- ) {
			dependant = toReassign[i];

			unregisterDependant( dependant );
			dependant.keypath = dependant.keypath.replace( oldKeypath, newKeypath );
			registerDependant( dependant );

			dependant.update();
		}
	};

	function cascade ( ractive, oldKeypath, toReassign ) {
		var map, i;

		map = ractive._depsMap[ oldKeypath ];

		if ( !map ) {
			return;
		}

		i = map.length;
		while ( i-- ) {
			gatherDependants( ractive, map[i], toReassign );
		}
	}

	function gatherDependants ( ractive, oldKeypath, toReassign ) {
		var priority, dependantsByKeypath, dependants, i;

		priority = ractive._deps.length;
		while ( priority-- ) {
			dependantsByKeypath = ractive._deps[ priority ];

			if ( dependantsByKeypath ) {
				dependants = dependantsByKeypath[ oldKeypath ];

				if ( dependants ) {
					i = dependants.length;
					while ( i-- ) {
						toReassign.push( dependants[i] );
					}
				}
			}
		}

		cascade( ractive, oldKeypath, toReassign );
	}

});
