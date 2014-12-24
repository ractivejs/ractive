import { defineProperties } from 'utils/object';
import { magic } from 'config/environment';
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
		definition[ key ] = {
			get: function () {
				let mapping = this._mappings[ key ];

				if ( mapping ) {
					return mapping.getValue();
				} else {
					return this._data[ key ];
				}

			},
			set: function ( value ) {
				let mapping = this._mappings[ key ];

				if ( mapping ) {
					runloop.start();
					mapping.setValue( value );
					runloop.end();
				}
				else {
					this._data[ key ] = value;
				}
			},
			enumerable: true
		};

		return definition;

	}, defined);

	function ComponentData ( options ) {
		this._mappings = options.mappings;
		this._data = options.data || {};
	}

	defineProperties( proto = { toJSON: toJSON }, properties );
	proto.constructor = ComponentData;
	ComponentData.prototype = proto;

	return ComponentData;
}

var reservedKeys = [ '_data', '_mappings' ];

function toJSON() {
	var json = {}, k;

	for ( k in this ) {
		if ( reservedKeys.indexOf( k ) === -1 ) {
			json[k] = this[k];
		}
	}

	return json;
}
