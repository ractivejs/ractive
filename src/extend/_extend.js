import create from 'utils/create';
import defineProperties from 'utils/defineProperties';
import getGuid from 'utils/getGuid';
import config from 'config/config';
import initChildInstance from 'extend/initChildInstance';
import Viewmodel from 'viewmodel/Viewmodel';
import childOptions from 'extend/childOptions';

export default function extend ( options = {} ) {

	var Parent = this, Child;

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	options = childOptions.toOptions( options );

	// create Child constructor
	Child = function ( options ) {
		initChildInstance( this, Child, options || {});
	};


	var proto = create( Parent.prototype );
	proto.constructor = Child;

	var staticProperties = {

		// each component needs a guid, for managing CSS etc
		_guid: { value: getGuid() },

		//alias prototype as defaults
		defaults: { value: proto },

		//extendable
		extend: { value: extend, writable: true, configurable: true },

		// Parent - for IE8, can't use Object.getPrototypeOf
		_parent: { value: Parent }
	}

	defineProperties( Child, staticProperties );

	// extend configuration
	config.extend( Parent, proto, options );

	Viewmodel.extend( Parent, proto );

	// and any other properties or methods on options...
	childOptions.toPrototype( Parent.prototype, proto, options );

	Child.prototype = proto;


	return Child;
}
