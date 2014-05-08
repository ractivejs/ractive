import runloop from 'global/runloop';
import warn from 'utils/warn';
import arrayContentsMatch from 'utils/arrayContentsMatch';
import getValueFromCheckboxes from 'shared/getValueFromCheckboxes';
import get from 'shared/get/_get';
import set from 'shared/set';

import MultipleSelectBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/MultipleSelectBinding';
import SelectBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/SelectBinding';
import RadioNameBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/RadioNameBinding';
import CheckboxNameBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/CheckboxNameBinding';
import CheckedBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/CheckedBinding';
import FileListBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/FileListBinding';
import ContentEditableBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/ContentEditableBinding';
import GenericBinding from 'parallel-dom/items/Element/Attribute/prototype/bind/GenericBinding';

var singleMustacheError = 'For two-way binding to work, attribute value must be a single interpolator (e.g. value="{{foo}}")',
	expressionError = 'You cannot set up two-way binding against an expression',
	bindAttribute,
	updateModel,
	updateModelAndView,
	getOptions,
	getBinding,
	inheritProperties;

bindAttribute = function () {
	var node = this.node, interpolator, binding, bindings;

	interpolator = this.interpolator;

	if ( !interpolator ) {
		warn( singleMustacheError );
		return false;
	}

	if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
		warn( expressionError + interpolator.keypath );
		return false;
	}

	// Hmmm. Not sure if this is the best way to handle this ambiguity...
	//
	// Let's say we were given `value="{{bar}}"`. If the context stack was
	// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
	// keypath would be `foo.bar`. Then, any user input would result in
	// `foo.bar` being updated.
	//
	// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
	// left with an unresolved partial keypath - so we are forced to make an
	// assumption. That assumption is that the input in question should
	// be forced to resolve to `bar`, and any user input would affect `bar`
	// and not `foo.bar`.
	//
	// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
	// be explicit when using two-way data-binding about what keypath you're
	// updating. Using it in lists is probably a recipe for confusion...
	if ( !interpolator.keypath ) {
		//TODO: What about kx?
		interpolator.resolve( interpolator.template.r );
	}
	this.keypath = interpolator.keypath;

	binding = getBinding( this );

	if ( !binding ) {
		return false;
	}

	node._ractive.binding = this.element.binding = binding;
	this.twoway = true;

	// register this with the root, so that we can force an update later
	bindings = this.root._twowayBindings[ this.keypath ] || ( this.root._twowayBindings[ this.keypath ] = [] );
	bindings.push( binding );

	return true;
};

getBinding = function ( attribute ) {
	var node = attribute.node;

	if ( node.tagName === 'SELECT' ) {
		return ( node.multiple ? new MultipleSelectBinding( attribute, node ) : new SelectBinding( attribute, node ) );
	}

	if ( node.type === 'checkbox' || node.type === 'radio' ) {
		if ( attribute.propertyName === 'name' ) {
			if ( node.type === 'checkbox' ) {
				return new CheckboxNameBinding( attribute, node );
			}

			if ( node.type === 'radio' ) {
				return new RadioNameBinding( attribute, node );
			}
		}

		if ( attribute.propertyName === 'checked' ) {
			return new CheckedBinding( attribute, node );
		}

		return null;
	}

	if ( attribute.lcName !== 'value' ) {
		throw new Error( 'Attempted to set up an illegal two-way binding. This error is unexpected - if you can, please file an issue at https://github.com/RactiveJS/Ractive, or contact @RactiveJS on Twitter. Thanks!' );
	}

	if ( node.type === 'file' ) {
		return new FileListBinding( attribute, node );
	}

	if ( node.getAttribute( 'contenteditable' ) ) {
		return new ContentEditableBinding( attribute, node );
	}

	return new GenericBinding( attribute, node );
};

export default bindAttribute;
