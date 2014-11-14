import defineProperties from 'utils/defineProperties';
import magic from 'config/magic';
import runloop from 'global/runloop';

function createComponentData( parameters, proto ) {
	var ComponentData = getConstructor( parameters, proto );
	return new ComponentData( parameters );
}

function createLegacyData( parameters ) {
	copyMappings( parameters );
	return parameters.data;
}

var create = magic ? createComponentData : createLegacyData;

export default create;

function copyMappings ( parameters ) {
	var mappings = parameters.mappings, key;

	for ( key in mappings ) {
		let mapping = mappings[ key ];
		mapping.trackData = true;

		if( !parameters.writable[ key ] ) {
			parameters.addData( key, mapping.origin.get( mapping.keypath ) );
		}
	}
}

function getConstructor ( parameters, proto ) {
	var protoparams = getParams( proto );

	if ( !protoparams.Constructor || parameters.newKeys.length ) {
		protoparams.Constructor = makeConstructor( parameters, protoparams.defined );
	}

	return protoparams.Constructor;
}

function getParams( proto ) {
	if ( !proto._parameters ) {
		proto._parameters = { defined: {} };
	}
	else if( !proto._parameters.defined ) {
		proto._parameters.defined = {};
	}
	return proto._parameters;
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
		this._writable = options.writable;
	}

	defineProperties( proto = {}, properties );
	proto.constructor = ComponentData;
	ComponentData.prototype = proto;

	return ComponentData;
}
