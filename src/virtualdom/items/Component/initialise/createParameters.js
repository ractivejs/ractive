import ComplexParameter from 'virtualdom/items/Component/initialise/ComplexParameter';
import createComponentData from 'virtualdom/items/Component/initialise/createComponentData';
import parseJSON from 'utils/parseJSON';
import ParameterResolver from 'virtualdom/items/Component/initialise/ParameterResolver';
import types from 'config/types';

export default function createParameters ( component, attributes) {
	var parameters, data;

	if( !attributes ) {
		return { data: {}, mappings: null };
	}

	parameters = new ComponentParameters( component, attributes );
	data = createComponentData( parameters );

	return { data: data, mappings: parameters.mappings };
}

function ComponentParameters ( component, attributes ) {
	this.component = component;
	this.parentViewmodel = component.root.viewmodel;
	this.data = {};
	this.mappings = {};
	this.writable = {};
	this.keys = Object.keys( attributes );

	this.keys.forEach( key => {
		this.add( key, attributes[ key ] );
	});
}

ComponentParameters.prototype = {

	add: function ( key, template ) {
		// We have static data
		if ( typeof template === 'string' ) {
			this.addStatic( key, template );
		}
		// Empty string
		// TODO valueless attributes also end up here currently
		// (i.e. `<widget bool>` === `<widget bool=''>`) - this
		// is probably incorrect
		else if ( template === 0 ) {
			this.addData( key );
		}
		// Single interpolator
		else if ( template.length === 1 && template[0].t === types.INTERPOLATOR ) {
			this.addReference( key, template[0] );
		}
		// We have a 'complex' parameter, e.g.
		// `<widget foo='{{bar}} {{baz}}'/>`
		else {
			this.addComplex( key, template );
		}
	},

	addData: function ( key, value ) {
		this.data[ key ] = value;
	},

	addWritable: function ( key ) {
		this.writable[ key ] = true;
	},

	addMapping: function ( key, keypath ) {
		return this.mappings[ key ] = {
			origin: this.parentViewmodel,
			keypath: keypath
		};
		// TODO: not sure about reference expressions and such
		// if this would actually work...  need to test
		// return this.mappings[ key ] = {
		// 	origin: this.parentViewmodel.origin( keypath ),
		// 	keypath: keypath
		// };
	},

	addStatic: function ( key, template ) {
		var parsed = parseJSON( template );
		this.addData( key, parsed ? parsed.value : template );
	},

	addComplex: function ( key, template ) {
		var complex = new ComplexParameter( this, key, template );
		this.component.resolvers.push( complex );
	},

	addReference: function ( key, template ) {
		var parameter = new ParameterResolver( this, key, template);
		this.component.resolvers.push( parameter.resolver );
	}
};
