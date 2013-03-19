/*! anglebars - v0.1.6 - 2013-03-19
* http://rich-harris.github.com/Anglebars/
* Copyright (c) 2013 Rich Harris; Licensed WTFPL */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */


(function ( global ) {

"use strict";var Anglebars, getEl;

Anglebars = function ( options ) {

	var defaults, key;

	// Options
	// -------

	if ( options ) {
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}
	}

	defaults = {
		preserveWhitespace: false,
		append: false,
		twoway: true,
		formatters: {},
		modifyArrays: true
	};

	for ( key in defaults ) {
		if ( this[ key ] === undefined ) {
			this[ key ] = defaults[ key ];
		}
	}


	// Initialization
	// --------------

	if ( this.el !== undefined ) {
		this.el = getEl( this.el ); // turn ID string into DOM element
	}

	// Set up event bus
	this._subs = {};

	if ( this.viewmodel === undefined ) {
		this.viewmodel = new Anglebars.ViewModel();
	}

	// bind viewmodel to this anglebars instance
	this.viewmodel.dependents.push( this );

	// Initialise (or update) viewmodel with data
	if ( this.data ) {
		this.viewmodel.set( this.data );
	}

	// If we were given uncompiled partials, compile them
	if ( this.partials ) {
		for ( key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				if ( typeof this.partials[ key ] === 'string' ) {
					if ( !Anglebars.compile ) {
						throw new Error( 'Missing Anglebars.compile - cannot compile partial "' + key + '". Either precompile or use the version that includes the compiler' );
					}

					this.partials[ key ] = Anglebars.compile( this.partials[ key ], this ); // all compiler options are present on `this`, so just passing `this`
				}
			}
		}
	}

	// Compile template, if it hasn't been compiled already
	if ( typeof this.template === 'string' ) {
		if ( !Anglebars.compile ) {
			throw new Error( 'Missing Anglebars.compile - cannot compile template. Either precompile or use the version that includes the compiler' );
		}

		this.template = Anglebars.compile( this.template, this );
	}

	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, callback: this.callback, append: this.append });
	}
};



// Prototype methods
// =================
Anglebars.prototype = {

	// Render instance to element specified here or at initialization
	render: function ( options ) {
		var el = ( options.el ? getEl( options.el ) : this.el );

		if ( !el ) {
			throw new Error( 'You must specify a DOM element to render to' );
		}

		// Clear the element, unless `append` is `true`
		if ( !options.append ) {
			el.innerHTML = '';
		}

		if ( options.callback ) {
			this.callback = options.callback;
		}

		// Render our *root fragment*
		this.rendered = new Anglebars.DomFragment({
			model: this.template,
			anglebars: this,
			parentNode: el
		});
	},

	// Teardown. This goes through the root fragment and all its children, removing observers
	// and generally cleaning up after itself
	teardown: function () {
		this.rendered.teardown();
	},

	// Proxies for viewmodel `set`, `get`, `update`, `observe` and `unobserve` methods
	set: function () {
		var oldDisplay = this.el.style.display;

		this.viewmodel.set.apply( this.viewmodel, arguments );

		return this;
	},

	get: function () {
		return this.viewmodel.get.apply( this.viewmodel, arguments );
	},

	update: function () {
		this.viewmodel.update.apply( this.viewmodel, arguments );
		return this;
	},

	// Internal method to format a value, using formatters passed in at initialization
	_format: function ( value, formatters ) {
		var i, numFormatters, formatter, name, args, fn;

		// If there are no formatters, groovy - just return the value unchanged
		if ( !formatters ) {
			return value;
		}

		// Otherwise go through each in turn, applying sequentially
		numFormatters = formatters.length;
		for ( i=0; i<numFormatters; i+=1 ) {
			formatter = formatters[i];
			name = formatter.name;
			args = formatter.args || [];

			// If a formatter was passed in, use it, otherwise see if there's a default
			// one with this name
			fn = this.formatters[ name ] || Anglebars.formatters[ name ];

			if ( fn ) {
				value = fn.apply( this, [ value ].concat( args ) );
			}
		}

		return value;
	}
};





// helper functions
getEl = function ( input ) {
	var output;

	if ( !input ) {
		throw new Error( 'No container element specified' );
	}

	// We already have a DOM node - no work to do
	if ( input.tagName ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		// try ID first
		output = document.getElementById( input );

		// then as selector, if possible
		if ( !output && document.querySelector ) {
			output = document.querySelector( input );
		}

		// did it work?
		if ( output.tagName ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].tagName ) {
		return input[0];
	}

	throw new Error( 'Could not find container element' );
};

// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
Anglebars.isArray = function ( obj ) {
	return Object.prototype.toString.call( obj ) === '[object Array]';
};

Anglebars.isObject = function ( obj ) {
	return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
};
// Mustache types, used in various places
Anglebars.types = {
	TEXT:             1,
	INTERPOLATOR:     2,
	TRIPLE:           3,
	SECTION:          4,
	INVERTED:         5,
	CLOSING:          6,
	ELEMENT:          7,
	PARTIAL:          8,
	COMMENT:          9,
	DELIMCHANGE:      10,
	MUSTACHE:         11,
	TAG:              12,
	ATTR_VALUE_TOKEN: 13
};
(function ( proto ) {

	'use strict';

	proto.on = function ( eventName, callback ) {
		var self = this, subscribers;

		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}

		return {
			cancel: function () {
				self.off( eventName, callback );
			}
		};
	};

	proto.off = function ( eventName, callback ) {
		var subscribers, index;

		// if no callback specified, remove all callbacks
		if ( !callback ) {
			// if no event name specified, remove all callbacks for all events
			if ( !eventName ) {
				this._subs = {};
			} else {
				this._subs[ eventName ] = [];
			}
		}

		subscribers = this._subs[ eventName ];

		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	proto.fire = function ( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];

		if ( !subscribers ) {
			return;
		}

		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0, len=subscribers.length; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	};

}( Anglebars.prototype ));
// Default formatters
Anglebars.formatters = {
	equals: function ( a, b ) {
		return a === b;
	},

	greaterThan: function ( a, b ) {
		return a > b;
	},

	greaterThanEquals: function ( a, b ) {
		return a >= b;
	},

	lessThan: function ( a, b ) {
		return a < b;
	},

	lessThanEquals: function ( a, b ) {
		return a <= b;
	}
};
(function ( A ) {

	var arrayPointer, splitKeypath, keypathNormaliser;

	// ViewModel constructor
	A.ViewModel = function ( data ) {
		// Initialise with supplied data, or create an empty object
		this.data = data || {};

		// Create empty array for keypaths that can't be resolved initially
		this.pendingResolution = [];

		// Create empty object for observers
		this.observers = {};

		// Dependent Anglebars instances
		this.dependents = [];
	};

	A.ViewModel.prototype = {

		// Update the `value` of `keypath`, and notify the observers of
		// `keypath` and its descendants
		set: function ( keypath, value ) {
			var k, keys, key, obj, i, unresolved, fullKeypath;

			// Allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k] );
					}
				}

				return;
			}

			// fire events
			this.dependents.forEach( function ( dep ) {
				if ( dep.setting ) {
					return; // short-circuit any potential infinite loops
				}

				dep.setting = true;
				dep.fire( 'set', keypath, value );
				dep.fire( 'set:' + keypath, value );
				dep.setting = false;
			});	


			// Split key path into keys (e.g. `'foo.bar[0]'` -> `['foo','bar',0]`)
			keys = splitKeypath( keypath );

			// TODO accommodate implicit array generation
			obj = this.data;
			while ( keys.length > 1 ) {
				key = keys.shift();
				obj = obj[ key ] || {};
			}

			key = keys[0];

			obj[ key ] = value;

			// Trigger updates of views that observe `keypaths` or its descendants
			this._notifyObservers( keypath, value );

			// See if we can resolve any of the unresolved keypaths (if such there be)
			i = this.pendingResolution.length;
			while ( i-- ) { // Work backwards, so we don't go in circles!
				unresolved = this.pendingResolution.splice( i, 1 )[0];

				fullKeypath = this.getFullKeypath( unresolved.view.model.ref, unresolved.view.contextStack );

				// If we were able to find a keypath, initialise the view
				if ( fullKeypath !== undefined ) {
					unresolved.callback( fullKeypath );
				}

				// Otherwise add to the back of the queue (this is why we're working backwards)
				else {
					this.registerUnresolvedKeypath( unresolved );
				}
			}
		},

		// Get the current value of `keypath`
		get: function ( keypath ) {
			var keys, result;

			if ( !keypath ) {
				return undefined;
			}

			keys = splitKeypath( keypath );

			result = this.data;
			while ( keys.length ) {
				if ( result ) {
					result = result[ keys.shift() ];
				}

				if ( result === undefined ) {
					return result;
				}
			}

			return result;
		},

		// Force notify observers of `keypath` (useful if e.g. an array or object member
		// was changed without calling `anglebars.set()`)
		update: function ( keypath ) {
			if ( keypath ) {
				this._notifyObservers( keypath, this.get( keypath ) );
			}

			// no keypath? update all the things
			else {
				for ( keypath in this.data ) {
					if ( this.data.hasOwnProperty( keypath ) ) {
						this._notifyObservers( keypath, this.get( keypath ) );
					}
				}
			}
		},

		registerView: function ( view ) {
			var self = this, fullKeypath, initialUpdate, value, index;

			if ( view.parentFragment && ( view.model.ref in view.parentFragment.indexRefs ) ) {
				// this isn't a real keypath, it's an index reference
				index = view.parentFragment.indexRefs[ view.model.ref ];

				value = ( view.model.fmtrs ? view.anglebars._format( index, view.model.fmtrs ) : index );
				view.update( value );

				return; // this value will never change, and doesn't have a keypath
			}

			initialUpdate = function ( keypath ) {
				view.keypath = keypath;

				// create observers
				view.observerRefs = self.observe({
					keypath: keypath,
					priority: view.model.p || 0,
					view: view
				});

				value = self.get( keypath );
				
				
				// pass value through formatters, if there are any
				if ( view.model.fmtrs ) {
					value = view.anglebars._format( value, view.model.fmtrs );
				}

				view.update( value );
			};

			fullKeypath = this.getFullKeypath( view.model.ref, view.contextStack );

			if ( fullKeypath === undefined ) {
				this.registerUnresolvedKeypath({
					view: view,
					callback: initialUpdate
				});
			} else {
				initialUpdate( fullKeypath );
			}
		},

		// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		getFullKeypath: function ( ref, contextStack ) {

			var innerMost;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( ref === '.' ) {
				return contextStack[ contextStack.length - 1 ];
			}

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMost = contextStack.pop();

				if ( this.get( innerMost + '.' + ref ) !== undefined ) {
					return innerMost + '.' + ref;
				}
			}

			if ( this.get( ref ) !== undefined ) {
				return ref;
			}
		},

		registerUnresolvedKeypath: function ( unresolved ) {
			this.pendingResolution[ this.pendingResolution.length ] = unresolved;
		},

		_notifyObservers: function ( keypath, value ) {
			var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer, actualValue;

			for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
				priority = observersGroupedByLevel[i];

				if ( priority ) {
					for ( j=0; j<priority.length; j+=1 ) {
						observer = priority[j];

						if ( keypath !== observer.originalAddress ) {
							actualValue = self.get( observer.originalAddress );
						} else {
							actualValue = value;
						}

						if ( observer.view ) {
							// apply formatters, if there are any
							if ( observer.view.model.fmtrs ) {
								actualValue = observer.view.anglebars._format( actualValue, observer.view.model.fmtrs );
							}

							observer.view.update( actualValue );
						}

						if ( observer.callback ) {
							observer.callback( actualValue );
						}
					}
				}
			}
		},

		observe: function ( options ) {

			var self = this, keypath, originalAddress = options.keypath, priority = options.priority, observerRefs = [], observe;

			// Allow `observe( keypath, callback )` syntax
			if ( arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function' ) {
				return this.observe({ keypath: arguments[0], callback: arguments[1], priority: 0 });
			}

			if ( !options.keypath ) {
				return undefined;
			}

			observe = function ( keypath ) {
				var observers, observer;

				observers = self.observers[ keypath ] = self.observers[ keypath ] || [];
				observers = observers[ priority ] = observers[ priority ] || [];

				observer = {
					originalAddress: originalAddress
				};

				// if we're given a view to update, add it to the observer - ditto callbacks
				if ( options.view ) {
					observer.view = options.view;
				}

				if ( options.callback ) {
					observer.callback = options.callback;
				}

				observers[ observers.length ] = observer;
				observerRefs[ observerRefs.length ] = {
					keypath: keypath,
					priority: priority,
					observer: observer
				};
			};

			keypath = options.keypath;
			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				observe( keypath );

				// remove the last item in the keypath, so that data.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
			}

			observe( keypath );

			return observerRefs;
		},

		unobserve: function ( observerRef ) {
			var priorities, observers, index;

			priorities = this.observers[ observerRef.keypath ];
			if ( !priorities ) {
				// nothing to unobserve
				return;
			}

			observers = priorities[ observerRef.priority ];
			if ( !observers ) {
				// nothing to unobserve
				return;
			}

			if ( observers.indexOf ) {
				index = observers.indexOf( observerRef.observer );
			} else {
				// fuck you IE
				for ( var i=0, len=observers.length; i<len; i+=1 ) {
					if ( observers[i] === observerRef.observer ) {
						index = i;
						break;
					}
				}
			}


			if ( index === -1 ) {
				// nothing to unobserve
				return;
			}

			// remove the observer from the list...
			observers.splice( index, 1 );

			// ...then tidy up if necessary
			if ( observers.length === 0 ) {
				delete priorities[ observerRef.priority ];
			}

			if ( priorities.length === 0 ) {
				delete this.observers[ observerRef.keypath ];
			}
		},

		unobserveAll: function ( observerRefs ) {
			while ( observerRefs.length ) {
				this.unobserve( observerRefs.shift() );
			}
		}
	};


	if ( Array.prototype.filter ) { // Browsers that aren't unredeemable pieces of shit
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.view !== view;
			});
		};
	}

	else { // Internet Exploder
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			var i, filtered = [];

			for ( i=0; i<this.pendingResolution.length; i+=1 ) {
				if ( this.pendingResolution[i].view !== view ) {
					filtered[ filtered.length ] = this.pendingResolution[i];
				}
			}

			this.pendingResolution = filtered;
		};
	}



	
	keypathNormaliser = /\[\s*([0-9]+)\s*\]/g;
	splitKeypath = function ( keypath ) {
		var normalised;

		// normalise keypath (e.g. 'foo[0]' becomes 'foo.0')
		normalised = keypath.replace( keypathNormaliser, '.$1' );

		return normalised.split( '.' );
	};



}( Anglebars ));

