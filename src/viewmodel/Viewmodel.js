import create from 'utils/create';
import adapt from 'viewmodel/prototype/adapt';
import clearCache from 'viewmodel/prototype/clearCache';
import get from 'viewmodel/prototype/get';
import register from 'viewmodel/prototype/register';
import set from 'viewmodel/prototype/set';
import unregister from 'viewmodel/prototype/unregister';

var Viewmodel = function ( ractive ) {
	this.ractive = ractive; // TODO eventually, we shouldn't need this reference

	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	this.cacheMap = create( null );

	this.deps = [];
	this.depsMap = create( null );

	this.wrapped = create( null );

	// TODO these are conceptually very similar. Can they be merged somehow?
	this.evaluators = create( null );
	this.computations = create( null );

	this.changes = [];
};

Viewmodel.prototype = {
	adapt: adapt,
	clearCache: clearCache,
	get: get,
	register: register,
	set: set,
	unregister: unregister
};

export default Viewmodel;
