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

	changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	cascade = function ( keypath ) {
		var map, dependants, keys;

		if ( self.noCascade.hasOwnProperty( keypath ) ) {
			return;
		}

		if ( dependants = self.deps.computed[ keypath ] ) {
			dependants.forEach( invalidate );

			keys = dependants.map( getKey );

			keys.forEach( mark );
			keys.forEach( cascade );
		}

		if ( map = self.depsMap.computed[ keypath ] ) {
			map.forEach( cascade );
		}
	};

	changes.forEach( cascade );
	upstreamChanges = getUpstreamChanges( changes );

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
		notifyAllDependants( this, changes, group );
	});

	// Return a hash of keypaths to updated values
	allChanges.forEach( keypath => {
		hash[ keypath ] = this.get( keypath );
	});

	this.implicitChanges = {};
	this.noCascade = {};
	this.changes = [];

	return hash;


	function mark ( keypath ) {
		self.mark( keypath );
	}
}

function invalidate ( computation ) {
	computation.invalidate();
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

function getKey ( computation ) {
	return computation.key;
}
