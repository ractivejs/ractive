/*global require */

// check we don't accidentally break the build definition such that
// the runtime build includes Ractive.parse
var Ractive = require( '../../ractive.runtime' );
if ( typeof Ractive.parse === 'function' ) {
	throw new Error( 'Runtime build should not include parser' );
}

require( './basic' );
require( './components' );
require( './parse' );
require( './toHTML' );
