export default function ( component, Component, data, contentDescriptor ) {
	var instance, parentFragment, partials, root, adapt;

	parentFragment = component.parentFragment;
	root = component.root;

	// Make contents available as a {{>content}} partial
	partials = { content: contentDescriptor || [] };

	// Use component default adaptors AND inherit parent adaptors.
	adapt = combineAdaptors( root, Component.defaults.adapt, Component.adaptors );

	instance = new Component({
		append: true,
		data: data,
		partials: partials,
		magic: root.magic || Component.defaults.magic,
		modifyArrays: root.modifyArrays,
		_parent: root,
		_component: component,
		adapt: adapt
	});

	return instance;
}

function combineAdaptors ( root, defaultAdapt ) {
	var adapt, len, i;

	// Parent adaptors should take precedence, so they go first
	if ( root.adapt.length ) {
		adapt = root.adapt.map( function ( stringOrObject ) {
			if ( typeof stringOrObject === 'object' ) {
				return stringOrObject;
			}

			return root.adaptors[ stringOrObject ] || stringOrObject;
		});
	} else {
		adapt = [];
	}

	// If the component has any adaptors that aren't already included,
	// include them now
	if ( len = defaultAdapt.length ) {
		for ( i = 0; i < len; i += 1 ) {
			if ( adapt.indexOf( defaultAdapt[i] ) === -1 ) {
				adapt.push( defaultAdapt[i] );
			}
		}
	}

	return adapt;
}
