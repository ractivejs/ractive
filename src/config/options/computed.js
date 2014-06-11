import registry from 'config/options/registry';
import createComputations from 'viewmodel/Computation/createComputations';

// TODO this should be taken care of directly by the viewmodel
var computed = registry( {
	name: 'computed',
	postInit: createComputations
});

export default computed;
