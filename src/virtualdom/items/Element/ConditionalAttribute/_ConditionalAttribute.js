import circular from 'circular';
import namespaces from 'config/namespaces';
import createElement from 'utils/createElement';
import toArray from 'utils/toArray';

var Fragment, div;

if ( typeof document !== 'undefined' ) {
	div = createElement( 'div' );
}

circular.push( function () {
	Fragment = circular.Fragment;
});

var ConditionalAttribute = function ( element, template ) {
	this.element = element;
	this.root = element.root;
	this.parentFragment = element.parentFragment;

	this.attributes = [];

	this.fragment = new Fragment({
		root: element.root,
		owner: this,
		template: [ template ]
	});
};

ConditionalAttribute.prototype = {
	bubble: function () {
		if ( this.node ) {
			this.update();
		}

		this.element.bubble();
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	render: function ( node ) {
		this.node = node;
		this.isSvg = node.namespaceURI = namespaces.svg;

		this.update();
	},

	unbind: function () {
		this.fragment.unbind();
	},

	update: function () {
		var str, attrs;

		str = this.fragment.toString();
		attrs = parseAttributes( str, this.isSvg );

		// any attributes that previously existed but no longer do
		// must be removed
		this.attributes.filter( a => notIn( attrs, a ) ).forEach( a => {
			this.node.removeAttribute( a.name );
		});

		attrs.forEach( a => {
			this.node.setAttribute( a.name, a.value );
		});

		this.attributes = attrs;
	},

	toString: function () {
		return this.fragment.toString();
	}
};

export default ConditionalAttribute;


function parseAttributes ( str, isSvg ) {
	var tag = isSvg ? 'svg' : 'div';
	div.innerHTML = '<' + tag + ' ' + str + '></' + tag + '>';

	return toArray( div.childNodes[0].attributes );
}

function notIn ( haystack, needle ) {
	var i = haystack.length;

	while ( i-- ) {
		if ( haystack[i].name === needle.name ) {
			return false;
		}
	}

	return true;
}
