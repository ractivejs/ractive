/*! Anglebars - v0.0.1 - 2012-09-24
* http://rich-harris.github.com/Anglebars/
* Copyright (c) 2012 Rich Harris; Licensed WTFPL */

var Anglebars = (function () {

	'use strict';

	var Anglebars, utils;
	

	Anglebars = function ( o ) {
		this.initialize( o );
	};

	Anglebars.views = {};
	Anglebars.substrings = {};
	
	Anglebars.utils = {};

	utils = Anglebars.utils;

	Anglebars.prototype = {
		initialize: function ( o ) {
			
			var templateEl;

			o = o || {};

			// get container
			this.el = utils.getEl( o.el );

			// get template
			templateEl = utils.getEl( o.template );
			if ( templateEl ) {
				this.template = templateEl.innerHTML;
			} else {
				this.template = o.template;
			}

			// get data
			if ( o.data ) {
				if ( o.data instanceof Anglebars.Data ) {
					this.data = o.data;
				} else {
					this.data = new Anglebars.Data( o.data );
				}
			}

			// get formatters
			this.formatters = o.formatters;

			// get misc options
			this.preserveWhitespace = o.preserveWhitespace;
			this.replaceSrcAttributes = ( o.replaceSrcAttributes === undefined ? true : o.replaceSrcAttributes );

			this.compiled = Anglebars.compileTemplate( this.template, this.preserveWhitespace, this.replaceSrcAttributes );

			// empty container and render
			this.el.innerHTML = '';
			this.render();
		},

		render: function ( el ) {
			el = ( el ? utils.getEl( el ) : this.el );

			if ( !el ) {
				throw new Error( 'You must specify a DOM element to render to' );
			}

			this.rendered = Anglebars.render( this, el );
		},

		// shortcuts
		set: function () {
			this.data.set.apply( this.data, arguments );
		},

		get: function () {
			this.data.get.apply( this.data, arguments );
		},

		format: function ( value, formatters ) {
			var i, numFormatters, formatterName;

			numFormatters = formatters.length;
			for ( i=0; i<numFormatters; i+=1 ) {
				formatterName = formatters[i];

				if ( this.formatters[ formatterName ] ) {
					value = this.formatters[ formatterName ]( value );
				}
			}

			return value;
		}
	};

	return Anglebars;

}());


