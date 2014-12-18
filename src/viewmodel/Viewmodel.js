import { fatal } from 'utils/log';
import { getKeypath } from 'shared/keypaths';
import { create } from 'utils/object';
import adapt from './prototype/adapt';
import applyChanges from './prototype/applyChanges';
import capture from './prototype/capture';
import clearCache from './prototype/clearCache';
import compute from './prototype/compute';
import get from './prototype/get';
import init from './prototype/init';
import map from './prototype/map';
import mark from './prototype/mark';
import merge from './prototype/merge';
import register from './prototype/register';
import release from './prototype/release';
import reset from './prototype/reset';
import set from './prototype/set';
import smartUpdate from './prototype/smartUpdate';
import teardown from './prototype/teardown';
import unregister from './prototype/unregister';

var Viewmodel = function ( options ) {
	var { adapt, data, ractive, computed, mappings } = options,
		key,
		mapping;

	// TODO is it possible to remove this reference?
	this.ractive = ractive;

	this.adaptors = adapt;
	this.debug = options.debug;
	this.onchange = options.onchange;

	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	this.cacheMap = create( null );

	this.deps = {
		computed: create( null ),
		'default': create( null )
	};
	this.depsMap = {
		computed: create( null ),
		'default': create( null )
	};

	this.patternObservers = [];

	this.specials = create( null );

	this.wrapped = create( null );
	this.computations = create( null );

	this.captureGroups = [];
	this.unresolvedImplicitDependencies = [];

	this.changes = [];
	this.implicitChanges = {};
	this.noCascade = {};

	this.data = data;

	// set up explicit mappings
	this.mappings = create( null );
	for ( key in mappings ) {
		this.map( getKeypath( key ), mappings[ key ] );
	}

	if ( data ) {
		// if data exists locally, but is missing on the parent,
		// we transfer ownership to the parent
		for ( key in data ) {
			if ( ( mapping = this.mappings[ key ] ) && mapping.getValue() === undefined ) {
				mapping.setValue( data[ key ] );
			}
		}
	}

	for ( key in computed ) {
		if ( mappings && key in mappings ) {
			fatal( 'Cannot map to a computed property (\'%s\')', key );
		}

		this.compute( getKeypath( key ), computed[ key ] );
	}

	this.ready = true;
};

Viewmodel.prototype = {
	adapt: adapt,
	applyChanges: applyChanges,
	capture: capture,
	clearCache: clearCache,
	compute: compute,
	get: get,
	init: init,
	map: map,
	mark: mark,
	merge: merge,
	register: register,
	release: release,
	reset: reset,
	set: set,
	smartUpdate: smartUpdate,
	teardown: teardown,
	unregister: unregister
};

export default Viewmodel;
