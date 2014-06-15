import create from 'utils/create';
import adapt from 'viewmodel/prototype/adapt';
import capture from 'viewmodel/prototype/capture';
import clearCache from 'viewmodel/prototype/clearCache';
import get from 'viewmodel/prototype/get';
import register from 'viewmodel/prototype/register';
import release from 'viewmodel/prototype/release';
import set from 'viewmodel/prototype/set';
import teardown from 'viewmodel/prototype/teardown';
import unregister from 'viewmodel/prototype/unregister';
import createComputations from 'viewmodel/Computation/createComputations';

import warn from 'utils/warn';
import isArray from 'utils/isArray';

var Viewmodel = function ( ractive ) {
	this.ractive = ractive; // TODO eventually, we shouldn't need this reference

	this.ractive.adapt = combine(
		ractive.constructor.prototype.adapt,
		ractive.adapt ) || [];

	this.ractive.data

	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	this.cacheMap = create( null );

	this.deps = [];
	this.depsMap = create( null );

	this.wrapped = create( null );

	// TODO these are conceptually very similar. Can they be merged somehow?
	this.evaluators = create( null );
	this.computations = create( null );

	this.captured = null;
	this.unresolvedImplicitDependencies = [];

	this.changes = [];
};

Viewmodel.extend = function ( Parent, proto ) {
	proto.adapt = combine(
		Parent.prototype.adapt,
		proto.adapt) || [];
}

function combine ( parent, adapt ) {

	// normalize 'Foo' to [ 'Foo' ]
	parent = arrayIfString( parent );
	adapt = arrayIfString( adapt );

	// no parent? return adapt
	if ( !parent || !parent.length) { return adapt; }

	// no adapt? return 'copy' of parent
	if ( !adapt || !adapt.length ) { return parent.slice() }

	// add parent adaptors to options
	parent.forEach( a => {

		// don't put in duplicates
		if ( adapt.indexOf( a ) === -1 ) {
			adapt.push( a )
		}
	});

	return adapt;
}

function depricate ( options ) {

	var adaptors = options.adaptors;

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( adaptors && isArray( adaptors ) ) {

		warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`.' );

		options.adapt = combine( options.adapt, adaptors );

		delete options.adaptors;
	}
}

function arrayIfString( adapt ) {

	if ( typeof adapt === 'string' ) {
		adapt = [ adapt ];
	}

	return adapt;
}


Viewmodel.prototype = {
	adapt: adapt,
	capture: capture,
	clearCache: clearCache,
	get: get,
	register: register,
	release: release,
	set: set,
	teardown: teardown,
	unregister: unregister,
	// createComputations, in the computations, may call back through get or set
	// of ractive. So, for now, we delay creation of computed from constructor.
	// on option would be to have the Computed class be lazy about using .update()
	compute: function () {
		createComputations( this.ractive, this.ractive.computed );
	}
};

export default Viewmodel;
