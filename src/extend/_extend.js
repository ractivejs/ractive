import { create, defineProperties } from 'utils/object';
import config from 'config/config';
import initialise from 'Ractive/initialise';
import unwrap from './unwrapExtended';

var uid = 1;

export default function extend ( options = {} ) {
	var Parent = this, Child, proto;

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	options = unwrap( options );

	// create Child constructor
	Child = function ( options, _options ) {
		initialise( this, options, _options );
	};

	proto = create( Parent.prototype );
	proto.constructor = Child;

	// Static properties
	defineProperties( Child, {
		// each component needs a unique ID, for managing CSS
		_guid: { value: uid++ },

		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },

		// Parent - for IE8, can't use Object.getPrototypeOf
		_Parent: { value: Parent }
	});

	// extend configuration
	config.extend( Parent, proto, options );

	Child.prototype = proto;

	return Child;
}