(function ( Anglebars ) {

	'use strict';

	var utils = Anglebars.utils;

	Anglebars.Data = function ( o ) {
		var key;

		this.data = {};

		for ( key in o ) {
			if ( o.hasOwnProperty( key ) ) {
				this.data[ key ] = o[ key ];
			}
		}

		this.pendingResolution = [];
		this.subscriptions = {};
	};

	Anglebars.Data.prototype = {
		set: function ( address, value ) {
			var k, keys, key, obj, i, numUnresolved, numResolved, unresolved, resolved, index, previous;

			// allow multiple values to be set in one go
			if ( typeof address === 'object' ) {
				for ( k in address ) {
					if ( address.hasOwnProperty( k ) ) {
						this.set( k, address[k] );
					}
				}
			}

			else {
				// find previous value
				previous = this.get( address );

				// split key path into keys
				keys = address.split( '.' );

				obj = this.data;
				while ( keys.length > 1 ) {
					key = keys.shift();
					obj = obj[ key ] || {};
				}

				key = keys[0];

				obj[ key ] = value;

				if ( !utils.isEqual( previous, value ) ) {
					this.publish( address, value );
				}
			}

			// see if we can resolve any of the unresolved addresses (if such there be)
			i = this.pendingResolution.length;

			while ( i-- ) { // work backwards, so we don't go in circles
				unresolved = this.pendingResolution.splice( i, 1 )[0];
				this.getAddress( unresolved.item, unresolved.item.keypath, unresolved.item.contextStack, unresolved.callback );
			}
		},

		get: function ( address ) {
			var keys, result;

			if ( !address ) {
				return '';
			}

			keys = address.split( '.' );

			result = this.data;
			while ( keys.length ) {
				result = result[ keys.shift() ];

				if ( result === undefined ) {
					return '';
				}
			}

			return result;
		},

		getAddress: function ( item, keypath, contextStack, callback ) {

			// TODO refactor this, it's fugly

			var keys, keysClone, innerMost, result, contextStackClone, address;

			contextStack = ( contextStack ? contextStack.concat() : [] );
			contextStackClone = contextStack.concat();

			while ( contextStack ) {

				innerMost = ( contextStack.length ? contextStack[ contextStack.length - 1 ] : null );
				keys = ( innerMost ? innerMost.split( '.' ).concat( keypath.split( '.' ) ) : keypath.split( '.' ) );
				keysClone = keys.concat();

				result = this.data;
				while ( keys.length ) {
					result = result[ keys.shift() ];
				
					if ( result === undefined ) {
						break;
					}
				}

				if ( result !== undefined ) {
					address = keysClone.join( '.' );
					item.address = address;
					callback.call( item, address );
					break;
				}

				if ( contextStack.length ) {
					contextStack.pop();
				} else {
					contextStack = false;
				}
			}

			// if we didn't figure out the address, add this to the unresolved list
			if ( result === undefined ) {
				this.registerUnresolvedAddress( item, callback );
			}
		},

		registerUnresolvedAddress: function ( item, onResolve ) {
			this.pendingResolution[ this.pendingResolution.length ] = {
				item: item,
				callback: onResolve
			};
		},

		cancelAddressResolution: function ( item ) {
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.item !== item;
			});
		},

		publish: function ( address, value ) {
			var self = this, subscriptionsGroupedByLevel = this.subscriptions[ address ] || [], i, j, level, subscription;

			for ( i=0; i<subscriptionsGroupedByLevel.length; i+=1 ) {
				level = subscriptionsGroupedByLevel[i];

				if ( level ) {
					for ( j=0; j<level.length; j+=1 ) {
						subscription = level[j];

						if ( address !== subscription.originalAddress ) {
							value = self.get( subscription.originalAddress );
						}
						subscription.callback( value );
					}
				}
			}
		},

		subscribe: function ( address, level, callback ) {
			
			var self = this, originalAddress = address, subscriptionRefs = [], subscribe;

			if ( !address ) {
				return undefined;
			}

			subscribe = function ( address ) {
				var subscriptions, subscription;

				subscriptions = self.subscriptions[ address ] = self.subscriptions[ address ] || [];
				subscriptions = subscriptions[ level ] = subscriptions[ level ] || [];

				subscription = {
					callback: callback,
					originalAddress: originalAddress
				};

				subscriptions[ subscriptions.length ] = subscription;
				subscriptionRefs[ subscriptionRefs.length ] = {
					address: address,
					level: level,
					subscription: subscription
				};
			};

			while ( address.lastIndexOf( '.' ) !== -1 ) {
				subscribe( address );

				// remove the last item in the address, so that data.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
				address = address.substr( 0, address.lastIndexOf( '.' ) );
			}

			subscribe( address );

			return subscriptionRefs;
		},

		unsubscribe: function ( subscriptionRef ) {
			var levels, subscriptions, index;

			levels = this.subscriptions[ subscriptionRef.address ];
			if ( !levels ) {
				// nothing to unsubscribe
				return;
			}

			subscriptions = levels[ subscriptionRef.level ];
			if ( !subscriptions ) {
				// nothing to unsubscribe
				return;
			}

			index = subscriptions.indexOf( subscriptionRef.subscription );

			if ( index === -1 ) {
				// nothing to unsubscribe
				return;
			}

			// remove the subscription from the list...
			subscriptions.splice( index, 1 );

			// ...then tidy up if necessary
			if ( subscriptions.length === 0 ) {
				delete levels[ subscriptionRef.level ];
			}

			if ( levels.length === 0 ) {
				delete this.subscriptions[ subscriptionRef.address ];
			}
		},

		unsubscribeAll: function ( subscriptionRefs ) {
			while ( subscriptionRefs.length ) {
				this.unsubscribe( subscriptionRefs.shift() );
			}
		}
	};

}( Anglebars ));


