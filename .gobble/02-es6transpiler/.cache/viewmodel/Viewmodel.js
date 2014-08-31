define(['utils/create','viewmodel/prototype/adapt','viewmodel/prototype/applyChanges','viewmodel/prototype/capture','viewmodel/prototype/clearCache','viewmodel/prototype/get','viewmodel/prototype/mark','viewmodel/prototype/merge','viewmodel/prototype/register','viewmodel/prototype/release','viewmodel/prototype/set','viewmodel/prototype/splice','viewmodel/prototype/teardown','viewmodel/prototype/unregister','viewmodel/Computation/createComputations','viewmodel/adaptConfig'],function (create, adapt, applyChanges, capture, clearCache, get, mark, merge, register, release, set, splice, teardown, unregister, createComputations, adaptConfig) {

	'use strict';
	
	var noMagic;
	
	try {
		Object.defineProperty({}, 'test', { value: 0 });
	}
	catch ( err ) {
		noMagic = true; // no magic in this environment :(
	}
	
	var Viewmodel = function ( ractive ) {
		this.ractive = ractive; // TODO eventually, we shouldn't need this reference
	
		Viewmodel.extend( ractive.constructor, ractive );
	
		//this.ractive.data
	
		this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
		this.cacheMap = create( null );
	
		this.deps = {
			computed: {},
			'default': {}
		};
		this.depsMap = {
			computed: {},
			'default': {}
		};
		this.patternObservers = [];
	
		this.wrapped = create( null );
	
		// TODO these are conceptually very similar. Can they be merged somehow?
		this.evaluators = create( null );
		this.computations = create( null );
	
		this.captured = null;
		this.unresolvedImplicitDependencies = [];
	
		this.changes = [];
		this.implicitChanges = {};
	};
	
	Viewmodel.extend = function ( Parent, instance ) {
	
		if ( instance.magic && noMagic ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}
	
		instance.adapt = adaptConfig.combine(
			Parent.prototype.adapt,
			instance.adapt) || [];
	
		instance.adapt = adaptConfig.lookup( instance, instance.adaptors );
	};
	
	Viewmodel.prototype = {
		adapt: adapt,
		applyChanges: applyChanges,
		capture: capture,
		clearCache: clearCache,
		get: get,
		mark: mark,
		merge: merge,
		register: register,
		release: release,
		set: set,
		splice: splice,
		teardown: teardown,
		unregister: unregister,
		// createComputations, in the computations, may call back through get or set
		// of ractive. So, for now, we delay creation of computed from constructor.
		// on option would be to have the Computed class be lazy about using .update()
		compute: function () {
			createComputations( this.ractive, this.ractive.computed );
		}
	};
	
	return Viewmodel;

});