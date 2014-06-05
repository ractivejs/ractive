import create from 'utils/create';
import defineProperties from 'utils/defineProperties';
import getGuid from 'utils/getGuid';
import config from 'config/config';
import extendObject from 'utils/extend';
import initChildInstance from 'extend/initChildInstance';
import circular from 'circular';
import wrapMethod from 'utils/wrapMethod';

var Ractive, blacklisted;

// would be nice to not have these here,
// they get added during initialise, so for now we have
// to make sure not to try and extend them.
// Possibly, we could re-order and not add till later
// in process.
blacklisted = {
	'_parent' : true,
	'_component' : true
}

circular.push( function () {
	Ractive = circular.Ractive;
});

export default function extend ( childProps ) {

	var Parent = this, Child;

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	if ( childProps.prototype instanceof Ractive ) {
		childProps = ( extendObject( {}, childProps, childProps.prototype, childProps.defaults ) );
	}

	// create Child constructor
	Child = function ( options ) {
		initChildInstance( this, Child, options || {});
	};

	Child.prototype = create( Parent.prototype );
	Child.prototype.constructor = Child;
	Child.extend = extend;

	defineProperties( Child, {

		// each component needs a guid, for managing CSS etc
		'_guid': { value: getGuid() },

		// defaults for the Component
		defaults: { value: {} }
	});

	// extend configuration
	config.extend( Parent, Child, childProps );

	// and any other options...
	extendNonOptions( Child, childProps );

	return Child;
}

function extendNonOptions ( Child, options ) {

	for ( let key in options ) {

		if ( !config.keys[ key ] && !blacklisted[ key ] && options.hasOwnProperty( key ) ) {

			let member = options[ key ]

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				member = wrapMethod( member, Child.prototype[ key ] );
			}

			Child.prototype[ key ] = member;

		}
	}
}

