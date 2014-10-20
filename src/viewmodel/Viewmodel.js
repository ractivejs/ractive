import create from 'utils/create';
import adapt from 'viewmodel/prototype/adapt';
import applyChanges from 'viewmodel/prototype/applyChanges';
import capture from 'viewmodel/prototype/capture';
import clearCache from 'viewmodel/prototype/clearCache';
import compute from 'viewmodel/prototype/compute';
import get from 'viewmodel/prototype/get';
import init from 'viewmodel/prototype/init';
import map from 'viewmodel/prototype/map';
import mark from 'viewmodel/prototype/mark';
import merge from 'viewmodel/prototype/merge';
import rebindAll from 'viewmodel/prototype/rebindAll';
import register from 'viewmodel/prototype/register';
import registerSpecial from 'viewmodel/prototype/registerSpecial';
import release from 'viewmodel/prototype/release';
import set from 'viewmodel/prototype/set';
import smartUpdate from 'viewmodel/prototype/smartUpdate';
import teardown from 'viewmodel/prototype/teardown';
import unregister from 'viewmodel/prototype/unregister';
import unregisterSpecial from 'viewmodel/prototype/unregisterSpecial';
import updateSpecials from 'viewmodel/prototype/updateSpecials';
import adaptConfig from 'viewmodel/adaptConfig';

// TODO: fix our ES6 modules so we can have multiple exports
// then this magic check can be reused by magicAdaptor
var noMagic;

try {
	Object.defineProperty({}, 'test', { value: 0 });
}
catch ( err ) {
	noMagic = true; // no magic in this environment :(
}

var Viewmodel = function ( ractive ) {
	var key, mapping;

	this.ractive = ractive; // TODO eventually, we shouldn't need this reference

	Viewmodel.extend( ractive.constructor, ractive );

	// set up explicit mappings
	this.mappings = create( null );
	for ( key in ractive.mappings ) { // TODO shouldn't live on ractive, even temporarily
		mapping = ractive.mappings[ key ];
		this.map( mapping.origin, mapping.keypath, mapping.localKey );
	}

	// if data exists locally, but is missing on the parent,
	// we transfer ownership to the parent
	for ( key in ractive.data ) {
		if ( ( mapping = this.mappings[ key ] ) && mapping.origin.get( mapping.keypath ) === undefined ) {
			mapping.origin.set( mapping.keypath, ractive.data[ key ] );
		}
	}

	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	this.cacheMap = create( null );

	this.deps = {
		mappings: {},
		computed: {},
		'default': {}
	};
	this.depsMap = {
		mappings: {},
		computed: {},
		'default': {}
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
	compute: compute,
	get: get,
	init: init,
	map: map,
	mark: mark,
	merge: merge,
	rebindAll: rebindAll,
	register: register,
	registerSpecial: registerSpecial,
	release: release,
	set: set,
	smartUpdate: smartUpdate,
	teardown: teardown,
	unregister: unregister,
	unregisterSpecial: unregisterSpecial,
	updateSpecials: updateSpecials
};

export default Viewmodel;
