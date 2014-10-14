import getUpstreamChanges from 'viewmodel/helpers/getUpstreamChanges';
import notifyPatternObservers from 'viewmodel/prototype/applyChanges/notifyPatternObservers';

var dependantGroups = [ 'observers', 'default' ];

export default function Viewmodel$applyChanges () {
	var self = this,
		changes,
		upstreamChanges,
		upstreamHash,
		hash = {};

	changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	function cascade ( keypath ) {
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
	}

	function mark ( keypath ) {
		self.mark( keypath );
	}

	changes.forEach( cascade );

	upstreamChanges = getUpstreamChanges( changes );
	upstreamChanges.forEach( keypath => {
		var dependants, keys;

		if ( dependants = self.deps.computed[ keypath ] ) {
			dependants.forEach( invalidate );

			keys = dependants.map( getKey );
			keys.forEach( mark );
		}
	});

	this.changes = [];

	// Pattern observers are a weird special case
	if ( this.patternObservers.length ) {
		upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
		changes.forEach( keypath => notifyPatternObservers( this, keypath ) );
	}

	upstreamHash = getUpstreamChangeHash( changes );

	dependantGroups.forEach( group => {
		if ( !this.deps[ group ] ) {
			return;
		}

		for( var changeKeypath in upstreamHash) {
			upstreamHash[ changeKeypath ].forEach( keypath => {
				notifyUpstreamDependants( this, keypath, changeKeypath, group );
			});
		}

		notifyAllDependants( this, changes, group );
	});

	// Return a hash of keypaths to updated values
	changes.forEach( keypath => {
		hash[ keypath ] = this.get( keypath );
	});

	this.implicitChanges = {};
	this.noCascade = {};

	return hash;
}

function getUpstreamChangeHash ( changes ) {

	var sortedKeys, current, next, keep = [], index = 0, upstreamHash = {};

	sortedKeys = changes.slice().sort();

	// keep "top-most" keypath changes,
	// i.e. data, data.foo, data.bar => data
	keep.push( current = sortedKeys[0] );
	while( next = sortedKeys[++index] ){
		if( next.slice(0, current.length) ){
			keep.push( current = next);
		}
	}

	// map upstream changes
	keep.forEach( change => {
		let upstream = getUpstreamChanges( [ change ] );
		if ( upstream.length ) {
			upstreamHash[ change ] = upstream;
		}
	});

	return upstreamHash;
}

function invalidate ( computation ) {
	computation.invalidate();
}

function getKey ( computation ) {
	return computation.key;
}

function notifyUpstreamDependants ( viewmodel, keypath, originalKeypath, groupName ) {
	var dependants, value;

	if ( dependants = findDependants( viewmodel, keypath, groupName ) ) {
		value = viewmodel.get( keypath );

		dependants.forEach( d => {
			// don't "set" the parent value, refine it
			// i.e. not data = value, but data[foo] = fooValue
			if( d.refineValue && keypath !== originalKeypath ) {
				d.refineValue( keypath, originalKeypath );
			}
			else {
				d.setValue( value );
			}
		});
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
	return group ? group[ keypath ] : null;
}
