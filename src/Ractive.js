import defaults from 'config/defaults/options';
import easing from 'config/defaults/easing';
import interpolators from 'config/defaults/interpolators';
import svg from 'config/svg';
import defineProperties from 'utils/defineProperties';
import proto from 'Ractive/prototype';
import Promise from 'utils/Promise';
import extend from 'extend/_extend';
import parse from 'parse/_parse';
import initialise from 'Ractive/initialise';
import circular from 'circular';

// Main Ractive required object
var Ractive = function ( options ) {
	initialise( this, options );
};

Ractive.prototype = proto;

// Ractive properties
defineProperties( Ractive, {

	// Shared properties

	// Default options
	defaults:      { value: defaults },

	// Plugins
	// Because these can be assigned functions to resolve at
	// instantiation time, they are writable
	adaptors:      { writable: true, value: {} },
	components:    { writable: true, value: {} },
	decorators:    { writable: true, value: {} },
	easing:        { writable: true, value: easing },
	events:        { writable: true, value: {} },
	interpolators: { writable: true, value: interpolators },
	partials:      { writable: true, value: {} },
	transitions:   { writable: true, value: {} },

	// Support
	svg:           { value: svg },

	VERSION:       { value: '<%= pkg.version %>' }
});

Ractive.prototype.constructor = Ractive;

// Namespaced constructors
Ractive.Promise = Promise;

// Static methods
Ractive.extend = extend;

Ractive.parse = parse;

// Certain modules have circular dependencies. If we were bundling a
// module loader, e.g. almond.js, this wouldn't be a problem, but we're
// not - we're using amdclean as part of the build process. Because of
// this, we need to wait until all modules have loaded before those
// circular dependencies can be required.
circular.Ractive = Ractive;

while ( circular.length ) {
	circular.pop()();
}

// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
// older browsers, these are made available via a shim - here, we do a quick
// pre-flight check to make sure that either a) we're not in a shit browser,
// or b) we're using a Ractive-legacy.js build
var FUNCTION = 'function';

if (
	typeof Date.now !== FUNCTION                 ||
	typeof String.prototype.trim !== FUNCTION    ||
	typeof Object.keys !== FUNCTION              ||
	typeof Array.prototype.indexOf !== FUNCTION  ||
	typeof Array.prototype.forEach !== FUNCTION  ||
	typeof Array.prototype.map !== FUNCTION      ||
	typeof Array.prototype.filter !== FUNCTION   ||
	( typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION )
) {
	throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
}

export default Ractive;
