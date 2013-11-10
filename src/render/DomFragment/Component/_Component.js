define([
	'config/types',
	'shared/resolveRef',
	'render/DomFragment/Component/getComponentConstructor',
	'render/StringFragment/_StringFragment'
], function (
	types,
	resolveRef,
	getComponentConstructor,
	StringFragment
) {

	'use strict';

	var DomComponent,

		// helpers
		ComponentParameter;

	// TODO support server environments
	DomComponent = function ( options, docFrag ) {
		var self = this,
			parentFragment = this.parentFragment = options.parentFragment,
			root,
			Component,
			twoway,
			partials,
			instance,
			keypath,
			data,
			mappings,
			i,
			pair,
			observeParent,
			observeChild,
			settingParent,
			settingChild,
			key,
			initFalse,
			processKeyValuePair,
			eventName,
			propagateEvent,
			items;

		root = parentFragment.root;

		this.type = types.COMPONENT;
		this.name = options.descriptor.r;
		this.index = options.index;

		Component = getComponentConstructor( parentFragment.root, options.descriptor.e );

		if ( !Component ) {
			throw new Error( 'Component "' + options.descriptor.e + '" not found' );
		}

		twoway = ( Component.twoway !== false );

		data = {};
		mappings = [];

		this.complexParameters = [];

		processKeyValuePair = function ( key, value ) {
			var parameter;

			// if this is a static value, great
			if ( typeof value === 'string' ) {
				try {
					data[ key ] = JSON.parse( value );
				} catch ( err ) {
					data[ key ] = value;
				}
				return;
			}

			// if null, we treat it as a boolean attribute (i.e. true)
			if ( value === null ) {
				data[ key ] = true;
				return;
			}

			// if a regular interpolator, we bind to it
			if ( value.length === 1 && value[0].t === types.INTERPOLATOR && value[0].r ) {
				
				// is it an index reference?
				if ( parentFragment.indexRefs && parentFragment.indexRefs[ value[0].r ] !== undefined ) {
					data[ key ] = parentFragment.indexRefs[ value[0].r ];
					return;
				}

				keypath = resolveRef( root, value[0].r, parentFragment.contextStack ) || value[0].r;

				data[ key ] = root.get( keypath );
				mappings[ mappings.length ] = [ key, keypath ];
				return;
			}

			parameter = new ComponentParameter( root, self, key, value, parentFragment.contextStack );
			self.complexParameters[ self.complexParameters.length ] = parameter;

			data[ key ] = parameter.value;
		};

		if ( options.descriptor.a ) {
			for ( key in options.descriptor.a ) {
				if ( options.descriptor.a.hasOwnProperty( key ) ) {
					processKeyValuePair( key, options.descriptor.a[ key ] );
				}
			}
		}

		partials = {};
		if ( options.descriptor.f ) {
			partials.content = options.descriptor.f;
		}

		// TODO don't clone parent node - instead use a document fragment (and pass in the namespaceURI
		// of the parent node, for SVG purposes) and insert contents that way?
		instance = this.instance = new Component({
			el: parentFragment.parentNode.cloneNode( false ), // to ensure correct namespaceURL
			data: data,
			partials: partials
		});

		// Need this to find the first node *after* the component
		instance.component = this;

		while ( instance.el.firstChild ) {
			docFrag.appendChild( instance.el.firstChild );
		}

		// reset node references...
		// TODO this is a filthy hack! Need to come up with a neater solution
		instance.el = parentFragment.parentNode;
		items = instance.fragment.items;
		if ( items ) {
			i = items.length;
			while ( i-- ) {
				if ( items[i].parentNode ) {
					items[i].parentNode = parentFragment.parentNode;
				}
			}
		}

		self.observers = [];
		initFalse = { init: false };

		observeParent = function ( pair ) {
			var observer = root.observe( pair[1], function ( value ) {
				if ( !settingParent ) {
					settingChild = true;
					instance.set( pair[0], value );
					settingChild = false;
				}
			}, initFalse );

			self.observers[ self.observers.length ] = observer;
		};

		if ( twoway ) {
			observeChild = function ( pair ) {
				var observer = instance.observe( pair[0], function ( value ) {
					if ( !settingChild ) {
						settingParent = true;
						root.set( pair[1], value );
						settingParent = false;
					}
				}, initFalse );

				self.observers[ self.observers.length ] = observer;

				// initialise
				root.set( pair[1], instance.get( pair[0] ) );
			};
		}
		

		i = mappings.length;
		while ( i-- ) {
			pair = mappings[i];

			observeParent( pair );

			if ( twoway ) {
				observeChild( pair );
			}
		}


		// proxy events
		propagateEvent = function ( eventName, proxy ) {
			instance.on( eventName, function () {
				var args = Array.prototype.slice.call( arguments );
				args.unshift( proxy );

				root.fire.apply( root, args );
			});
		};

		if ( options.descriptor.v ) {
			for ( eventName in options.descriptor.v ) {
				if ( options.descriptor.v.hasOwnProperty( eventName ) ) {
					propagateEvent( eventName, options.descriptor.v[ eventName ] );
				}
			}
		}
	};

	DomComponent.prototype = {
		firstNode: function () {
			return this.instance.fragment.firstNode();
		},

		findNextNode: function () {
			return this.parentFragment.findNextNode( this );
		},

		teardown: function () {
			while ( this.complexParameters.length ) {
				this.complexParameters.pop().teardown();
			}

			while ( this.observers.length ) {
				this.observers.pop().cancel();
			}
			
			this.instance.teardown();
		},

		toString: function () {
			return this.instance.fragment.toString();
		}
	};


	ComponentParameter = function ( root, component, key, value, contextStack ) {
		
		this.parentFragment = component.parentFragment;
		this.component = component;
		this.key = key;

		this.fragment = new StringFragment({
			descriptor:   value,
			root:         root,
			owner:        this,
			contextStack: contextStack
		});

		this.selfUpdating = this.fragment.isSimple();
		this.value = this.fragment.getValue();
	};

	ComponentParameter.prototype = {
		bubble: function () {
			// If there's a single item, we can update the component immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred component, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred && this.ready ) {
				this.root._defAttrs[ this.root._defAttrs.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value = this.fragment.getValue();

			this.component.set( this.key, value );
			this.value = value;
		}
	};

	return DomComponent;

});