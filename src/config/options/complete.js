import baseConfig from 'config/options/baseConfiguration';
import wrapMethod from 'utils/wrapMethod';

var config = baseConfig({
	name: 'complete',
	pre: wrapIfNecessary,
});

function wrapIfNecessary ( Parent, proto, options ) {

	var name = this.name, value = options[ name ], parentValue;

	if ( !value ) { return; }

	parentValue = Parent.prototype[ name ];

	if ( typeof value === 'function' && typeof parentValue === 'function' ) {

			options[ name ] = wrapMethod( value, parentValue );
	}


}



export default config;
