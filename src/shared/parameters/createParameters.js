import { INTERPOLATOR } from 'config/types';
import { create } from 'utils/object';
import { getKeypath } from 'shared/keypaths';
import parseJSON from 'utils/parseJSON';
import ComplexParameter from './ComplexParameter';
import createComponentData from './createComponentData';
import Mapping from './Mapping';
import ParameterResolver from './ParameterResolver';

export default function createParameters ( component, proto, attributes ) {
	var parameters, data, defined;

	if ( !attributes ) {
		return { data: {} };
	}

	if ( proto.parameters ) {
		defined = getParamsDefinition( proto );
	}

	parameters = new ComponentParameters( component, attributes, defined );
	data = createComponentData( parameters, proto );

	return { data: data, mappings: parameters.mappings };
}

function getParamsDefinition( proto ) {
	if ( !proto._parameters ) {
		proto._parameters = { defined: {} };
	}
	else if( !proto._parameters.defined ) {
		proto._parameters.defined = {};
	}
	return proto._parameters.defined;
}


function ComponentParameters ( component, attributes, defined ) {
	this.component = component;
	this.parentViewmodel = component.root.viewmodel;
	this.data = {};
	this.mappings = create( null );
	this.newKeys = []; // TODO it's not obvious that this does anything?
	this.keys = Object.keys( attributes );

	this.keys.forEach( key => {
		if( defined && !defined[ key ] ) {
			this.newKeys.push( key );
		}
		this.add( getKeypath( key ), attributes[ key ] );
	});
}

ComponentParameters.prototype = {
	add: function ( key, template ) {
		// We have static data
		if ( typeof template === 'string' ) {
			let parsed = parseJSON( template );
			this.addData( key.str, parsed ? parsed.value : template );
		}
		// Empty string
		// TODO valueless attributes also end up here currently
		// (i.e. `<widget bool>` === `<widget bool=''>`) - this
		// is probably incorrect
		else if ( template === 0 ) {
			this.addData( key.str );
		}
		// Interpolators
		else {
			let resolver;
			// Single interpolator
			if ( isSingleInterpolator(template) ) {
				resolver = new ParameterResolver( this, key, template[0]).resolver;
			}
			// We have a 'complex' parameter, e.g.
			// `<widget foo='{{bar}} {{baz}}'/>`
			else {
				resolver = new ComplexParameter( this, key, template );
			}
			this.component.resolvers.push( resolver );
		}
	},

	addData: function ( key, value ) {
		this.data[ key ] = value;
	},

	addMapping: function ( key, keypath ) {
		var mapping;

		// map directly to the source if possible...
		if ( keypath ) {
			mapping = this.parentViewmodel.mappings[ keypath.str ];
		}

		return this.mappings[ key.str ] = new Mapping( key, {
			origin: mapping ? mapping.origin : this.parentViewmodel,
			keypath: mapping ? mapping.keypath : keypath
		});
	}
};

function isSingleInterpolator( template ){
	return template.length === 1 && template[0].t === INTERPOLATOR;
}

