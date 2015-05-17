import { create } from 'utils/object';
import adapt from './prototype/adapt';
import applyChanges from './prototype/applyChanges';
import capture from './prototype/capture';
import clearCache from './prototype/clearCache';
import get from './prototype/get';
import getContext from './prototype/getContext';
import mark from './prototype/mark';
import merge from './prototype/merge';
import release from './prototype/release';
import reset from './prototype/reset';
import set from './prototype/set';
import smartUpdate from './prototype/smartUpdate';
import teardown from './prototype/teardown';

import RootContext from './context/RootContext';
import ComputedContext from './context/ComputedContext';

var Viewmodel = function ( options ) {
	var { adapt, computations, data, mappings, ractive } = options;

	var key, mapping, context;

	// TODO is it possible to remove this reference?
	this.ractive = ractive;

	this.adaptors = adapt;
	this.onchange = options.onchange;

	this.deps = {
		computed: create( null ),
		'default': create( null )
	};
	this.depsMap = {
		computed: create( null ),
		'default': create( null )
	};
	this.patternObservers = [];

	// TODO: move to singleton/runloop?
	this.captureGroups = [];

	this.unresolvedImplicitDependencies = [];

	this.changes = [];
	this.implicitChanges = {};
	this.noCascade = {};

	this.data = data;

	this.root = new RootContext( this, data );

	this.ready = true;

	// TODO: clean-up/move some of this
	if ( mappings ) {
		mappings.forEach( mapping => {
			context = mapping.model;
			key = mapping.key;

			this.root.addChild( context, key );

			if ( data && ( key in data ) && context.get() === undefined ) {
				context.set( data[ key ] );
			}
		});
	}

	if ( computations ) {
		let computed;
		for( key in computations ) {
			computed = new ComputedContext( key, computations[ key ] );
			this.root.addChild( computed, key );
			// TODO: initial values
			// if ( data[ key ] != null ) {
			// 	...
			// }
		}
	}

};

Viewmodel.prototype = {
	adapt: adapt,
	applyChanges: applyChanges,
	capture: capture,
	clearCache: clearCache,
	get: get,
	getContext: getContext,
	mark: mark,
	merge: merge,
	release: release,
	reset: reset,
	set: set,
	smartUpdate: smartUpdate,
	teardown: teardown,
};

export default Viewmodel;
