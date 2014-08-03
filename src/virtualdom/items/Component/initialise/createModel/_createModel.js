import types from 'config/types';
import parseJSON from 'utils/parseJSON';
import resolveRef from 'shared/resolveRef';
import ComponentParameter from 'virtualdom/items/Component/initialise/createModel/ComponentParameter';
import ReferenceExpressionParameter from 'virtualdom/items/Component/initialise/createModel/ReferenceExpressionParameter';

export default function ( component, defaultData, attributes, toBind ) {
	var data = {}, key, value;

	// some parameters, e.g. foo="The value is {{bar}}", are 'complex' - in
	// other words, we need to construct a string fragment to watch
	// when they change. We store these so they can be torn down later
	component.complexParameters = [];

	for ( key in attributes ) {
		if ( attributes.hasOwnProperty( key ) ) {
			value = getValue( component, key, attributes[ key ], toBind );

			if ( value !== undefined || ( defaultData[ key ] === undefined ) ) {
				data[ key ] = value;
			}
		}
	}

	return data;
}

function getValue ( component, key, template, toBind ) {
	var parameter, parsed, parentInstance, parentFragment, keypath, indexRef;

	parentInstance = component.root;
	parentFragment = component.parentFragment;

	// If this is a static value, great
	if ( typeof template === 'string' ) {
		parsed = parseJSON( template );

		if ( !parsed ) {
			return template;
		}

		return parsed.value;
	}

	// If null, we treat it as a boolean attribute (i.e. true)
	if ( template === null ) {
		return true;
	}

	// Single interpolator?
	if ( template.length === 1 && template[0].t === types.INTERPOLATOR ) {

		// If it's a regular interpolator, we bind to it
		if ( template[0].r ) {
			// Is it an index reference?
			if ( parentFragment.indexRefs && parentFragment.indexRefs[ ( indexRef = template[0].r ) ] !== undefined ) {
				component.indexRefBindings[ indexRef ] = key;
				return parentFragment.indexRefs[ indexRef ];
			}

			// TODO what about references that resolve late? Should these be considered?
			keypath = resolveRef( parentInstance, template[0].r, parentFragment ) || template[0].r;

			// We need to set up bindings between parent and child, but
			// we can't do it yet because the child instance doesn't exist
			// yet - so we make a note instead
			toBind.push({ childKeypath: key, parentKeypath: keypath });
			return parentInstance.viewmodel.get( keypath );
		}

		// If it's a reference expression (e.g. `{{foo[bar]}}`), we need
		// to watch the keypath and create/destroy bindings
		if ( template[0].rx ) {
			parameter = new ReferenceExpressionParameter( component, key, template[0].rx, toBind );
			component.complexParameters.push( parameter );

			parameter.ready = true;
			return parameter.value;
		}
	}

	// We have a 'complex parameter' - we need to create a full-blown string
	// fragment in order to evaluate and observe its value
	parameter = new ComponentParameter( component, key, template );
	component.complexParameters.push( parameter );

	return parameter.value;
}
