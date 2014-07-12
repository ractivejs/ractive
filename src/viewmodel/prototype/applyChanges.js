import getUpstreamChanges from 'viewmodel/helpers/getUpstreamChanges';
import notifyPatternObservers from 'viewmodel/prototype/applyChanges/notifyPatternObservers';

var dependantGroups = [ 'observers', 'default' ];

export default function Viewmodel$applyChanges () {
	var self = this,
		changes,
		upstreamChanges,
		allChanges = [],
		computations,
		addComputations,
		cascade,
		hash = {};

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

		computations.forEach( updateComputation );
	} while ( this.changes.length );

	upstreamChanges = getUpstreamChanges( allChanges );

	// Pattern observers are a weird special case
	if ( this.patternObservers.length ) {
		upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
		allChanges.forEach( keypath => notifyPatternObservers( this, keypath ) );
	}

	dependantGroups.forEach( group => {
		if ( !this.deps[ group ] ) {
			return;
		}

		upstreamChanges.forEach( keypath => notifyUpstreamDependants( this, keypath, group ) );
		notifyAllDependants( this, allChanges, group );
	});

	// Return a hash of keypaths to updated values
	allChanges.forEach( keypath => {
		hash[ keypath ] = this.get( keypath );
	});

	this.implicitChanges = {};

	return hash;
}

function updateComputation ( computation ) {
	computation.update();
}

function notifyUpstreamDependants ( viewmodel, keypath, groupName ) {
	var dependants, value;

	if ( dependants = findDependants( viewmodel, keypath, groupName ) ) {
		value = viewmodel.get( keypath );
		dependants.forEach( d => d.setValue( value ) );
	}
}

function notifyAllDependants ( viewmodel, keypaths, groupName ) {
	var queue = [];

	addKeypaths( keypaths );
	queue.forEach( dispatch );

	function addKeypaths ( keypaths ) {
		keypaths.forEach( addKeypath );
		keypaths.forEach( cascade );
	}

	function addKeypath ( keypath ) {
		var deps = findDependants( viewmodel, keypath, groupName );

		if ( deps ) {
			queue.push({
				keypath: keypath,
				deps: deps
			});
		}
	}

	function cascade ( keypath ) {
		var childDeps;

		if ( childDeps = viewmodel.depsMap[ groupName ][ keypath ] ) {
			addKeypaths( childDeps );
		}
	}

	function dispatch ( set ) {
		var value = viewmodel.get( set.keypath );
		set.deps.forEach( d => d.setValue( value ) );
	}
}

function findDependants ( viewmodel, keypath, groupName ) {
	var group = viewmodel.deps[ groupName ];
	return group ?  group[ keypath ] : null;
}

function addNewItems ( arr, items ) {
	items.forEach( item => {
		if ( arr.indexOf( item ) === -1 ) {
			arr.push( item );
		}
	});
}
