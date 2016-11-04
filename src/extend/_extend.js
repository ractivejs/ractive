import { create, defineProperties, extend as extendObj } from '../utils/object';
import config from '../Ractive/config/config';
import dataConfigurator from '../Ractive/config/custom/data';
import construct from '../Ractive/construct';
import initialise from '../Ractive/initialise';
import Ractive from '../Ractive';
import unwrapExtended from './unwrapExtended';

export default extend;

function extend ( ...options ) {
	if( !options.length ) {
		return extendOne( this );
	} else {
		return options.reduce( extendOne, this );
	}
}

function extendOne ( Parent, options = {} ) {
	let Child, proto;

	// if we're extending with another Ractive instance...
	//
	//   var Human = Ractive.extend(...), Spider = Ractive.extend(...);
	//   var Spiderman = Human.extend( Spider );
	//
	// ...inherit prototype methods and default options as well
	if ( options.prototype instanceof Ractive ) {
		options = unwrapExtended( options );
	}

	Child = function ( options ) {
		if ( !( this instanceof Child ) ) return new Child( options );

		construct( this, options || {} );
		initialise( this, options || {}, {} );
	};

	proto = create( Parent.prototype );
	proto.constructor = Child;

	// Static properties
	defineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		// extendable
		extend: { value: extend, writable: true, configurable: true },

		// Parent - for IE8, can't use Object.getPrototypeOf
		_Parent: { value: Parent }
	});

	// extend configuration
	config.extend( Parent, proto, options );

	dataConfigurator.extend( Parent, proto, options );

	if ( options.computed ) {
		proto.computed = extendObj( create( Parent.prototype.computed ), options.computed );
	}

	Child.prototype = proto;

	return Child;
}