(function ( A ) {
	
	'use strict';

	var utils = A.utils, views = A.views;

	A.compileTemplate = function ( template, preserveWhitespace, replaceSrcAttributes ) {

		var nodes, stubs, compiled = [];

		// first, remove any comment mustaches
		template = utils.stripComments( template );

		// then, parse the template
		nodes = utils.getNodeArrayFromHtml( template, replaceSrcAttributes );
		
		// then, get an array of 'stubs' from the resulting DOM nodes
		stubs = utils.getStubsFromNodes( nodes );

		// finally, compile the stubs
		compiled = utils.compileStubs( stubs, 0 );

		return compiled;
	};


	A.render = function ( anglebars, el ) {

		var rendered;

		if ( !anglebars.compiled ) {
			throw new Error( 'No compiled template' );
		}

		rendered = new views.Fragment( anglebars.compiled, anglebars, el );

		return rendered;

	};



}( Anglebars ));
(function ( views, substrings ) {
	
	'use strict';

	views.Attribute = function ( model, anglebars, node, contextStack, anchor ) {
		
		var i, numComponents, component;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !model.isDynamic ) {
			node.setAttribute( model.name, model.value );
			return;
		}

		// otherwise we need to do some work
		this.node = node;
		this.name = model.name;

		this.data = anglebars.data;

		this.substrings = [];

		numComponents = model.components.length;
		for ( i=0; i<numComponents; i+=1 ) {
			component = model.components[i];
			this.substrings[i] = substrings.create( component, anglebars, this, contextStack );
		}

		// update...
		this.update();

		// and watch for changes TODO
	};

	views.Attribute.prototype = {
		teardown: function () {
			var numSubstrings, i, substring;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];

				if ( substring.teardown ) {
					substring.teardown(); // TODO should all substrings have a teardown method?
				}
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			this.value = this.toString();
			this.node.setAttribute( this.name, this.value );
		},

		toString: function () {
			var string = '', i, numSubstrings, substring;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];
				string += substring.toString();
			}

			return string;
		}
	};

}( Anglebars.views, Anglebars.substrings ));
(function ( views, utils, doc ) {

	'use strict';

	views.Element = function ( model, anglebars, parentNode, contextStack, anchor ) {

		var data = anglebars.data,
			i,
			numAttributes,
			numItems,
			attributeModel,
			item;

		// stuff we'll need later
		this.data = data;

		// create the DOM node
		if ( model.namespace ) {
			this.node = doc.createElementNS( model.namespace, model.tag );
		} else {
			this.node = doc.createElement( model.tag );
		}
		
		
		// set attributes
		this.attributes = [];
		numAttributes = model.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attributeModel = model.attributes[i];
			this.attributes[i] = new views.Attribute( attributeModel, anglebars, this.node, contextStack, anchor );
		}

		// append children
		if ( model.children ) {
			this.children = [];
			numItems = model.children.length;
			for ( i=0; i<numItems; i+=1 ) {
				item = model.children[i];
				this.children[i] = views.create( item, anglebars, this.node, contextStack, anchor );
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Element.prototype = {
		teardown: function () {
			
			var numAttrs, i;

			numAttrs = this.attributes.length;
			for ( i=0; i<numAttrs; i+=1 ) {
				this.attributes[i].teardown();
			}

			utils.remove( this.node );
		}
	};

}( Anglebars.views, Anglebars.utils, document ));


(function ( views ) {
	
	'use strict';


	views.create = function ( model, anglebars, parentNode, contextStack, anchor ) {

		switch ( model.type ) {
			case 'text':
				return new views.Text( model, parentNode, anchor );

			case 'interpolator':
				return new views.Interpolator( model, anglebars, parentNode, contextStack, anchor );

			case 'triple':
				return new views.Triple( model, anglebars, parentNode, contextStack, anchor );

			case 'element':
				return new views.Element( model, anglebars, parentNode, contextStack, anchor );

			case 'section':
				return new views.Section( model, anglebars, parentNode, contextStack, anchor );
		}
	};



	views.Fragment = function ( array, anglebars, parentNode, contextStack, anchor ) {

		var arrayLength, i;

		this.items = [];

		arrayLength = array.length;
		for ( i=0; i<arrayLength; i+=1 ) {
			this.items[ this.items.length ] = views.create( array[i], anglebars, parentNode, contextStack, anchor );
		}
	};


	views.Fragment.prototype = {
		teardown: function () {
			
			var i, numItems;

			// TODO unsubscribes
			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}

			delete this.items; // garbage collector, ATTACK!
		}
	};

}( Anglebars.views ));
(function ( views, utils, doc ) {

	'use strict';

	views.Interpolator = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			data = anglebars.data;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		
		this.node = doc.createTextNode( '' );
		this.data = data;
		this.keypath = model.keypath;
		this.contextStack = contextStack;

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			value = data.get( address );
			formatted = anglebars.format( value, model.formatters );

			this.update( formatted );

			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				self.update( formatted );
			});
		});
		

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Interpolator.prototype = {
		teardown: function () {
			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		}
	};

}( Anglebars.views, Anglebars.utils, document ));


