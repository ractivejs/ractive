import create from 'utils/create';
import clearCache from 'viewmodel/prototype/clearCache';
import get from 'viewmodel/prototype/get';
import register from 'viewmodel/prototype/register';
import set from 'viewmodel/prototype/set';
import unregister from 'viewmodel/prototype/unregister';

var Viewmodel = function ( ractive ) {
	this.ractive = ractive; // TODO eventually, we shouldn't need this reference

	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	this.cacheMap = create( null );
};

Viewmodel.prototype = {
	clearCache: clearCache,
	get: get,
	register: register,
	set: set,
	unregister: unregister
};

export default Viewmodel;
