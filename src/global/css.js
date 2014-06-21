import circular from 'circular';
import isClient from 'config/isClient';
import removeFromArray from 'utils/removeFromArray';

var css,
	update,
	runloop,
	styleElement,
	head,
	styleSheet,
	inDom,
	prefix = '/* Ractive.js component styles */\n',
	componentsInPage = {},
	styles = [];

if ( !isClient ) {
	css = null;
} else {
	circular.push( function () {
		runloop = circular.runloop;
	});

	styleElement = document.createElement( 'style' );
	styleElement.type = 'text/css';

	head = document.getElementsByTagName( 'head' )[0];

	inDom = false;

	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	// use styleSheet.cssText instead
	styleSheet = styleElement.styleSheet;

	update = function () {
		var css;

		if ( styles.length ) {
			css = prefix + styles.join( ' ' );

			if ( styleSheet ) {
				styleSheet.cssText = css;
			} else {
				styleElement.innerHTML = css;
			}

			if ( !inDom ) {
				head.appendChild( styleElement );
			}
		}

		else if ( inDom ) {
			head.removeChild( styleElement );
		}
	};

	css = {
		add: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			if ( !componentsInPage[ Component._guid ] ) {
				// we create this counter so that we can in/decrement it as
				// instances are added and removed. When all components are
				// removed, the style is too
				componentsInPage[ Component._guid ] = 0;
				styles.push( Component.css );

				runloop.scheduleTask( update );
			}

			componentsInPage[ Component._guid ] += 1;
		},

		remove: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			componentsInPage[ Component._guid ] -= 1;

			if ( !componentsInPage[ Component._guid ] ) {
				removeFromArray( styles, Component.css );

				runloop.scheduleTask( update );
			}
		}
	};
}

export default css;
