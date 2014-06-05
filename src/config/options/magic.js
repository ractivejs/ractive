import optionConfig from 'config/options/option';

// TODO: fix our ES6 modules so we can have multiple exports
// then this magic check can be reused by magicAdaptor
var config, noMagic;

try {

	Object.defineProperty({}, 'test', { value: 0 });
}
catch ( err ) {

	noMagic = true; // no magic in this environment :(
}

config = optionConfig( 'magic' );
config.preExtend = config.preInit = validate;

function validate( target, options ) {

	if ( options.magic && noMagic ) {
		throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
	}

}

export default config;
