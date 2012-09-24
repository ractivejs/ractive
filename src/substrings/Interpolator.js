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