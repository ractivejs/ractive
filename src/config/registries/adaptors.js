import createRegistry from 'config/registries/registry';

var adaptorsConfig = createRegistry( {
	name: 'adaptors',
	postExtend: extend,
	postInit: init
});

function extend ( Child, adaptors ) {
	return convert( Child.defaults, adaptors );
}

function init ( ractive, adaptors ) {
	return convert( ractive, adaptors );
}

function convert ( target, adaptors ) {

	var i, adapt = target.adapt;

	if ( typeof adapt === 'string' ) {
		adapt = [ adapt ];
	}

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
