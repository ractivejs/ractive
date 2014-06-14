import registry from 'config/options/registry';
import createComputations from 'viewmodel/Computation/createComputations';

// TODO this isn't pulling it's weight, remove...
var computed = registry( {
	name: 'computed'
});

export default computed;
