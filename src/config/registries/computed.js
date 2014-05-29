import createRegistry from 'config/registries/registry';
import createComputations from 'Ractive/initialise/computations/createComputations';

var registry = createRegistry( {
	name: 'computed',
	postInit: createComputations
});

export default registry;
