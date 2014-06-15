import optionConfig from 'config/options/baseConfiguration';
import circular from 'circular';

var Ractive;

circular.push( function () {
	Ractive = circular.Ractive;
});

var config = optionConfig( { name: 'debug' } );

config.pre = copyFromConstructor;

function copyFromConstructor( parent, target, options ) {

	// if not explicitly set on options
	if ( !( 'debug' in options ) ) {

		// ok to use Parent.defaults.debug
		if ( 'debug' in parent ) {

			options.debug = parent.debug;
		}

		// Ractive.defaults explicity set
		else if ( Ractive && ( ( Ractive.defaults && Ractive.defaults.debug ) || Ractive.debug ) ) {
			options.debug = true;
		}
	}

}

export default config;
