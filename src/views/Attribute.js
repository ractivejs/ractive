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