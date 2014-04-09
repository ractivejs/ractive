define([
	'config/types',
	'utils/parseJSON',
	'shared/resolveRef',
	'shared/get/_get',
	'render/DomFragment/Component/initialise/createModel/ComponentParameter'
], function (
	types,
	parseJSON,
	resolveRef,
	get,
	ComponentParameter
) {

	'use strict';

	return function ( component, defaultData, attributes, toBind ) {
		var data, key, value;

		data = {};

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
	};

	function getValue ( component, key, descriptor, toBind ) {
		var parameter, parsed, parentInstance, parentFragment, keypath, indexRef;

		parentInstance = component.root;
		parentFragment = component.parentFragment;

		// If this is a static value, great
		if ( typeof descriptor === 'string' ) {
			parsed = parseJSON( descriptor );
			return parsed ? parsed.value : descriptor;
		}

		// If null, we treat it as a boolean attribute (i.e. true)
		if ( descriptor === null ) {
			return true;
		}

		// If a regular interpolator, we bind to it
		if ( descriptor.length === 1 && descriptor[0].t === types.INTERPOLATOR && descriptor[0].r ) {

			// Is it an index reference?
			if ( parentFragment.indexRefs && parentFragment.indexRefs[ ( indexRef = descriptor[0].r ) ] !== undefined ) {
				component.indexRefBindings[ indexRef ] = key;
				return parentFragment.indexRefs[ indexRef ];
			}

			// TODO what about references that resolve late? Should these be considered?
			keypath = resolveRef( parentInstance, descriptor[0].r, parentFragment ) || descriptor[0].r;

			// We need to set up bindings between parent and child, but
			// we can't do it yet because the child instance doesn't exist
			// yet - so we make a note instead
			toBind.push({ childKeypath: key, parentKeypath: keypath });
			return get( parentInstance, keypath );
		}

		// We have a 'complex parameter' - we need to create a full-blown string
		// fragment in order to evaluate and observe its value
		parameter = new ComponentParameter( component, key, descriptor );
		component.complexParameters.push( parameter );

		return parameter.value;
	}

});
