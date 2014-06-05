import registry from 'config/options/registry';
import createComputations from 'Ractive/computations/createComputations';

var computed = registry( {
	name: 'computed',
	postInit: createComputations
});

export default computed;
