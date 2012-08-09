/*jslint white: true, nomen: true */
/*global _, document */

// ANGLEBARS v0.0.1
// ================
//
// by @rich_harris
// Released under the WTFPL (http://sam.zoy.org/wtfpl/)
//
// More info at http://rich-harris.github.com/Anglebars/

var Anglebars = (function ( global, _ ) {

	'use strict';

	var Anglebars,
		models,
		views,
		evaluators,
		utils,
		formulaSplitter;
	

	Anglebars = function ( o ) {
		this.initialize( o );
	};

	models = Anglebars.models = {};
	views = Anglebars.views = {};
	evaluators = Anglebars.evaluators = {};
	utils = Anglebars.utils = {};

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

			// get viewModel
			if ( o.data ) {
				if ( o.data instanceof Anglebars.ViewModel ) {
					this.data = o.data;
				} else {
					this.data = new Anglebars.ViewModel( o.data );
				}
			}

			// get formatters
			this.formatters = o.formatters;

			// get misc options
			this.preserveWhitespace = o.preserveWhitespace;

			this.compiled = this.compile();

			// empty container and render
			this.el.innerHTML = '';
			this.render();
		},

		compile: function () {
			var nodes, rootList;

			// remove all comments
			this.template = utils.stripComments( this.template );

			nodes = utils.getNodeArrayFromHtml( this.template );

			rootList = new Anglebars.models.List( utils.expandNodes( nodes ), {
				anglebars: this,
				level: 0
			});

			return rootList;
		},

		render: function () {
			if ( this.rendered ) {
				this.rendered.unrender();
			}
			this.rendered = this.compiled.render( this.el );
		},

		// shortcuts
		set: function () {
			return this.data.set.apply( this.data, arguments );
		},

		get: function () {
			return this.data.get.apply( this.data, arguments );
		},

		update: function () {
			return this.data.update.apply( this.data, arguments );
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






	Anglebars.ViewModel = function ( o ) {
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

	Anglebars.ViewModel.prototype = {
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

				if ( !_.isEqual( previous, value ) ) {
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

			if ( _.isArray( result ) && !result.isAnglebarsArray ) {
				this.makeAnglebarsArray( result, address );
			}

			return result;
		},

		update: function ( address ) {
			var value = this.get( address );
			this.publish( address, value );
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

				// remove the last item in the address, so that viewModel.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
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
		},

		makeAnglebarsArray: function ( array, address ) {
			var arrayProto = Array.prototype, vm = this, update;

			update = function ( method, args ) {
				vm.update( address );
			};

			_.each( [ 'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice' ], function ( method ) {
				array[ method ] = function () {
					var result = arrayProto[ method ].apply( array, arguments );
					update();
					return result;
				};
			});

			array.isAnglebarsArray = true;
		}
	};






	models.List = function ( expandedNodes, parent ) {
		this.expanded = expandedNodes;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;
		this.contextStack = parent.contextStack;

		this.compile();
	};

	models.List.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.List( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.List( this, parent, contextStack );
		},

		add: function ( item ) {
			this.items[ this.items.length ] = item;
		},

		compile: function () {
			var next;

			// create empty children array
			this.items = [];

			// walk through the list of child nodes, building sections as we go
			next = 0;
			while ( next < this.expanded.length ) {
				next = this.createItem( next );
			}

			// we don't need the expanded nodes any more
			delete this.expanded;
		},

		createItem: function ( i ) {
			var mustache, item, text, element, start, sliceStart, sliceEnd, nesting, bit, keypath;

			start = this.expanded[i];

			switch ( start.type ) {
				case 'text':
					this.add( new models.Text( start.text, this ) );
					return i+1;

				case 'element':
					this.add( new models.Element( start.original, this ) );
					return i+1;

				case 'mustache':
					
					switch ( start.mustache.type ) {
						case 'section':

							i += 1;
							sliceStart = i; // first item in section
							keypath = start.mustache.keypath;
							nesting = 1;

							// find end
							while ( ( i < this.expanded.length ) && !sliceEnd ) {
								
								bit = this.expanded[i];

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

							this.add( new models.Section( start.mustache, this.expanded.slice( sliceStart, sliceEnd ), this ) );
							return i;


						case 'triple':

							this.add( new models.Triple( start.mustache, this ) );
							return i+1;


						case 'interpolator':

							this.add( new models.Interpolator( start.mustache, this ) );
							return i+1;

						default:

							console.warn( 'errr...' );
							return i+1;
					}
					break;

				default:
					console.warn( 'errr...' );
					break;
			}
		}
	};

	models.Section = function ( mustache, expandedNodes, parent ) {

		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;

		this.inverted = mustache.inverted;

		this.list = new models.List( expandedNodes, this );
	};

	models.Section.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Section( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Section( this, parent, contextStack );
		}
	};

	models.Text = function ( text, parent ) {
		this.text = text;

		// TODO these are no longer self-adding, so non whitespace preserving empties need to be handled another way
		if ( /^\s+$/.test( text ) || text === '' ) {
			if ( !parent.anglebars.preserveWhitespace ) {
				return; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
			}
		}
	};

	models.Text.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Text( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Text( this, parent, contextStack );
		}
	};

	models.Interpolator = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	models.Interpolator.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Interpolator( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Interpolator( this, parent, contextStack );
		}
	};

	models.Triple = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	models.Triple.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Triple( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Interpolator( this, parent, contextStack ); // Triples are the same as Interpolators in this context
		}
	};

	models.Element = function ( original, parent ) {
		this.type = original.tagName;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;


		this.getAttributes( original );


		if ( original.childNodes.length ) {
			this.children = new models.List( utils.expandNodes( original.childNodes ), this );
		}
	};

	models.Element.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Element( this, parentNode, contextStack, anchor );
		},

		getAttributes: function ( original ) {
			var i, numAttributes, attribute;

			this.attributes = [];

			numAttributes = original.attributes.length;
			for ( i=0; i<numAttributes; i+=1 ) {
				attribute = original.attributes[i];
				this.attributes[i] = new models.Attribute( attribute.name, attribute.value, this.anglebars, this.level );
			}
		}
	};

	models.Attribute = function ( name, value, anglebars, level ) {
		var components = utils.expandText( value );

		this.name = name;
		if ( !utils.findMustache( value ) ) {
			this.value = value;
			return;
		}

		this.isDynamic = true;
		this.list = new models.List( components, {
			anglebars: anglebars,
			level: level + 1
		});
	};

	models.Attribute.prototype = {
		render: function ( node, contextStack ) {
			return new views.Attribute( this, node, contextStack );
		}
	};





	var views = Anglebars.views,
		utils = Anglebars.utils;

	views.List = function ( list, parentNode, contextStack, anchor ) {
		var self = this;

		this.items = [];

		_.each( list.items, function ( item, i ) {
			self.items[i] = item.render( parentNode, contextStack, anchor );
		});
	};

	views.List.prototype = {
		teardown: function () {
			// TODO unsubscribes
			_.each( this.items, function ( item ) {
				item.teardown();
			});

			delete this.items; // garbage collector, ATTACK!
		}
	};

	views.Text = function ( textItem, parentNode, contextStack, anchor ) {
		this.node = document.createTextNode( textItem.text );
		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		}
	};

	views.Section = function ( section, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formatted,
			anglebars = section.anglebars,
			data = anglebars.data;

		this.section = section;
		this.anglebars = section.anglebars;
		this.formatters = section.formatters;
		this.contextStack = contextStack || [];
		this.data = data;
		this.views = [];
		
		this.parentNode = parentNode;
		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor );

		data.getAddress( this, section.keypath, contextStack, function ( address ) {
			unformatted = data.get( address );
			formatted = anglebars.format( unformatted, section.formatters );

			this.update( formatted );

			// subscribe to changes
			this.subscriptionRefs = data.subscribe( address, section.level, function ( value ) {
				var formatted = anglebars.format( value, section.formatters );
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
			var emptyArray, i, viewsToTeardown;

			// treat empty arrays as false values
			if ( _.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.section.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.views[0] = this.section.list.render( this.parentNode, this.contextStack, this.anchor );
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
					if ( _.isArray( value ) ) {
						if ( emptyArray ) {
							return;
						}

						for ( i=0; i<value.length; i+=1 ) {
							this.views[i] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address + '.' + i ), this.anchor );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.views[0] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.views[0] = this.section.list.render( this.parentNode, this.contextStack, this.anchor );
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

	views.Interpolator = function ( interpolator, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			anglebars = interpolator.anglebars,
			data = anglebars.data;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		
		this.node = document.createTextNode( '' );
		this.data = data;
		this.keypath = interpolator.keypath;
		this.contextStack = contextStack;

		data.getAddress( this, interpolator.keypath, contextStack, function ( address ) {
			value = data.get( address );
			formatted = anglebars.format( value, interpolator.formatters );

			this.update( formatted );

			this.subscriptionRefs = data.subscribe( address, interpolator.level, function ( value ) {
				var formatted = anglebars.format( value, interpolator.formatters );
				self.update( formatted );
			});
		});
		

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
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
			this.node.textContent = value;
		}
	};

	views.Triple = function ( triple, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			anglebars = triple.anglebars,
			data = anglebars.data,
			nodes;

		this.nodes = [];
		this.data = data;

		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor );

		data.getAddress( this, triple.keypath, contextStack, function ( address ) {
			// subscribe to data changes
			this.subscriptionRefs = data.subscribe( address, triple.level, function ( value ) {
				var formatted = anglebars.format( value, triple.formatters );
				self.update( formatted );
			});

			unformatted = data.get( address );
			formattedHtml = anglebars.format( unformatted, triple.formatters );

			this.update( formattedHtml );
		});
	};

	views.Triple.prototype = {
		teardown: function () {
			// TODO unsubscribes
			_.each( this.nodes, utils.remove );


			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		update: function ( value ) {
			var self = this;

			if ( _.isEqual( this.value, value ) ) {
				return;
			}

			// remove existing nodes
			_.each( this.nodes, utils.remove );

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( value );

			_.each( this.nodes, function ( node ) {
				utils.insertBefore( self.anchor, node );
			});
		}
	};

	views.Element = function ( elementModel, parentNode, contextStack, anchor ) {

		var self = this,
			unformatted,
			formattedHtml,
			anglebars = elementModel.anglebars,
			data = anglebars.data,
			i,
			numAttributes,
			numItems,
			attributeModel,
			item,
			nodes;

		// stuff we'll need later
		this.data = data;

		// create the DOM node
		this.node = document.createElement( elementModel.type );
		
		// set attributes
		this.attributes = [];
		numAttributes = elementModel.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attributeModel = elementModel.attributes[i];
			this.attributes[i] = attributeModel.render( this.node, contextStack );
		}

		// append children
		if ( elementModel.children ) {
			this.children = [];
			numItems = elementModel.children.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				item = elementModel.children.items[i];
				this.children[i] = item.render( this.node, contextStack );
			}
		}

		// two-way data binding
		if ( elementModel.type === 'INPUT' ) {
			this.setupChangeHandlers();
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
	};

	views.Element.prototype = {
		teardown: function () {
			_.each( this.attributes, function ( attributeView ) {
				attributeView.teardown();
			});
			utils.remove( this.node );
		},

		setupChangeHandlers: function () {
			var address = this.node.getAttribute( 'data-bind' ), data = this.data, inputType;

			inputType = this.node.getAttribute( 'type' ) || 'text';

			this.changeListener = this.node.addEventListener( 'change', function () {
				data.set( address, this.value );
			});

			this.changeListener = this.node.addEventListener( 'keyup', function () {
				data.set( address, this.value );
			});
		}
	};

	views.Attribute = function ( attributeModel, node, contextStack ) {
		
		var i, numItems, item;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !attributeModel.isDynamic ) {
			node.setAttribute( attributeModel.name, attributeModel.value );
			return;
		}

		// otherwise we need to do some work
		this.attributeModel = attributeModel;
		this.node = node;
		this.name = attributeModel.name;

		this.anglebars = attributeModel.anglebars;
		this.data = attributeModel.data;

		this.evaluators = [];

		numItems = attributeModel.list.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			item = attributeModel.list.items[i];
			this.evaluators[i] = item.getEvaluator( this, contextStack );
		}

		// update...
		this.update();

		// and watch for changes TODO
	};

	views.Attribute.prototype = {
		teardown: function () {
			_.each( this.evaluators, function ( evaluator ) {
				if ( evaluator.teardown ) {
					evaluator.teardown();
				}
			});
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			this.node.setAttribute( this.name, this.toString() );
		},

		toString: function () {
			var string = '', i, numEvaluators, evaluator;

			numEvaluators = this.evaluators.length;
			for ( i=0; i<numEvaluators; i+=1 ) {
				evaluator = this.evaluators[i];
				string += evaluator.toString();
			}

			return string;
		}
	};





	_.extend( utils, {
		// replacement for the dumbass DOM equivalent
		insertBefore: function ( referenceNode, newNode ) {
			if ( !referenceNode ) {
				throw new Error( 'Can\'t insert before a non-existent node' );
			}

			return referenceNode.parentNode.insertBefore( newNode, referenceNode );
		},

		insertAfter: function ( referenceNode, newNode ) {
			if ( !referenceNode ) {
				throw new Error( 'Can\'t insert before a non-existent node' );
			}

			return referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
		},

		remove: function ( node ) {
			if ( node.parentNode ) {
				node.parentNode.removeChild( node );
			}
		},

		trim: function ( text ) {
			var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
			return trimmed;
		},

		getNodeArrayFromHtml: function ( innerHTML ) {

			var parser, temp, i, numNodes, nodes = [];

			// test for DOMParser support
			// TODO

			temp = document.createElement( 'div' );
			temp.innerHTML = innerHTML;

			// create array from node list, as node lists have some undesirable properties
			numNodes = temp.childNodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				nodes[i] = temp.childNodes[i];
			}

			return nodes;
		},

		getEl: function ( input ) {
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
		},

		stripComments: function ( input ) {
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
		},

		createAnchor: function () {
			var anchor = document.createElement( 'a' );
			anchor.setAttribute( 'class', 'anglebars-anchor' );

			return anchor;
		},

		nodeListToArray: function ( nodes ) {
			var i, numNodes = nodes.length, result = [];

			for ( i=0; i<numNodes; i+=1 ) {
				result[i] = nodes[i];
			}

			return result;
		},

		attributeListToArray: function ( attributes ) {
			var i, numAttributes = attributes.length, result = [];

			for ( i=0; i<numAttributes; i+=1 ) {
				result[i] = {
					name: attributes[i].name,
					value: attributes[i].value
				};
			}

			return result;
		},

		findMustache: function ( text, startIndex ) {

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
		},

		findMatch: function ( text, pattern, startIndex ) {

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
		},

		expandNodes: function ( nodes ) {
			var i, numNodes, node, result = [];

			numNodes = nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				node = nodes[i];

				if ( node.nodeType !== 3 ) {
					result[ result.length ] = {
						type: 'element',
						original: node
					};
				}

				else {
					result = result.concat( utils.expandText( node.textContent ) );
				}
			}

			return result;
		},

		expandText: function ( text ) {
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
		}
	});






	utils.inherit = function ( item, model, parent ) {
		item.model = model;
		item.keypath = model.keypath;
		item.formatters = model.formatters;
		item.anglebars = model.anglebars;
		item.data = model.anglebars.data;

		item.parent = parent;
		
	};

	evaluators.List = function ( list, parent, contextStack ) {
		var self = this;

		this.evaluators = [];
		
		_.each( list.items, function ( model, i ) {
			if ( model.getEvaluator ) {
				self.evaluators[i] = model.getEvaluator( self, contextStack );
			}
		});

		this.stringified = this.evaluators.join('');
	};

	evaluators.List.prototype = {
		bubble: function () {
			this.stringified = this.evaluators.join('');
			this.parent.bubble();
		},

		teardown: function () {
			_.each( this.evaluators, function ( evaluator ) {
				evaluator.teardown();
			});
		},

		toString: function () {
			return this.stringified;
		}
	};

	evaluators.Text = function ( text, parent, contextStack ) {
		this.stringified = text.text;
	};

	evaluators.Text.prototype = {
		toString: function () {
			return this.stringified;
		}
	};

	evaluators.Interpolator = function ( interpolator, parent, contextStack ) {
		// this.interpolator = interpolator;
		// this.keypath = interpolator.keypath;
		// this.anglebars = interpolator.anglebars,
		// this.data = this.anglebars.data;
		// this.parent = parent;

		utils.inherit( this, interpolator, parent );

		this.data.getAddress( this, this.keypath, contextStack, function ( address ) {
			var value, formatted, self = this;

			value = this.data.get( this.address );
			formatted = this.anglebars.format( value, this.formatters ); // TODO is it worth storing refs to keypath and formatters on the evaluator?

			this.stringified = formatted;

			this.subscriptionRefs = this.data.subscribe( this.address, this.model.level, function ( value ) {
				var formatted = self.anglebars.format( value, self.model.formatters );
				self.stringified = formatted;
				self.bubble();
			});
		});
	};

	evaluators.Interpolator.prototype = {
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

	evaluators.Triple = evaluators.Interpolator; // same same

	evaluators.Section = function ( section, parent, contextStack ) {
		utils.inherit( this, section, parent );
		this.contextStack = contextStack;

		this.views = [];

		this.data.getAddress( this, this.keypath, contextStack, function ( address ) {
			var value, formatted, self = this;

			value = this.data.get( this.address );
			formatted = this.anglebars.format( value, this.formatters ); // TODO is it worth storing refs to keypath and formatters on the evaluator?

			this.update( formatted );

			this.subscriptionRefs = this.data.subscribe( this.address, this.model.level, function ( value ) {
				var formatted = self.anglebars.format( value, self.model.formatters );
				self.update( formatted );
				self.bubble();
			});
		});
	};

	evaluators.Section.prototype = {
		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {

		},

		update: function ( value ) {
			var emptyArray, i;

			console.log( 'updating ', this, ' with value ', value );

			// treat empty arrays as false values
			if ( _.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.views = [];
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.views[0] = this.model.list.getEvaluator( this, this.contextStack );
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
						this.views = [];
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( _.isArray( value ) && !emptyArray ) {
						for ( i=0; i<value.length; i+=1 ) {
							this.views[i] = this.model.list.getEvaluator( this, this.contextStack.concat( this.address + '.' + i ) );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.views[0] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.views[0] = this.model.list.getEvaluator( this, this.contextStack );
							this.rendered = true;
						}
					}

					else {
						if ( this.rendered ) {
							this.views = [];
							this.rendered = false;
						}
					}
			}
		},

		toString: function () {
			return this.views.join( '' );
		}
	};

	return Anglebars;
	
}( this, _ ));