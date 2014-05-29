import registries from 'config/registries';
import newreg from 'config/registries/registries';
import create from 'utils/create';
import extend from 'utils/extend';
import isArray from 'utils/isArray';
import isObject from 'utils/isObject';
import initialiseTemplate from 'Ractive/initialise/initialiseTemplate';
import TemplateParser from 'Ractive/initialise/templateParser';

//Template is NOT in registryKeys, it doesn't extend b/c it's a string.
//We're just reusing the logic as it is mostly like a registry
registries = registries.concat(['template']);

export default initialiseRegistries;

//Encapsulate differences between template and other registries
function getExtendOptions ( ractive, options ) {
	var templateParser;
	return {
		// 'default' needs to be quoted as it's a keyword, and will break IE8 otherwise
		'default': {
			getArg: function () { return; },
			extend: function ( defaultValue, optionsValue ) {
				return extend( create( defaultValue ), optionsValue );
			},
			initialValue: function ( registry ) {
				return ractive[ registry ];
			}
		},
		template: {
			getArg: function () {
				if ( !templateParser ) { templateParser = new TemplateParser( ractive.parseOptions ); }
				return templateParser;
			},
			extend: function ( defaultValue, optionsValue ) {
				return optionsValue;
			},
			initialValue: function ( registry ) {
				return options[ registry ];
			}
		}
	};
}

function initialiseRegistries( ractive, defaults, options, initOptions ) {
	var extendOptions = getExtendOptions( ractive, options ),
		registryKeys, changes;


	initOptions = initOptions || {};
	initOptions.newValues = initOptions.newValues || {};

	if ( initOptions.registries ) {
		registryKeys = initOptions.registries.filter(function (key){
			return registries.indexOf( key ) > -1;
		});
	} else {
		registryKeys = registries;
	}


	changes = initialise();



	if ( shouldUpdate('template') ) {
		initialiseTemplate( ractive, defaults, options );
	}

	return changes;

	function shouldUpdate( registry ) {
		return ( !initOptions.updatesOnly && ractive[ registry ] ) ||
			( initOptions.updatesOnly && changes.indexOf(registry) > -1 );
	}

	function initialise () {

		//data goes first as it is primary argument to other function-based registry options
		initialiseRegistry('data');
		if ( !ractive.data ) { ractive.data = {}; }

		//return the changed registries
		return registryKeys.filter( registry => {
				return registry!=='data';
			}).filter( registry => {
				return newreg.keys.indexOf( registry ) === -1
			}).filter( initialiseRegistry );

	}

	function initialiseRegistry ( registry ) {

		if( registry === 'adaptors' ) {
			return;
		}

		var optionsValue = initOptions.newValues[ registry ] || options[ registry ],
			defaultValue = ractive.constructor[ registry ] || defaults[ registry ],
			firstArg = registry==='data' ? optionsValue : ractive.data,
			regOpt = extendOptions[ registry ] || extendOptions['default'],
			initialValue = regOpt.initialValue( registry );

		if( typeof optionsValue === 'function' ) {
			ractive[ registry ] = optionsValue( firstArg, options, regOpt.getArg() );
		}
		else if ( defaultValue ) {
			ractive[ registry ] = ( typeof defaultValue === 'function' )
				? defaultValue( firstArg, options, regOpt.getArg() ) || options[ registry ]
				: regOpt.extend( defaultValue, optionsValue );
		}
		else if ( optionsValue ) {
			ractive[ registry ] = optionsValue;
		}
		else {
			ractive[ registry ] = void 0;
		}

		return isChanged( ractive[ registry ], initialValue);
	}

	function isChanged ( initial, current ) {
		if ( !initial && !current ) { return false; }
		if ( isEmptyObject( initial ) && isEmptyObject( current ) ) { return false; }
		if ( isEmptyArray( initial ) && isEmptyArray( current ) ) { return false; }

		return initial !== current;
	}

	function isEmptyObject ( obj ) {
		return isObject(obj) && !Object.keys(obj).length;
	}

	function isEmptyArray ( arr ) {
		return isArray(arr) && !arr.length;
	}

}
