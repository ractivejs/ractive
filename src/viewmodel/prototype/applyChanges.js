import getUpstreamChanges from '../helpers/getUpstreamChanges';
import notifyPatternObservers from './applyChanges/notifyPatternObservers';

export default function Viewmodel$applyChanges () {
	var self = this,
		changes,
		upstreamChanges,
		hash = {},
		bindings;

	changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	function cascade ( keypath ) {
		var map, computations;

		if ( self.noCascade.hasOwnProperty( keypath.str ) ) {
			return;
		}

		if ( computations = self.deps.computed[ keypath.str ] ) {
			computations.forEach( c => {
				var key = c.key;

				if ( c.viewmodel === self ) {
					self.clearCache( key.str );
					c.invalidate();

					changes.push( key );
					cascade( key );
				} else {
					c.viewmodel.mark( key );
				}
			});
		}

		if ( map = self.depsMap.computed[ keypath.str ] ) {
			map.forEach( cascade );
		}
	}

	changes.slice().forEach( cascade );

	upstreamChanges = getUpstreamChanges( changes );
	upstreamChanges.forEach( keypath => {
		var computations;

		// make sure we haven't already been down this particular keypath in this turn
		if ( changes.indexOf( keypath ) === -1 && ( computations = self.deps.computed[ keypath.str ] ) ) {
			this.changes.push( keypath );

			computations.forEach( c => {
				c.viewmodel.mark( c.key );
			});
		}
	});

	this.changes = [];

	// Pattern observers are a weird special case
	if ( this.patternObservers.length ) {
		upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
		changes.forEach( keypath => notifyPatternObservers( this, keypath ) );
	}

	if ( this.deps.observers ) {
		upstreamChanges.forEach( keypath => notifyUpstreamDependants( this, null, keypath, 'observers' ) );
		notifyAllDependants( this, changes, 'observers' );
	}

	if ( this.deps['default'] ) {
		bindings = [];
		upstreamChanges.forEach( keypath => notifyUpstreamDependants( this, bindings, keypath, 'default' ) );

		if( bindings.length ) {
			notifyBindings( this, bindings, changes );
		}

		notifyAllDependants( this, changes, 'default' );
	}

	// Return a hash of keypaths to updated values
	changes.forEach( keypath => {
		hash[ keypath.str ] = this.get( keypath );
	});

	this.implicitChanges = {};
	this.noCascade = {};

	return hash;
}

function notifyUpstreamDependants ( viewmodel, bindings, keypath, groupName ) {
	var dependants, value;

	if ( dependants = findDependants( viewmodel, keypath, groupName ) ) {
		value = viewmodel.get( keypath );

		dependants.forEach( d => {
			// don't "set" the parent value, refine it
			// i.e. not data = value, but data[foo] = fooValue
			if( bindings && d.refineValue ) {
				bindings.push( d );
			}
			else {
				d.setValue( value );
			}
		});
	}
}

function notifyBindings ( viewmodel, bindings, changes ) {

	bindings.forEach( binding => {
		let useSet = false, i = 0, length = changes.length, refinements = [];

		while( i < length ) {
			let keypath = changes[i];

			if ( keypath === binding.keypath ) {
				useSet = true;
				break;
			}

			if ( keypath.slice(0, binding.keypath.length) === binding.keypath ) {
				refinements.push( keypath );
			}

			i++;
		}

		if ( useSet ) {
			binding.setValue( viewmodel.get( binding.keypath ) );
		}

		if( refinements.length ) {
			binding.refineValue( refinements );
		}
	});
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

		if ( childDeps = viewmodel.depsMap[ groupName ][ keypath.str ] ) {
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
	return group ? group[ keypath.str ] : null;
}
