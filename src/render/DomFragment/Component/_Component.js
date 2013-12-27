define([
	'render/DomFragment/Component/initialise/_initialise'
], function (
	initialise
) {

	'use strict';

	var DomComponent = function ( options, docFrag ) {
		// TODO support server environments?
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

		teardown: function () {
			var query;

			while ( this.complexParameters.length ) {
				this.complexParameters.pop().teardown();
			}

			while ( this.observers.length ) {
				this.observers.pop().cancel();
			}

			if ( query = this.root._liveComponentQueries[ this.name ] ) {
				query._remove( this );
			}

			this.instance.teardown();
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

});