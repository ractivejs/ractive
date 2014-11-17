import circular from 'circular';
import namespaces from 'config/namespaces';
import createElement from 'utils/createElement';
import toArray from 'utils/toArray';
import getEvent from 'parse/converters/element/processDirective';
import bindingHelpers from 'virtualdom/items/Element/prototype/bindingHelpers';
import processBindingAttributes from 'virtualdom/items/Element/prototype/init/processBindingAttributes';

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

	this.baseDirectives = {
		decorator: element.template.o,
		twoway: element.twoway,
		lazy: element.lazy
	};
	this.directives = {};
	this.eventCache = {};
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
		this.items.forEach( i => i.rebind( indexRef, newIndex, oldKeypath, newKeypath ) );
	},

	render: function ( node ) {
		this.node = node;
		this.isSvg = node.namespaceURI === namespaces.svg;

		this.update();
	},

	unbind: function () {
		this.fragment.unbind();
	},

	update: function () {
		var str, attrs;

		str = this.fragment.toString();
		attrs = parseAttributes( str, this.isSvg );

		processDirectives( this, attrs );

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

var eventDirective = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/;
function processDirectives( cond, attrs ) {
	let k, attr, events = {}, event, attrEvents = [], newDirectives;

	// turn attributes into a map and process for binding directives
	newDirectives = processBindingAttributes( undefined, attrs.reduce( ( a, c ) => { a[c.name] = c.value; return a; }, {} ) );

	// find new directives
	k = attrs.length;
	while ( k-- ) {
		attr = attrs[k];
		if ( attr.name === 'decorator' ) {
			newDirectives.decorator = attr.value;
			attrs.splice( k, 1 );
		} else if ( attr.name === 'twoway' || attr.name === 'lazy' ) {
			attrs.splice( k, 1 );
		} else if ( event = eventDirective.exec( attr.name ) ) {
			let names = event[1].split( '-' );
			attrEvents = attrEvents.concat( names );

			if ( event = getEvent( attr.value ) ) {
				attrs.splice( k, 1 );
				for ( k of names ) {
					if ( !cond.eventCache[k] !== attr.value ) {
						cond.eventCache[k] = attr.value;
						events[k] = event;
					}
				}
			}
		}
	}

	// set up events to reset
	let eventsToRemove = [];
	for ( k in events ) {
		eventsToRemove.push( k );
	}

	// check for events that were registered here but no longer here
	for ( k in cond.eventCache ) {
		if ( attrEvents.indexOf( k ) === -1 ) {
			eventsToRemove.push( k );
			delete cond.eventCache[k];
		}
	}

	bindingHelpers.unregisterEventHandlers( cond.element, eventsToRemove );
	bindingHelpers.registerEventHandlers( cond.element, events ).forEach( e => e.render() );

	if ( newDirectives.twoway !== cond.directives.twoway ) {
		if ( newDirectives.twoway === undefined ) {
			// removed twoway directive, so reset to base
			cond.element.twoway = cond.baseDirectives.twoway;
		} else {
			cond.element.twoway = newDirectives.twoway;
		}

		cond.directives.twoway = newDirectives.twoway;
		bindingHelpers.registerTwowayBinding( cond.element );
	}

	if ( newDirectives.lazy !== cond.directives.lazy ) {
		if ( newDirectives.lazy === undefined ) {
			// removerd lazy directive, so reset to base
			cond.element.lazy = cond.baseDirectives.lazy;
		} else {
			cond.element.lazy = newDirectives.lazy;
		}

		cond.directives.lazy = newDirectives.lazy;
		bindingHelpers.updateLaziness( cond.element );
	}

	if ( newDirectives.decorator !== cond.directives.decorator ) {
		// decorator changed
		cond.directives.decorator = newDirectives.decorator;
		bindingHelpers.registerDecorator( cond.element, newDirectives.decorator );
	}
}
