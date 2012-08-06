/*jslint white: true */
/*global Anglebars, _ */

(function ( Anglebars, _ ) {

	'use strict';

	var evaluators = Anglebars.evaluators,
		utils = Anglebars.utils;

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
	
}( Anglebars, _ ));