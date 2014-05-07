import create from 'utils/create';
import createElement from 'utils/createElement';
import defineProperty from 'utils/defineProperty';
import getInnerContext from 'shared/getInnerContext';

export default function Element$render () {
	var root = this.root, node;

	node = this.node = createElement( this.name, this.namespace );

	// Is this a top-level node of a component? If so, we may need to add
	// a data-rvcguid attribute, for CSS encapsulation
	if ( root.css && pNode === root.el ) {
		this.node.setAttribute( 'data-rvcguid', root.constructor._guid || root._guid );
	}

	// Add _ractive property to the node - we use this object to store stuff
	// related to proxy events, two-way bindings etc
	defineProperty( this.node, '_ractive', {
		value: {
			proxy: this,
			keypath: getInnerContext( this.parentFragment ),
			index: this.parentFragment.indexRefs,
			events: create( null ),
			root: root
		}
	});

	// Render attributes
	this.attributes.forEach( function ( attribute ) {
		attribute.render( node );
	});

	// Render children
	if ( this.fragment ) {
		this.node.appendChild( this.fragment.render() );
	}

	return this.node;
}
