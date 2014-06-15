import getUpstreamChanges from 'viewmodel/helpers/getUpstreamChanges';
import notifyPatternObservers from 'viewmodel/prototype/applyChanges/notifyPatternObservers';

var unwrap = { evaluateWrapped: true },
	dependantGroups = [ 'observers', 'default' ];

export default function Viewmodel$applyChanges () {
	var self = this,
		changes,
		upstreamChanges,
		allChanges = [],
		computations,
		addComputations,
		cascade;

	if ( !this.changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	addComputations = function ( keypath ) {
		var newComputations;

		if ( newComputations = self.deps.computed[ keypath ] ) {
			addNewItems( computations, newComputations );
		}
	};

	cascade = function ( keypath ) {
		var map;

		addComputations( keypath );

		if ( map = self.depsMap.computed[ keypath ] ) {
			map.forEach( cascade );
		}
	};

	// Find computations and evaluators that are invalidated by
	// these changes. If they have changed, add them to the
	// list of changes. Lather, rinse and repeat until the
	// system is settled
	do {
		changes = this.changes;
		addNewItems( allChanges, changes );

		this.changes = [];
		computations = [];

		upstreamChanges = getUpstreamChanges( changes );
		upstreamChanges.forEach( addComputations );

		changes.forEach( cascade );

		computations.forEach( computation => computation.update() );
	} while ( this.changes.length );

	upstreamChanges = getUpstreamChanges( allChanges );

	// Pattern observers are a weird special case
	if ( this.patternObservers.length ) {
		upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
		allChanges.forEach( keypath => notifyPatternObservers( this, keypath ) );
	}

	dependantGroups.forEach( group => {
		upstreamChanges.forEach( keypath => notifyDependants( this, keypath, group, true ) );
		allChanges.forEach( keypath => notifyDependants( this, keypath, group ) );
	});
}

function notifyDependants ( viewmodel, keypath, group, onlyDirect ) {
	var depsByKeypath = viewmodel.deps[ group ], value, unwrapped;

	if ( !depsByKeypath ) {
		return;
	}

	// update dependants of this keypath
	value = viewmodel.get( keypath );
	unwrapped = viewmodel.get( keypath, unwrap );

	updateAll( depsByKeypath[ keypath ], value, unwrapped );

	// If we're only notifying direct dependants, not dependants
	// of downstream keypaths, then YOU SHALL NOT PASS
	if ( onlyDirect ) {
		return;
	}

	// otherwise, cascade
	cascade( viewmodel.depsMap[ group ][ keypath ], viewmodel, group );
}

function updateAll ( dependants, value, unwrapped ) {
	if ( dependants ) {
		dependants.forEach( d => d.setValue( value, unwrapped ) );
	}
}

function cascade ( childDeps, viewmodel, group ) {
	var i;

	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependants( viewmodel, childDeps[i], group );
		}
	}
}

function addNewItems ( arr, items ) {
	items.forEach( item => {
		if ( arr.indexOf( item ) === -1 ) {
			arr.push( item );
		}
	});
}
