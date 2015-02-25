import { create } from 'utils/object';
import adapt from './prototype/adapt';
import addComputed from './prototype/addComputed';
import applyChanges from './prototype/applyChanges';
import capture from './prototype/capture';
import clearCache from './prototype/clearCache';
import compute from './prototype/compute';
import get from './prototype/get';
import getKeypath from './prototype/getKeypath';
import hasKeypath from './prototype/hasKeypath';
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

	this.keypathCache = {};
	this.rootKeypath = this.getKeypath( '' );


	// TODO: clean-up/move some of this
	var key, keypath;
	if ( mappings ) {
		mappings.forEach( mapping => {
			key = mapping.key, keypath = mapping.keypath;

			if( keypath.unresolved ) { keypath.str = key; }
			this.keypathCache[ key ] = keypath;

			if ( data && ( key in data ) && !keypath.unresolved && keypath.get() === undefined ) {
				keypath.set( data[ key ] );
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
	getKeypath: getKeypath,
	hasKeypath: hasKeypath,
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
