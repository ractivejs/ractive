/*jslint white: true */


(function ( Anglebars, _ ) {

	'use strict';

	var evaluators = Anglebars.evaluators;

	evaluators.List = function ( list, parent, contextStack ) {
		var self = this;

		this.evaluators = [];
		
		_.each( list.items, function ( item, i ) {
			if ( item.getEvaluator ) {
				self.evaluators[i] = item.getEvaluator( this, contextStack );
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
		var self = this, value, formatted;

		this.interpolator = interpolator;
		this.keypath = interpolator.keypath;
		this.contextStack = contextStack;
		this.anglebars = interpolator.anglebars,
		this.data = this.anglebars.data;
		this.parent = parent;

		this.data.getAddress( this, this.interpolator.keypath, contextStack, function ( address ) {
			value = this.data.get( this.address );
			formatted = this.anglebars._format( value, this.interpolator.formatters );

			this.stringified = formatted;

			this.subscriptionRefs = this.data.subscribe( this.address, this.interpolator.level, function ( value ) {
				var formatted = self.anglebars._format( value, self.interpolator.formatters );
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

	};
	
}( Anglebars, _ ));