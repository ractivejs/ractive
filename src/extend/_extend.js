import create from 'utils/create';
import defineProperties from 'utils/defineProperties';
import config from 'config/config';
import initialise from 'Ractive/initialise';
import Viewmodel from 'viewmodel/Viewmodel';
import unwrap from 'extend/unwrapExtended';

var uid = 1;

export default function extend ( options = {} ) {
	var Parent = this, Child, proto, staticProperties;

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	options = unwrap( options );

	// create Child constructor
	Child = function ( options, _options ) {
		initialise( this, options, _options );
	};

	proto = create( Parent.prototype );
	proto.constructor = Child;

	staticProperties = {
		// each component needs a unique ID, for managing CSS
		_guid: { value: uid++ },

		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },

		// Parent - for IE8, can't use Object.getPrototypeOf
		_Parent: { value: Parent }
	};

	defineProperties( Child, staticProperties );

	// extend configuration
	config.extend( Parent, proto, options );

	Viewmodel.extend( Parent, proto );

	Child.prototype = proto;

	return Child;
}
