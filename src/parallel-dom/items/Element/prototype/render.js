import create from 'utils/create';
import createElement from 'utils/createElement';
import defineProperty from 'utils/defineProperty';
import noop from 'utils/noop';
import getInnerContext from 'shared/getInnerContext';
import updateLiveQueries from 'parallel-dom/items/Element/initialise/updateLiveQueries';

var updateCss, updateScript;

updateCss = function () {
	var node = this.node, content = this.fragment.toString( true );

	if ( node.styleSheet ) {
		node.styleSheet.cssText = content;
	} else {

		while ( node.hasChildNodes() ) {
			node.removeChild( node.firstChild );
		}

		node.appendChild( document.createTextNode(content) );
	}
};

updateScript = function () {
	if ( !this.node.type || this.node.type === 'text/javascript' ) {
		warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
		// As it happens, we ARE in a position to re-evaluate the code if we wanted
		// to - we could eval() it, or insert it into a fresh (temporary) script tag.
		// But this would be a terrible idea with unpredictable results, so let's not.
	}

	this.node.text = this.fragment.toString( true );
};

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
		// Special case - script tag
		if ( this.lcName === 'script' ) {
			this.bubble = updateScript;
			this.node.text = this.fragment.toString( true ); // bypass warning initially
		}

		else if ( this.lcName === 'style' ) {
			console.log( 'rendering style' );
			this.bubble = updateCss;
			this.bubble();
		}

		else {
			this.node.appendChild( this.fragment.render() );
		}
	}

	// Add proxy event handlers
	// TODO

	// deal with two-way bindings
	if ( root.twoway ) {
		this.bind();

		// Special case - contenteditable
		if ( this.node.getAttribute( 'contenteditable' ) && this.node._ractive.binding ) {
			// We need to update the model
			this.node._ractive.binding.update();
		}
	}

	// name attributes are deferred, because they're a special case - if two-way
	// binding is involved they need to update later. But if it turns out they're
	// not two-way we can update them now
	/*if ( attributes.name && !attributes.name.twoway ) {
		attributes.name.update();
	}*/

	// if this is an <img>, and we're in a crap browser, we may need to prevent it
	// from overriding width and height when it loads the src
	/*if ( this.node.tagName === 'IMG' && ( ( width = this.attributes.width ) || ( height = this.attributes.height ) ) ) {
		this.node.addEventListener( 'load', loadHandler = function () {
			if ( width ) {
				this.node.width = width.value;
			}

			if ( height ) {
				this.node.height = height.value;
			}

			this.node.removeEventListener( 'load', loadHandler, false );
		}, false );
	}*/

	// apply decorator(s)
	if ( this.decorator && this.decorator.fn ) {
		runloop.addDecorator( this.decorator );
	}

	// trigger intro transition
	if ( this.intro ) {
		// TODO
		//executeTransition( template.t0 || template.t1, root, this, true );
	}

	if ( this.node.tagName === 'OPTION' ) {
		// Special case... if this option's parent select was previously
		// empty, it's possible that it should initialise to the value of
		// this option.
		if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) { // it should be!
			selectBinding.deferUpdate();
		}

		// If a value attribute was not given, we need to create one based on
		// the content of the node, so that `<option>foo</option>` behaves the
		// same as `<option value='foo'>foo</option>` with two-way binding
		if ( !attributes.value ) {
			createElementAttribute( this, 'value', template.f );
		}

		// Special case... a select may have had its value set before a matching
		// option was rendered. This might be that option element
		if ( this.node._ractive.value == pNode._ractive.value ) {
			this.node.selected = true;
		}
	}

	if ( this.node.autofocus ) {
		// Special case. Some browsers (*cough* Firefix *cough*) have a problem
		// with dynamically-generated elements having autofocus, and they won't
		// allow you to programmatically focus the element until it's in the DOM
		runloop.focus( this.node );
	}

	updateLiveQueries( this );

	return this.node;
}
