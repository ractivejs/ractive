import create from 'utils/create';
import adapt from 'viewmodel/prototype/adapt';
import applyChanges from 'viewmodel/prototype/applyChanges';
import capture from 'viewmodel/prototype/capture';
import clearCache from 'viewmodel/prototype/clearCache';
import compute from 'viewmodel/prototype/compute';
import get from 'viewmodel/prototype/get';
import init from 'viewmodel/prototype/init';
import mark from 'viewmodel/prototype/mark';
import merge from 'viewmodel/prototype/merge';
import register from 'viewmodel/prototype/register';
import release from 'viewmodel/prototype/release';
import set from 'viewmodel/prototype/set';
import smartUpdate from 'viewmodel/prototype/smartUpdate';
import teardown from 'viewmodel/prototype/teardown';
import unregister from 'viewmodel/prototype/unregister';
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
	this.ractive = ractive; // TODO eventually, we shouldn't need this reference

	Viewmodel.extend( ractive.constructor, ractive );

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
	mark: mark,
	merge: merge,
	register: register,
	release: release,
	set: set,
	smartUpdate: smartUpdate,
	teardown: teardown,
	unregister: unregister
};

export default Viewmodel;
