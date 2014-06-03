import createRegistry from 'config/registries/registry';

var adaptorsConfig = createRegistry( {
	name: 'adaptors',
	postExtend: extend,
	postInit: init
});

function extend ( Child, adaptors ) {
	convert( Child.defaults, adaptors );
}

function init ( ractive, adaptors ) {
	convert( ractive, adaptors );
}

function convert ( target, adaptors ) {

	var i, adapt = target.adapt;

	if ( !adapt ) { return; }

	if ( typeof adapt === 'string' ) {
		adapt = [ adapt ];
	}

	if ( adaptors && Object.keys( adaptors ).length && ( i = adapt.length ) ) {
		while ( i-- ) {
			let adaptor = adapt[i];

			if ( typeof adaptor === 'string' ) {
				adapt[i] = adaptors[ adaptor ] || adaptor;
			}
		}
	}

	target.adapt = adapt;

}

export default adaptorsConfig;
