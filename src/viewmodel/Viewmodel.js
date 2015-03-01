import { create } from 'utils/object';
import adapt from './prototype/adapt';
import addComputed from './prototype/addComputed';
import applyChanges from './prototype/applyChanges';
import capture from './prototype/capture';
import clearCache from './prototype/clearCache';
import compute from './prototype/compute';
import get from './prototype/get';
import getModel from './prototype/getModel';
import { hasModel, tryGetModel } from './prototype/hasModel';
import mark from './prototype/mark';
import merge from './prototype/merge';
import release from './prototype/release';
import reset from './prototype/reset';
import set from './prototype/set';
import smartUpdate from './prototype/smartUpdate';
import teardown from './prototype/teardown';

import RootModel from './model/RootModel';

var Viewmodel = function ( options ) {
	var { adapt, data, ractive, mappings } = options,
		key,
		mapping;

	// TODO is it possible to remove this reference?
	this.ractive = ractive;

	this.adaptors = adapt;
	this.debug = options.debug;
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

	this.modelCache = {};

	// TODO make RootModel class that encapsulates details
	// like DataStore and startContext() call
	this.rootKeypath = new RootModel( this, data );

	// TODO: clean-up/move some of this
	var key, model;
	if ( mappings ) {
		mappings.forEach( mapping => {
			key = mapping.key, model = mapping.model;

			this.modelCache[ key ] = model;

			if ( data && ( key in data ) && model.get() === undefined ) {
				model.set( data[ key ] );
			}
		});
	}

	this.ready = true;
};

Viewmodel.prototype = {
	adapt: adapt,
	addComputed: addComputed,
	applyChanges: applyChanges,
	capture: capture,
	clearCache: clearCache,
	compute: compute,
	get: get,
	getModel: getModel,
	hasModel: hasModel,
	mark: mark,
	merge: merge,
	release: release,
	reset: reset,
	set: set,
	smartUpdate: smartUpdate,
	teardown: teardown,
	tryGetModel: tryGetModel,
};

export default Viewmodel;
