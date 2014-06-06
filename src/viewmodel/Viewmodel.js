import get from 'viewmodel/prototype/get';
import set from 'viewmodel/prototype/set';

var Viewmodel = function ( ractive ) {
	this.ractive = ractive;
};

Viewmodel.prototype = {
	get: get,
	set: set
};

export default Viewmodel;
