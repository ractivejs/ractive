/*jslint white: true */


(function ( Anglebars, _ ) {

	'use strict';

	Anglebars.evaluators = {};

	Anglebars.evaluators.List = function ( list, parent ) {
		var self = this;

		this.evaluators = [];

		_.each( list.items, function ( item, i ) {
			if ( item.getEvaluator ) {
				self.evaluators[i] = item.getEvaluator( this );
			}
		});
	};

	Anglebars.evaluators.List.prototype = {
		evaluate: function ( contextStack ) {
			var self = this;

			this.stringified = '';
			_.each( this.evaluators, function ( evaluator ) {
				self.stringified += evaluator.evaluate( contextStack );
			});

			return this.stringified;
		},

		nudge: function () {
			this.evaluate();
			this.parent.nudge();
		},

		toString: function () {
			return this.stringified;
		}
	};

	Anglebars.evaluators.Text = function ( text, parent ) {
		this.stringified = text.text;
	};

	Anglebars.evaluators.Text.prototype = {
		toString: function () {
			return this.stringified;
		}
	};

	Anglebars.evaluators.Interpolator = function ( interpolator, parent ) {
		this.interpolator = interpolator;
		this.anglebars = interpolator.anglebars,
		this.data = this.anglebars.data;
		this.parent = parent;
	};

	Anglebars.evaluators.Interpolator.prototype = {
		nudge: function () {
			this.parent.nudge();
		},

		evaluate: function ( contextStack ) {
			var self = this, value, formatted;

			contextStack = ( contextStack ? contextStack.concat() : [] );
		
			this.address = this.data.getAddress( this.interpolator.keypath, contextStack );

			value = this.data.get( this.address );
			formatted = this.anglebars._format( value, this.interpolator.formatters );

			this.stringified = formatted;

			this.subscriptionRefs = this.data.subscribe( this.address, this.interpolator.level, function ( value ) {
				var formatted = self.anglebars._format( value, self.interpolator.formatters );
				self.stringified = formatted;
				self.nudge();
			});

			return this.stringified;
		},

		toString: function () {
			return this.stringified || this.evaluate();
		}
	};

	Anglebars.evaluators.Triple = Anglebars.evaluators.Interpolator; // same same

	Anglebars.evaluators.Section = function ( section, parent ) {

	};
	
}( Anglebars, _ ));