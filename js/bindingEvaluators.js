/*jslint white: true */


var bindingEvaluators = (function ( _ ) {

	'use strict';

	var evaluators = {};

	evaluators.List = function ( list, parent ) {
		var self = this;

		this.evaluators = [];

		_.each( list.items, function ( item, i ) {
			if ( item.getEvaluator ) {
				self.evaluators[i] = item.getEvaluator( this );
			}
		});
	};

	evaluators.List.prototype = {
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

	evaluators.Text = function ( text, parent ) {
		this.stringified = text.text;
	};

	evaluators.Text.prototype = {
		toString: function () {
			return this.stringified;
		}
	};

	evaluators.Interpolator = function ( interpolator, parent ) {
		this.interpolator = interpolator;
		this.binding = interpolator.binding,
		this.viewModel = this.binding.viewModel;
		this.parent = parent;
	};

	evaluators.Interpolator.prototype = {
		nudge: function () {
			this.parent.nudge();
		},

		evaluate: function ( contextStack ) {
			var self = this, value, formatted;

			contextStack = ( contextStack ? contextStack.concat() : [] );
		
			this.address = this.viewModel.getAddress( this.interpolator.keypath, contextStack );

			value = this.viewModel.get( this.address );
			formatted = this.binding._format( value, this.interpolator.formatters );

			this.stringified = formatted;

			this.subscriptionRefs = this.viewModel.subscribe( this.address, this.interpolator.level, function ( value ) {
				var formatted = self.binding._format( value, self.interpolator.formatters );
				self.stringified = formatted;
				self.nudge();
			});

			return this.stringified;
		},

		toString: function () {
			return this.stringified || this.evaluate();
		}
	};

	evaluators.Triple = evaluators.Interpolator; // same same

	evaluators.Section = function ( section, parent ) {

	};

	return evaluators;
	
}( _ ));