(function ( A, doc ) {

	'use strict';

	var createView, types, insertHtml, isArray, isObject, elContains,
		Text, Element, Partial, Attribute, Mustache, Interpolator, Triple, Section;

	types = A.types;

	isArray = A.isArray;
	isObject = A.isObject;

	elContains = function ( haystack, needle ) {
		// TODO!
		if ( haystack.contains ) {
			return haystack.contains( needle );
		}

		return true;
	};

	insertHtml = function ( html, parent, anchor ) {
		var div, i, len, nodes = [];

		anchor = anchor || null;

		div = doc.createElement( 'div' );
		div.innerHTML = html;

		len = div.childNodes.length;

		for ( i=0; i<len; i+=1 ) {
			nodes[i] = div.childNodes[i];
		}

		for ( i=0; i<len; i+=1 ) {
			parent.insertBefore( nodes[i], anchor );
		}

		return nodes;
	};

	// Base Mustache class
	Mustache = function ( options ) {

		this.model          = options.model;
		this.anglebars      = options.anglebars;
		this.viewmodel      = options.anglebars.viewmodel;
		this.parentNode     = options.parentNode;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];
		this.anchor         = options.anchor;
		this.index          = options.index;

		this.type = options.model.type;

		this.initialize();

		this.viewmodel.registerView( this );

		// if we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.model.inv ) { // test both section-hood and inverticity in one go
			this.update( false );
		}
	};

	

	// View types
	createView = function ( options ) {
		if ( typeof options.model === 'string' ) {
			return new Text( options );
		}

		switch ( options.model.type ) {
			case types.INTERPOLATOR: return new Interpolator( options );
			case types.SECTION: return new Section( options );
			case types.TRIPLE: return new Triple( options );

			case types.ELEMENT: return new Element( options );
			case types.PARTIAL: return new Partial( options );

			default: throw 'WTF? not sure what happened here...';
		}
	};


	// Fragment
	A.DomFragment = function ( options ) {

		var numModels, i, itemOptions, parentRefs, ref;

		// if we have an HTML string, our job is easy.
		if ( typeof options.model === 'string' ) {
			this.nodes = insertHtml( options.model, options.parentNode, options.anchor );
			return;
		}

		// otherwise we have to do some work
		this.owner = options.owner;
		this.index = options.index;

		this.indexRefs = {};
		if ( this.owner && this.owner.parentFragment ) {
			parentRefs = this.owner.parentFragment.indexRefs;
			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					this.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}

		if ( options.indexRef ) {
			this.indexRefs[ options.indexRef ] = options.index;
		}

		
		itemOptions = {
			anglebars:      options.anglebars,
			parentNode:     options.parentNode,
			contextStack:   options.contextStack,
			anchor:         options.anchor,
			parentFragment: this
		};

		this.items = [];
		this.queue = [];

		numModels = options.model.length;
		for ( i=0; i<numModels; i+=1 ) {			
			itemOptions.model = options.model[i];
			itemOptions.index = i;

			this.items[i] = createView( itemOptions );
		}
	};

	A.DomFragment.prototype = {
		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index;

			index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		}
	};


	// Partials
	Partial = function ( options ) {
		this.fragment = new A.DomFragment({
			model:        options.anglebars.partials[ options.model.ref ] || [],
			anglebars:    options.anglebars,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			anchor:       options.anchor,
			owner:        this
		});
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options ) {
		this.node = doc.createTextNode( options.model );
		this.index = options.index;
		this.anglebars = options.anglebars;
		this.parentNode = options.parentNode;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Text.prototype = {
		teardown: function () {
			if ( elContains( this.anglebars.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options ) {

		var binding,
			model,
			namespace,
			attr,
			attrName,
			attrValue;

		// stuff we'll need later
		model = this.model = options.model;
		this.anglebars = options.anglebars;
		this.viewmodel = options.anglebars.viewmodel;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		// get namespace
		if ( model.attrs && model.attrs.xmlns ) {
			namespace = model.attrs.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw 'Namespace attribute cannot contain mustaches';
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = doc.createElementNS( namespace, model.tag );


		// set attributes
		this.attributes = [];
		for ( attrName in model.attrs ) {
			if ( model.attrs.hasOwnProperty( attrName ) ) {
				attrValue = model.attrs[ attrName ];

				attr = new Attribute({
					owner: this,
					name: attrName,
					value: attrValue,
					anglebars: options.anglebars,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
				if ( attrName === 'value' && this.anglebars.twoway && ( model.tag.toLowerCase() === 'input' || model.tag.toLowerCase() === 'textarea' ) ) {
					binding = attr;
				}

				this.attributes[ this.attributes.length ] = attr;
			}
		}

		if ( binding ) {
			this.bind( binding, options.anglebars.lazy );
		}

		// append children, if there are any
		if ( model.frag ) {
			if ( typeof model.frag === 'string' ) {
				// great! we can use innerHTML
				this.node.innerHTML = model.frag;
			}

			else {
				this.children = new A.DomFragment({
					model:        model.frag,
					anglebars:    options.anglebars,
					parentNode:   this.node,
					contextStack: options.contextStack,
					anchor:       null,
					owner:        this
				});
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Element.prototype = {
		bind: function ( attribute, lazy ) {

			var viewmodel = this.viewmodel, node = this.node, setValue, valid, interpolator, keypath;

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			valid = true;
			if ( !attribute.fragment ||
			     ( attribute.fragment.items.length !== 1 ) ||
			     ( attribute.fragment.items[0].type !== A.types.INTERPOLATOR ) ||
			     ( attribute.fragment.items[0].model.formatters && attribute.fragment.items[0].model.formatters.length )
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator with no formatters';
			}

			interpolator = attribute.fragment.items[0];

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
			keypath = interpolator.keypath || interpolator.model.partialKeypath;

			setValue = function () {
				var value = node.value;

				// special cases
				if ( value === '0' ) {
					value = 0;
				}

				else if ( value !== '' ) {
					value = +value || value;
				}

				// Note: we're counting on `viewmodel.set` recognising that `value` is
				// already what it wants it to be, and short circuiting the process.
				// Rather than triggering an infinite loop...
				viewmodel.set( keypath, value );
			};

			// set initial value
			setValue();

			// TODO support shite browsers like IE and Opera
			node.addEventListener( 'change', setValue );

			if ( !lazy ) {
				node.addEventListener( 'keyup', setValue );
			}
		},

		teardown: function () {
			if ( elContains( this.anglebars.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			if ( this.children ) {
				this.children.teardown();
			}

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var i, name, value, colonIndex, namespacePrefix, namespace, ancestor;

		name = options.name;
		value = options.value;

		this.owner = options.owner; // the element this belongs to

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix === 'xmlns' ) {
				namespace = null;
			}

			else {

				// we need to find an ancestor element that defines this prefix
				ancestor = options.parentNode;

				// continue searching until there's nowhere further to go, or we've found the declaration
				while ( ancestor && !namespace ) {
					namespace = ancestor.getAttribute( 'xmlns:' + namespacePrefix );

					// continue searching possible ancestors
					ancestor = ancestor.parentNode || options.owner.parentFragment.owner.node || options.owner.parentFragment.owner.parentNode;
				}
			}

			// if we've found a namespace, make a note of it
			if ( namespace ) {
				this.namespace = namespace;
			}
		}

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( typeof value === 'string' ) {
			
			if ( namespace ) {
				options.parentNode.setAttributeNS( namespace, name.replace( namespacePrefix + ':', '' ), value );
			} else {
				options.parentNode.setAttribute( name, value );
			}
			
			return;
		}

		// otherwise we need to do some work
		this.parentNode = options.parentNode;
		this.name = name;

		this.children = [];

		// share parentFragment with parent element
		this.parentFragment = this.owner.parentFragment;

		this.fragment = new A.TextFragment({
			model:        value,
			anglebars:    options.anglebars,
			owner:        this,
			contextStack: options.contextStack
		});

		// manually trigger first update
		this.ready = true;
		this.update();
	};

	Attribute.prototype = {
		teardown: function () {
			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			while ( this.children.length ) {
				this.children.pop().teardown();
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			var prevValue = this.value;

			if ( !this.ready ) {
				return; // avoid items bubbling to the surface when we're still initialising
			}
			
			this.value = this.fragment.toString();
		
			if ( this.value !== prevValue ) {
				if ( this.namespace ) {
					this.parentNode.setAttributeNS( this.namespace, this.name, this.value );
				} else {
					this.parentNode.setAttribute( this.name, this.value );
				}
			}
		}
	};





	// Interpolator
	Interpolator = function ( options ) {
		// extend Mustache
		Mustache.call( this, options );
	};

	Interpolator.prototype = {
		initialize: function () {
			this.node = doc.createTextNode( '' );
			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			if ( elContains( this.anglebars.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		update: function ( text ) {
			if ( text !== this.text ) {
				this.text = text;
				this.node.data = text;
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Triple
	Triple = function ( options ) {
		Mustache.call( this, options );
	};

	Triple.prototype = {
		initialize: function () {
			this.nodes = [];
		},

		teardown: function () {

			// remove child nodes from DOM
			if ( elContains( this.anglebars.el, this.parentNode ) ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		update: function ( html ) {
			var anchor;

			if ( html === this.html ) {
				return;
			} else {
				this.html = html;
			}

			// TODO figure out if this line was supposed to mean something...
			//anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			anchor = this.anchor || this.parentFragment.findNextNode( this );

			// get new nodes
			this.nodes = insertHtml( html, this.parentNode, anchor );
		}
	};



	// Section
	Section = function ( options ) {
		Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.views = [];
			this.length = 0; // number of times this section is rendered
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.views[0] ) {
				return this.views[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.views[ fragment.index + 1 ] ) {
				return this.views[ fragment.index + 1 ].firstNode();
			} else {
				return this.parentFragment.findNextNode( this );
			}
		},

		unrender: function () {
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i, viewsToRemove, anchor, fragmentOptions, valueIsArray, valueIsObject;

			fragmentOptions = {
				model:        this.model.frag,
				anglebars:    this.anglebars,
				parentNode:   this.parentNode,
				anchor:       this.parentFragment.findNextNode( this ),
				owner:        this
			};

			valueIsArray = isArray( value );

			// modify the array to allow updates via push, pop etc
			if ( valueIsArray && this.anglebars.modifyArrays ) {
				A.modifyArray( value, this.keypath, this.anglebars.viewmodel );
			}

			// treat empty arrays as false values
			if ( valueIsArray && value.length === 0 ) {
				emptyArray = true;
			}


			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inv ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
						return;
					}
				}

				else {
					if ( !this.length ) {
						anchor = this.parentFragment.findNextNode( this );

						// no change to context stack in this situation
						fragmentOptions.contextStack = this.contextStack;
						fragmentOptions.index = 0;

						this.views[0] = new A.DomFragment( fragmentOptions );
						this.length = 1;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with

			// if value is an array, iterate through
			if ( valueIsArray ) {

				// if the array is shorter than it was previously, remove items
				if ( value.length < this.length ) {
					viewsToRemove = this.views.splice( value.length, this.length - value.length );

					while ( viewsToRemove.length ) {
						viewsToRemove.pop().teardown();
					}
				}

				// otherwise...
				else {

					if ( value.length > this.length ) {
						// add any new ones
						for ( i=this.length; i<value.length; i+=1 ) {
							// append list item to context stack
							fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
							fragmentOptions.index = i;

							if ( this.model.i ) {
								fragmentOptions.indexRef = this.model.i;
							}

							this.views[i] = new A.DomFragment( fragmentOptions );
						}
					}
				}

				this.length = value.length;
			}

			// if value is a hash...
			else if ( isObject( value ) ) {
				// ...then if it isn't rendered, render it, adding this.keypath to the context stack
				// (if it is already rendered, then any children dependent on the context stack
				// will update themselves without any prompting)
				if ( !this.length ) {
					// append this section to the context stack
					fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
					fragmentOptions.index = 0;

					this.views[0] = new A.DomFragment( fragmentOptions );
					this.length = 1;
				}
			}


			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						// no change to context stack
						fragmentOptions.contextStack = this.contextStack;
						fragmentOptions.index = 0;

						this.views[0] = new A.DomFragment( fragmentOptions );
						this.length = 1;
					}
				}

				else {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}
			}
		}
	};

}( Anglebars, document ));

(function ( A ) {

	'use strict';

	var createView, types, ctors, isArray, isObject,
		Text, Mustache, Interpolator, Triple, Section;

	types = A.types;

	ctors = [];
	ctors[ types.TEXT ] = 'Text';
	ctors[ types.INTERPOLATOR ] = 'Interpolator';
	ctors[ types.TRIPLE ] = 'Triple';
	ctors[ types.SECTION ] = 'Section';

	isArray = A.isArray;
	isObject = A.isObject;

	// Base Mustache class
	Mustache = function ( options ) {

		this.model = options.model;
		this.anglebars = options.anglebars;
		this.viewmodel = options.anglebars.viewmodel;
		this.parent = options.parent;
		this.parentFragment = options.parentFragment;
		this.contextStack = options.contextStack || [];

		this.type = options.model.type;

		// If there is an init method, call it
		if ( this.initialize ) {
			this.initialize();
		}

		this.viewmodel.registerView( this );

		// If we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.model.inv ) { // Test both section-hood and inverticity in one go
			this.update( false );
		}
	};


	// Substring types
	createView = function ( options ) {
		if ( typeof options.model === 'string' ) {
			return new Text( options.model );
		}

		switch ( options.model.type ) {
			case types.INTERPOLATOR: return new Interpolator( options );
			case types.TRIPLE: return new Triple( options );
			case types.SECTION: return new Section( options );

			default: throw 'Something went wrong in a rather interesting way';
		}
	};



	// Fragment
	A.TextFragment = function ( options ) {
		var numItems, i, itemOptions, parentRefs, ref;

		this.owner = options.owner;
		this.index = options.index;
		this.items = [];

		this.indexRefs = {};
		if ( this.owner && this.owner.parentFragment ) {
			parentRefs = this.owner.parentFragment.indexRefs;
			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					this.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}

		if ( options.indexRef ) {
			this.indexRefs[ options.indexRef ] = options.index;
		}

		itemOptions = {
			anglebars: options.anglebars,
			parentFragment: this,
			parent: this.owner,
			contextStack: options.contextStack
		};

		numItems = ( options.model ? options.model.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = options.model[i];
			this.items[ this.items.length ] = createView( itemOptions );
		}

		this.value = this.items.join('');
	};

	A.TextFragment.prototype = {
		bubble: function () {
			this.value = this.items.join( '' );
			this.parent.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		Mustache.call( this, options );
	};

	Interpolator.prototype = {
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.children = [];
			this.length = 0;
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.children.length ) {
				this.children.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			var emptyArray, i, childrenToRemove, valueIsArray;

			valueIsArray = isArray( value );

			// modify the array to allow updates via push, pop etc
			if ( valueIsArray && this.anglebars.modifyArrays ) {
				A.modifyArray( value, this.keypath, this.anglebars.viewmodel );
			}

			// treat empty arrays as false values
			if ( valueIsArray && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inv ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}

				else {
					if ( !this.length ) {
						this.children[0] = new A.TextFragment( this.model.frag, this.anglebars, this, this.contextStack );
						this.length = 1;
					}
				}

				this.value = this.children.join( '' );
				this.parent.bubble();

				return;
			}


			// Otherwise we need to work out what sort of section we're dealing with.
			if( typeof value === 'object' ) {



				// if value is an array, iterate through
				if ( valueIsArray ) {

					// if the array is shorter than it was previously, remove items
					if ( value.length < this.length ) {
						childrenToRemove = this.children.splice( value.length, this.length - value.length );

						while ( childrenToRemove.length ) {
							childrenToRemove.shift().teardown();
						}
					}

					// otherwise...
					else {

						// first, update existing views
						for ( i=0; i<this.length; i+=1 ) {
							this.viewmodel.update( this.keypath + '.' + i );
						}

						if ( value.length > this.length ) {

							// then add any new ones
							for ( i=this.length; i<value.length; i+=1 ) {
								this.children[i] = new A.TextFragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
							}
						}
					}

					this.length = value.length;
				}

				// if value is a hash...
				else {
					// ...then if it isn't rendered, render it, adding this.keypath to the context stack
					// (if it is already rendered, then any children dependent on the context stack
					// will update themselves without any prompting)
					if ( !this.length ) {
						this.children[0] = new A.TextFragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath ) );
						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						this.children[0] = new A.TextFragment( this.model.frag, this.anglebars, this, this.contextStack );
						this.length = 1;
					}
				}

				else {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}
			}

			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

}( Anglebars ));
(function ( A ) {

	'use strict';

	A.extend = function ( childProps ) {

		var Parent, Child, key, blacklist;

		Parent = this;

		Child = function () {
			A.apply( this, arguments );

			if ( this.init ) {
				this.init.apply( this, arguments );
			}
		};

		// extend child with parent methods
		for ( key in Parent.prototype ) {
			if ( Parent.prototype.hasOwnProperty( key ) ) {
				Child.prototype[ key ] = Parent.prototype[ key ];
			}
		}

		// extend child with specified methods, as long as they don't override Anglebars.prototype methods
		for ( key in childProps ) {
			if ( childProps.hasOwnProperty( key ) ) {
				if ( A.prototype.hasOwnProperty( key ) ) {
					throw new Error( 'Cannot override "' + key + '" method or property of Anglebars prototype' );
				}

				Child.prototype[ key ] = childProps[ key ];
			}
		}

		Child.extend = Parent.extend;

		return Child;
	};

}( Anglebars ));
(function ( A ) {

	'use strict';

	var wrapMethods;

	A.modifyArray = function ( array, keypath, viewmodel ) {

		var viewmodels, keypathsByIndex, viewmodelIndex, keypaths;

		if ( !array._anglebars ) {
			array._anglebars = {
				viewmodels: [ viewmodel ],
				keypathsByIndex: [ [ keypath ] ]
			};

			wrapMethods( array );
		}

		else {
			viewmodels = array._anglebars.viewmodels;
			keypathsByIndex = array._anglebars.keypathsByIndex;

			// see if this viewmodel is currently associated with this array
			viewmodelIndex = viewmodels.indexOf( viewmodel );

			// if not, associate it
			if ( viewmodelIndex === -1 ) {
				viewmodelIndex = viewmodels.length;
				viewmodels[ viewmodelIndex ] = viewmodel;
			}

			// find keypaths that reference this array, on this viewmodel
			keypaths = keypathsByIndex[ viewmodelIndex ];

			// if the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}

	};

	wrapMethods = function ( array ) {
		var notifyDependents = function ( array ) {
			var viewmodels, keypathsByIndex;

			viewmodels = array._anglebars.viewmodels;
			keypathsByIndex = array._anglebars.keypathsByIndex;

			viewmodels.forEach( function ( viewmodel, i ) {
				var keypaths = keypathsByIndex[i];

				keypaths.forEach( function ( keypath ) {
					viewmodel.set( keypath, array );
				});
			});
		};

		[ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ].forEach( function ( method ) {
			array[ method ] = function () {
				var result = Array.prototype[ method ].apply( this, arguments );
				notifyDependents( array );

				return result;
			};
		});
	};

}( Anglebars ));

// export
if ( typeof module !== "undefined" && module.exports ) module.exports = Anglebars // Common JS
else if ( typeof define === "function" && define.amd ) define( function () { return Anglebars } ) // AMD
else { global.Anglebars = Anglebars }

}( this ));