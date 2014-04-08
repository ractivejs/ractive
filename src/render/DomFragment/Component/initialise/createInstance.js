define( function () {

	'use strict';

	return function ( component, Component, data, docFrag, contentDescriptor ) {
		var instance, parentFragment, partials, root, adapt;

		parentFragment = component.parentFragment;
		root = component.root;

		// Make contents available as a {{>content}} partial
		partials = { content: contentDescriptor || [] };

		// Use component default adaptors AND inherit parent adaptors.
		adapt = combineAdaptors( root, Component.defaults.adapt, Component.adaptors );

		instance = new Component({
			el: parentFragment.pNode,
			append: true,
			data: data,
			partials: partials,
			magic: root.magic || Component.defaults.magic,
			modifyArrays: root.modifyArrays,
			_parent: root,
			_component: component,
			adapt: adapt
		});

		if ( docFrag ) {
			// The component may be in the wrong place! This is because we
			// are still populating the document fragment that will be appended
			// to its parent node. So even though the component is *already*
			// a child of the parent node, we need to detach it, then insert
			// it into said document fragment, so that order is maintained
			// (both figuratively and literally).
			instance.insert( docFrag );

			// (After inserting, we need to reset the node reference)
			instance.fragment.pNode = instance.el = parentFragment.pNode;
		}

		return instance;
	};


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

});
