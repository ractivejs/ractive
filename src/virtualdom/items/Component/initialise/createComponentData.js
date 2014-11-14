import defineProperties from 'utils/defineProperties';
import magic from 'config/magic';

function createComponentData( parameters ) {
	var ComponentData = makeConstructor( parameters );
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
		mapping.legacy = true;

		if( !parameters.writable[ key ] ) {
			parameters.addData( key, mapping.origin.get( mapping.keypath ) );
		}
	}
}

function makeConstructor ( parameters ) {

	var properties, proto;

	properties = parameters.keys.reduce( ( definition, key ) => {

		if ( parameters.mappings[key] ) {
			definition[ key ] = {
				get: function () {
					let mapping = this._mappings[ key ];
					return mapping.origin.get( mapping.keypath );
				},
				set: function ( value ) {
					let mapping = this._mappings[ key ];
					mapping.origin.set( mapping.keypath, value );
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
	}, {});

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
