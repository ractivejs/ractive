import createRegistry from 'config/registries/registry';
import createComputations from 'Ractive/initialise/computations/createComputations';

var computed = createRegistry( {
	name: 'computed',
	postInit: createComputations
});

export default computed;
