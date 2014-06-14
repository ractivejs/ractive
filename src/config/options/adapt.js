import warn from 'utils/warn';
import isArray from 'utils/isArray';
import defaults from 'config/defaults/options';

var config = {
	name: 'adapt',
	extend: extend,
	init: init,
	useDefaults: defaults.hasOwnProperty('adapt')
};

function extend ( Parent, Child, options ) {

	var result;

	depricate( options );

	result = combine( Parent.defaults.adapt, options.adapt );

	Child.adapt = result || [];
}

function init ( Parent, ractive, options ) {

	depricate( options );

	ractive.adapt = combine( Parent.defaults.adapt, options.adapt ) || [];
}

function combine ( parent, option ) {

	// normalize 'Foo' to [ 'Foo' ]
	parent = arrayIfString( parent );
	option = arrayIfString( option );

	// no parent? return option
	if ( !parent || !parent.length) { return option; }

	// no option? return 'copy' of parent
	if ( !option || !option.length ) { return parent.slice() }

	// add parent adaptors to options
	parent.forEach( a => {

		// don't put in duplicates
		if ( option.indexOf( a ) === -1 ) {
			option.push( a )
		}
	});

	return option;
}

function depricate ( options ) {

	var adaptors = options.adaptors;

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( adaptors && isArray( adaptors ) ) {

		warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`.' );

		options.adapt = combine( options.adapt, adaptors );

		delete options.adaptors;
	}
}

function arrayIfString( adapt ) {

	if ( typeof adapt === 'string' ) {
		adapt = [ adapt ];
	}

	return adapt;
}

export default config;
