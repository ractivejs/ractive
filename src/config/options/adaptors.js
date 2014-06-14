import registry from 'config/options/registry';

var adaptorsConfig = registry( {
	name: 'adaptors',
	postExtend: convert,
	postInit: convert
});

function convert ( target, adaptors ) {

	var i, adapt = target.adapt;

	if ( adapt ) { adapt = adapt.value; }

	if ( !adapt || !adapt.length ) { return adaptors; }


	if ( adaptors && Object.keys( adaptors ).length && ( i = adapt.length ) ) {
		while ( i-- ) {
			let adaptor = adapt[i];

			if ( typeof adaptor === 'string' ) {
				adapt[i] = adaptors[ adaptor ] || adaptor;
			}
		}
	}

	target.adapt = adapt;

	return adaptors;

}

export default adaptorsConfig;