(function ( views, utils ) {

	'use strict';

	views.Section = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formatted,
			data = anglebars.data;

		this.model = model;
		this.contextStack = contextStack || [];
		this.data = data;
		this.views = [];
		
		this.parentNode = parentNode;
		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			unformatted = data.get( address );
			formatted = anglebars.format( unformatted, model.formatters );

			this.update( formatted );

			// subscribe to changes
			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				self.update( formatted );
			});
		});
	};

	views.Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		unrender: function () {
			// TODO unsubscribe
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i;
			
			// treat empty arrays as false values
			if ( utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.views[0] = this.model.list.render( this.parentNode, this.contextStack, this.anchor );
						this.rendered = true;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with
			switch ( typeof value ) {
				case 'object':

					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( utils.isArray( value ) ) {
						if ( emptyArray ) {
							return;
						}
						
						for ( i=0; i<value.length; i+=1 ) {
							this.views[i] = this.model.list.render( this.parentNode, this.contextStack.concat( this.address + '.' + i ), this.anchor );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.views[0] = this.model.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.views[0] = this.model.list.render( this.parentNode, this.contextStack, this.anchor );
							this.rendered = true;
						}
					}

					else {
						if ( this.rendered ) {
							this.unrender();
							this.rendered = false;
						}
					}

					// otherwise render if value is truthy, unrender if falsy

			}
		}
	};

}( Anglebars.views, Anglebars.utils ));


(function ( views, utils, doc ) {

	'use strict';

	views.Text = function ( model, parentNode, anchor ) {
		this.node = doc.createTextNode( model.text );

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		}
	};

}( Anglebars.views, Anglebars.utils, document ));


(function ( views, utils ) {

	'use strict';

	views.Triple = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			data = anglebars.data;

		this.nodes = [];
		this.data = data;
		this.anglebars = anglebars;

		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			// subscribe to data changes
			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				self.update( formatted );
			});

			unformatted = data.get( address );
			formattedHtml = anglebars.format( unformatted, model.formatters );

			this.update( formattedHtml );
		});
	};

	views.Triple.prototype = {
		teardown: function () {
			
			var i, numNodes;
			
			// TODO unsubscribes
			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.remove( this.nodes[i] );
			}


			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		update: function ( value ) {
			var numNodes, i;

			if ( utils.isEqual( this.value, value ) ) {
				return;
			}

			// remove existing nodes
			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.remove( this.nodes[i] );
			}

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( value, false );

			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.insertBefore( this.anchor, this.nodes[i] );
			}
		}
	};

}( Anglebars.views, Anglebars.utils ));


