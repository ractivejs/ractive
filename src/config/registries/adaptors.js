import createRegistry from 'config/registries/registry';

var adaptorsConfig = createRegistry( {
	name: 'adaptors',
	postExtend: convert
});

function convert ( target, adaptors ) {

	var i, adapt = target.defaults.adapt;

	if ( adaptors && ( i = adapt.length ) ) {
		while ( i-- ) {
			let adaptor = adapt[i];

			if ( typeof adaptor === 'string' ) {
				adapt[i] = adaptors[ adaptor ] || adaptor;
			}
		}
	}

	return adaptors;

}

export default adaptorsConfig;
