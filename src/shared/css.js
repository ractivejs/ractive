define([

], function (

) {

	'use strict';

	var styleElement, usedStyles = [], updateStyleElement;

	updateStyleElement = function () {
		var css = '/* Ractive.js component styles */\n' + usedStyles.join( ' ' );

		if ( styleElement.styleSheet ) { // IE
			styleElement.styleSheet.cssText =css;
		} else {
			styleElement.innerHTML =css;
		}
	};

	return {
		add: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			if ( !styleElement ) {
				styleElement = document.createElement( 'style' );
				styleElement.type = 'text/css';
				document.getElementsByTagName( 'head' )[0].appendChild( styleElement );
			}

			if ( !usedStyles[ Component._guid ] ) {
				// we create this counter so that we can in/decrement it as
				// instances are added and removed. When all components are
				// removed, the style is too
				usedStyles[ Component._guid ] = 0;
				usedStyles.push( Component.css );

				updateStyleElement();
			}

			usedStyles[ Component._guid ] += 1;
		},

		remove: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			usedStyles[ Component._guid ] -= 1;

			if ( !usedStyles[ Component._guid ] ) {
				usedStyles.splice( usedStyles.indexOf( Component.css ), 1 );

				if ( usedStyles.length ) {
					updateStyleElement();
				} else {
					styleElement.parentNode.removeChild( styleElement );
					styleElement = null;
				}
			}
		}
	};

});