(function ( substrings ) {
	
	'use strict';

	substrings.create = function ( model, anglebars, parent, contextStack ) {

		switch ( model.type ) {
			case 'text':
				return new substrings.Text( model, parent );

			case 'interpolator':
			case 'triple':
				return new substrings.Interpolator( model, anglebars, parent, contextStack );

			case 'section':
				return new substrings.Section( model, anglebars, parent, contextStack );
		}
	};

}( Anglebars.substrings ));
(function ( substrings ) {
	
	'use strict';

	substrings.Fragment = function ( model, anglebars, parent, contextStack ) {
		var numItems, substring, i;

		this.substrings = [];
		
		numItems = model.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			substring = substrings.create( model.items[i], anglebars, this, contextStack );
			this.substrings[i] = substring;
		}

		this.stringified = this.substrings.join('');
	};

	substrings.Fragment.prototype = {
		bubble: function () {
			this.stringified = this.substrings.join('');
			this.parent.bubble();
		},

		teardown: function () {
			var numSubstrings, i;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				this.substrings[i].teardown();
			}
		},

		toString: function () {
			return this.stringified;
		}
	};

}( Anglebars.substrings ));
(function ( substrings, utils ) {

	'use strict';

	substrings.Interpolator = function ( model, anglebars, parent, contextStack ) {

		this.data = anglebars.data;
		
		anglebars.data.getAddress( this, model.keypath, contextStack, function ( address ) {
			var value, formatted, self = this;

			value = this.data.get( address );
			formatted = anglebars.format( value, model.formatters ); // TODO is it worth storing refs to keypath and formatters on the evaluator?

			this.stringified = formatted;

			this.subscriptionRefs = this.data.subscribe( address, model.level, function ( value ) {
				var formatted = self.anglebars.format( value, model.formatters );
				self.stringified = formatted;
				self.bubble();
			});
		});
	};

	substrings.Interpolator.prototype = {
		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}
		},

		toString: function () {
			return this.stringified;
		}
	};

	substrings.Triple = substrings.Interpolator; // same same


}( Anglebars.substrings, Anglebars.utils ));
(function ( substrings ) {

	substrings.Section = function ( model, anglebars, parent, contextStack ) {
		
		this.contextStack = contextStack;
		this.anglebars = anglebars;
		this.data = anglebars.data;

		this.substrings = [];

		this.data.getAddress( this, this.keypath, contextStack, function ( address ) {
			var value, formatted, self = this;

			value = this.data.get( this.address );
			formatted = this.anglebars.format( value, this.formatters ); // TODO is it worth storing refs to keypath and formatters on the substring?

			this.update( formatted );

			this.subscriptionRefs = this.data.subscribe( this.address, this.model.level, function ( value ) {
				var formatted = self.anglebars.format( value, self.model.formatters );
				self.update( formatted );
				self.bubble();
			});
		});
	};

	substrings.Section.prototype = {
		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {
			// TODO
		},

		update: function ( value ) {
			var emptyArray, i;

			// treat empty arrays as false values
			if ( _.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.substrings = [];
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.substrings[0] = substrings.create( this.model.list, this.anglebars, this, this.contextStack );
						this.rendered = true;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with
			switch ( typeof value ) {
				case 'object':

					if ( this.rendered ) {
						this.substrings = [];
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( _.isArray( value ) && !emptyArray ) {
						for ( i=0; i<value.length; i+=1 ) {
							this.substrings[i] = this.model.list.getEvaluator( this, this.contextStack.concat( this.address + '.' + i ) );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.substrings[0] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.substrings[0] = this.model.list.getEvaluator( this, this.contextStack );
							this.rendered = true;
						}
					}

					else {
						if ( this.rendered ) {
							this.substrings = [];
							this.rendered = false;
						}
					}
			}
		},

		toString: function () {
			return this.substrings.join( '' );
		}
	};

}( Anglebars.substrings ));


(function ( substrings ) {

	'use strict';

	substrings.Text = function ( model ) {
		this.text = model.text;
	};

	substrings.Text.prototype = {
		toString: function () {
			return this.text;
		}
	};

}( Anglebars.substrings ));


(function ( Anglebars, document ) {
	
	'use strict';

	var utils = Anglebars.utils,
		whitespace = /^\s+$/;


	// replacement for the dumbass DOM equivalents
	utils.insertBefore = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode );
	};

	utils.insertAfter = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
	};

	utils.remove = function ( node ) {
		if ( node.parentNode ) {
			node.parentNode.removeChild( node );
		}
	};


	// strip whitespace from the start and end of strings
	utils.trim = function ( text ) {
		var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		return trimmed;
	};


	// convert HTML to an array of DOM nodes
	utils.getNodeArrayFromHtml = function ( html, replaceSrcAttributes ) {

		var parser, doc, temp, i, numNodes, nodes = [], attrs, pattern;

		// replace src attribute with data-anglebars-src
		if ( replaceSrcAttributes ) {
			attrs = [ 'src', 'poster' ];

			for ( i=0; i<attrs.length; i+=1 ) {
				pattern = new RegExp( '(<[^>]+\\s)(' + attrs[i] + '=)', 'g' );
				html = html.replace( pattern, '$1data-anglebars-' + attrs[i] + '=' );
			}
		}

		if ( document.implementation && document.implementation.createDocument ) {
			doc = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
			temp = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
		} else {
			// IE. ugh
			temp = document.createElement( 'div' );
		}
		
		temp.innerHTML = html;


		// create array from node list, as node lists have some undesirable properties
		numNodes = temp.childNodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			nodes[i] = temp.childNodes[i];
		}

		return nodes;
	};


	// find a target element from an id string, a CSS selector (if document.querySelector is supported), a DOM node, or a jQuery collection (or equivalent)
	utils.getEl = function ( input ) {
		var output;

		if ( input ) {
			// string
			if ( typeof input === 'string' ) {
				// see if it's a DOM node
				output = document.getElementById( input );

				if ( !output && document.querySelector ) {
					try {
						output = document.querySelector( input );
					} catch ( error ) {
						// somebody do something!
					}
				}
			}

			// jQuery (or equivalent) object
			else if ( input[0] && input[0].nodeType ) {
				output = input[0].innerHTML;
			}
		}

		return output;
	};


	// strip mustache comments (which look like {{!this}}, i.e. mustache with an exclamation mark) from a string
	utils.stripComments = function ( input ) {
		var comment = /\{\{!\s*[\s\S]+?\s*\}\}/g,
			lineComment = /(^|\n|\r\n)\s*\{\{!\s*[\s\S]+?\s*\}\}\s*($|\n|\r\n)/g,
			output;

		// remove line comments
		output = input.replace( lineComment, function ( matched, startChar, endChar, start, complete ) {
			return startChar;
		});

		// remove inline comments
		output = output.replace( comment, '' );

		return output;
	};


	// create an anglebars anchor
	utils.createAnchor = function () {
		var anchor = document.createElement( 'a' );
		anchor.setAttribute( 'class', 'anglebars-anchor' );

		return anchor;
	};


	// convert a node list to an array (iterating through a node list directly often has... undesirable results)
	utils.nodeListToArray = function ( nodes ) {
		var i, numNodes = nodes.length, result = [];

		for ( i=0; i<numNodes; i+=1 ) {
			result[i] = nodes[i];
		}

		return result;
	};


	// convert an attribute list to an array
	utils.attributeListToArray = function ( attributes ) {
		var i, numAttributes = attributes.length, result = [];

		for ( i=0; i<numAttributes; i+=1 ) {
			result[i] = {
				name: attributes[i].name,
				value: attributes[i].value
			};
		}

		return result;
	};


	// find the first mustache in a string, and store some information about it. Returns an array with some additional properties
	utils.findMustache = function ( text, startIndex ) {

		var match, split, mustache, formulaSplitter;

		mustache = /(\{)?\{\{(#|\^|\/)?(\>)?(&)?\s*([\s\S]+?)\s*\}\}(\})?/g;
		formulaSplitter = ' | ';

		match = utils.findMatch( text, mustache, startIndex );

		if ( match ) {

			match.formula = match[5];
			split = match.formula.split( formulaSplitter );
			match.keypath = split.shift();
			match.formatters = split;
			
			
			// figure out what type of mustache we're dealing with
			if ( match[2] ) {
				// mustache is a section
				match.type = 'section';
				match.inverted = ( match[2] === '^' ? true : false );
				match.closing = ( match[2] === '/' ? true : false );
			}

			else if ( match[3] ) {
				match.type = 'partial';
			}

			else if ( match[1] ) {
				// left side is a triple - check right side is as well
				if ( !match[6] ) {
					return false;
				}

				match.type = 'triple';
			}

			else {
				match.type = 'interpolator';
			}

			match.isMustache = true;
			return match;
		}

		// if no mustache found, report failure
		return false;
	};


	// find the first match of a pattern within a string. Returns an array with start and end properties indicating where the match was found within the string
	utils.findMatch = function ( text, pattern, startIndex ) {

		var match;

		// reset lastIndex
		if ( pattern.global ) {
			pattern.lastIndex = startIndex || 0;
		} else {
			throw new Error( 'You must pass findMatch() a regex with the global flag set' );
		}

		match = pattern.exec( text );

		if ( match ) {
			match.end = pattern.lastIndex;
			match.start = ( match.end - match[0].length );
			return match;
		}
	};


	
	utils.getStubsFromNodes = function ( nodes ) {
		var i, numNodes, node, result = [];

		numNodes = nodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			node = nodes[i];

			if ( node.nodeType === 1 ) {
				result[ result.length ] = {
					type: 'element',
					original: node
				};
			}

			else if ( node.nodeType === 3 ) {
				result = result.concat( utils.expandText( node.data ) );
			}
		}

		return result;
	};

	utils.expandText = function ( text ) {
		var result, mustache;

		// see if there's a mustache involved here
		mustache = utils.findMustache( text );

		// if not, groovy - no work to do
		if ( !mustache ) {
			return {
				type: 'text',
				text: text
			};
		}

		result = [];

		// otherwise, see if there is any text before the node
		if ( mustache.start > 0 ) {
			result[ result.length ] = {
				type: 'text',
				text: text.substr( 0, mustache.start )
			};
		}

		// add the mustache
		result[ result.length ] = {
			type: 'mustache',
			mustache: mustache
		};

		if ( mustache.end < text.length ) {
			result = result.concat( utils.expandText( text.substring( mustache.end ) ) );
		}

		return result;
	};

	utils.setText = function ( textNode, text ) {

		if ( textNode.textContent !== undefined ) { // standards-compliant browsers
			textNode.textContent = text;
		}

		else { // redmond troglodytes
			textNode.data = text;
		}
	};

	// borrowed wholesale from underscore... TODO write a Anglebars-optimised version
	utils.isEqual = function ( a, b ) {
		var eq = function ( a, b, stack ) {
			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
			if (a === b) return a !== 0 || 1 / a == 1 / b;
			
			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;
			
			// Unwrap any wrapped objects.
			if (a._chain) a = a._wrapped;
			if (b._chain) b = b._wrapped;
			
			// Invoke a custom `isEqual` method if one is provided.
			if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
			if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
			
			// Compare `[[Class]]` names.
			var className = toString.call(a);
			if (className != toString.call(b)) return false;
			
			switch (className) {
				// Strings, numbers, dates, and booleans are compared by value.
				case '[object String]':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return a == String(b);
				
				case '[object Number]':
					// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
					// other numeric values.
					return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
				
				case '[object Date]':
				case '[object Boolean]':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a == +b;
				// RegExps are compared by their source patterns and flags.
				case '[object RegExp]':
					return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
			}

			if (typeof a != 'object' || typeof b != 'object') return false;
			
			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = stack.length;
			
			while (length--) {
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (stack[length] == a) return true;
			}
			
			// Add the first object to the stack of traversed objects.
			stack.push(a);

			var size = 0, result = true;
			// Recursively compare objects and arrays.
			
			if (className == '[object Array]') {
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size == b.length;
				if (result) {
					// Deep compare the contents, ignoring non-numeric properties.
					while (size--) {
					// Ensure commutative equality for sparse arrays.
						if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
					}
				}
			} else {
				// Objects with different constructors are not equivalent.
				if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
				
				// Deep compare objects.
				for (var key in a) {
					if (_.has(a, key)) {
						// Count the expected number of properties.
						size++;
						// Deep compare each member.
						if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
					}
				}

				// Ensure that both objects contain the same number of properties.
				if (result) {
					for (key in b) {
						if (_.has(b, key) && !(size--)) break;
					}
					result = !size;
				}
			}

			// Remove the first object from the stack of traversed objects.
			stack.pop();
			return result;
		};

		return eq( a, b, [] );
	};

	// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	utils.isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	};

	utils.compileStubs = function ( stubs, level, namespace, preserveWhitespace ) {
		var compiled, next, processIntermediary;

		compiled = [];

		
		processIntermediary = function ( i ) {
			var mustache, item, text, element, stub, sliceStart, sliceEnd, nesting, bit, keypath;

			stub = stubs[i];

			switch ( stub.type ) {
				case 'text':
					if ( !preserveWhitespace ) {
						if ( whitespace.test( stub.text ) || stub.text === '' ) {
							return i+1; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
						}
					}

					compiled[ compiled.length ] = stub;
					return i+1;

				case 'element':
					compiled[ compiled.length ] = utils.processElementStub( stub, level, namespace );
					return i+1;

				case 'mustache':

					keypath = stub.mustache.keypath;
					
					switch ( stub.mustache.type ) {
						case 'section':

							i += 1;
							sliceStart = i; // first item in section
							nesting = 1;

							// find end
							while ( ( i < stubs.length ) && !sliceEnd ) {
								
								bit = stubs[i];

								if ( bit.type === 'mustache' ) {
									if ( bit.mustache.type === 'section' && bit.mustache.keypath === keypath ) {
										if ( !bit.mustache.closing ) {
											nesting += 1;
										}

										else {
											nesting -= 1;
											if ( !nesting ) {
												sliceEnd = i;
											}
										}
									}
								}

								i += 1;
							}

							if ( !sliceEnd ) {
								throw new Error( 'Illegal section "' + keypath + '"' );
							}

							compiled[ compiled.length ] = {
								type: 'section',
								keypath: keypath,
								formatters: stub.mustache.formatters,
								inverted: stub.mustache.inverted,
								children: utils.compileStubs( stubs.slice( sliceStart, sliceEnd ), level + 1, namespace, preserveWhitespace ),
								level: level
							};
							return i;


						case 'triple':
							compiled[ compiled.length ] = {
								type: 'triple',
								keypath: stub.mustache.keypath,
								formatters: stub.mustache.formatters,
								level: level
							};
							return i+1;


						case 'interpolator':
							compiled[ compiled.length ] = {
								type: 'interpolator',
								keypath: stub.mustache.keypath,
								formatters: stub.mustache.formatters,
								level: level
							};
							return i+1;

						default:
							throw new Error( 'Error compiling template' );
					}
					break;

				default:
					throw new Error( 'Error compiling template' );
			}
		};

		next = 0;
		while ( next < stubs.length ) {
			next = processIntermediary( next );
		}

		return compiled;
	};

	utils.processElementStub = function ( stub, level, namespace ) {
		var proxy, attributes, numAttributes, attribute, i, node;

		node = stub.original;

		proxy = {
			type: 'element',
			tag: node.tagName,
			level: level
		};

		// inherit namespace from parent, if applicable
		if ( namespace ) {
			proxy.namespace = namespace;
		}

		// attributes
		attributes = [];
		
		numAttributes = node.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attribute = node.attributes[i];

			if ( attribute.name === 'xmlns' ) {
				proxy.namespace = attribute.value;
			} else {
				attributes[ attributes.length ] = utils.processAttribute( attribute.name, attribute.value );
			}
		}

		proxy.attributes = attributes;

		// get children
		proxy.children = utils.compileStubs( utils.getStubsFromNodes( node.childNodes ), level + 1, proxy.namespace );

		return proxy;
	};

	utils.processAttribute = function ( name, value, level ) {
		var attribute, components;

		components = utils.expandText( value );

		attribute = {
			name: name.replace( 'data-anglebars-', '' )
		};

		// no mustaches in this attribute - no extra work to be done
		if ( !utils.findMustache( value ) ) {
			attribute.value = value;
			return attribute;
		}


		// mustaches present - attribute is dynamic
		attribute.isDynamic = true;
		attribute.components = utils.compileStubs( components, 0, null );


		return attribute;
	};



}( Anglebars, document ));

