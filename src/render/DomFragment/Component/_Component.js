define([
	'render/DomFragment/Component/initialise/_initialise',
	'render/shared/utils/getNewKeypath'
], function (
	initialise,
	getNewKeypath
) {

	'use strict';

	var DomComponent = function ( options, docFrag ) {
		initialise( this, options, docFrag );
	};

	DomComponent.prototype = {
		firstNode: function () {
			return this.instance.fragment.firstNode();
		},

		findNextNode: function () {
			return this.parentFragment.findNextNode( this );
		},

		detach: function () {
			return this.instance.fragment.detach();
		},

		teardown: function ( destroy ) {
			while ( this.complexParameters.length ) {
				this.complexParameters.pop().teardown();
			}

			while ( this.bindings.length ) {
				this.bindings.pop().teardown();
			}

			removeFromLiveComponentQueries( this );

			// Add this flag so that we don't unnecessarily destroy the component's nodes
			this.shouldDestroy = destroy;
			this.instance.teardown();
		},

		reassign: function( indexRef, newIndex, oldKeypath, newKeypath ) {
			var childInstance = this.instance, 
				parentInstance = childInstance._parent, 
				indexRefAlias, query;

			this.bindings.forEach( function ( binding ) {
				var updated;

				if ( binding.root !== parentInstance ) {
					return; // we only want parent -> child bindings for this
				}

				if ( binding.keypath === indexRef ) {
					childInstance.set( binding.otherKeypath, newIndex );
				}

				if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
					binding.reassign( updated );
				}
			});

			if ( indexRefAlias = this.indexRefBindings[ indexRef ] ) {
				childInstance.set( indexRefAlias, newIndex );
			}

			if ( query = this.root._liveComponentQueries[ this.name ] ) {
				query._makeDirty();
			}
		},

		toString: function () {
			return this.instance.fragment.toString();
		},

		find: function ( selector ) {
			return this.instance.fragment.find( selector );
		},

		findAll: function ( selector, query ) {
			return this.instance.fragment.findAll( selector, query );
		},

		findComponent: function ( selector ) {
			if ( !selector || ( selector === this.name ) ) {
				return this.instance;
			}

			if ( this.instance.fragment ) {
				return this.instance.fragment.findComponent( selector );
			}

			return null;
		},

		findAllComponents: function ( selector, query ) {
			query._test( this, true );

			if ( this.instance.fragment ) {
				this.instance.fragment.findAllComponents( selector, query );
			}
		}
	};

	return DomComponent;


	function removeFromLiveComponentQueries ( component ) {
		var instance, query;

		instance = component.root;

		do {
			if ( query = instance._liveComponentQueries[ component.name ] ) {
				query._remove( component );
			}
		} while ( instance = instance._parent );
	}

});
