import defineProperties from 'utils/defineProperties';
import magic from 'config/magic';
import runloop from 'global/runloop';


export default function createComponentData ( parameters, proto ) {
	// Don't do anything with data at all..
	if ( !proto.parameters ) {
		return parameters.data;
	}
	// No magic or legacy requested
	else if ( !magic || proto.parameters === 'legacy' ) {
		return createLegacyData( parameters );
	}
	// ES5 ftw!
	return createDataFromPrototype( parameters, proto );
}

function createLegacyData( parameters ) {
	var mappings = parameters.mappings, key;

	for ( key in mappings ) {
		let mapping = mappings[ key ];
		mapping.trackData = true;

		if( !mapping.updatable ) {
			parameters.addData( key, mapping.getValue() );
		}
	}

	return parameters.data;
}

function createDataFromPrototype( parameters, proto ) {
	var ComponentData = getConstructor( parameters, proto );
	return new ComponentData( parameters );
}

function getConstructor ( parameters, proto ) {
	var protoparams = proto._parameters;

	if ( !protoparams.Constructor || parameters.newKeys.length ) {
		protoparams.Constructor = makeConstructor( parameters, protoparams.defined );
	}

	return protoparams.Constructor;
}

function makeConstructor ( parameters, defined ) {

	var properties, proto;

	properties = parameters.keys.reduce( ( definition, key ) => {

		if ( parameters.mappings[key] ) {
			definition[ key ] = {
				get: function () {
					let mapping = this._mappings[ key ];

					// TODO: track this explicitly?
					// also , what about the reverse? or set?
					if ( !mapping ) {
						return this._data[ key ];
					}

					return mapping.origin.get( mapping.keypath );
				},
				set: function ( value ) {
					let mapping = this._mappings[ key ];
					runloop.start();
					mapping.origin.set( mapping.keypath, value );
					runloop.end();
				},
				enumerable: true
			};
		}
		else {
			definition[ key ] = {
				get: function () {
					return this._data[ key ];
				},
				enumerable: true
			};
		}

		return definition;
	}, defined);

	function ComponentData ( options ) {
		this._mappings = options.mappings;
		this._data = options.data || {};
	}

	defineProperties( proto = {}, properties );
	proto.constructor = ComponentData;
	ComponentData.prototype = proto;

	return ComponentData;
}
