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

export default function extend ( extendOptions ) {

	var Parent = this, Child;

	extendOptions = extendOptions || {};

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	if ( extendOptions.prototype instanceof Ractive ) {
		extendOptions = ( extendObject( {}, extendOptions, extendOptions.prototype, extendOptions.defaults ) );
	}

	// create Child constructor
	Child = function ( options ) {
		initChildInstance( this, Child, options || {});
	};


	var proto = create( Parent.prototype );
	proto.constructor = Child;

	var staticProperties = {

		// each component needs a guid, for managing CSS etc
		'_guid': { value: getGuid() },

		//alias prototype as defaults
		defaults: { value: proto },

		//extendable
		extend: { value: extend, writable: true, configurable: true }
	}

	defineProperties( Child, staticProperties );

	// extend configuration
	config.extend( Parent, proto, extendOptions );

	// and any other options...
	extendNonOptions( Parent.prototype, proto, extendOptions );

	Child.prototype = proto;


	return Child;
}

function extendNonOptions ( parent, properties, options ) {

	for ( let key in options ) {

		if ( !config.keys[ key ] && !blacklisted[ key ] && options.hasOwnProperty( key ) ) {

			let member = options[ key ]

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				member = wrapMethod( member, parent[ key ] );
			}

			properties[ key ] = member;

		}
	}
}

